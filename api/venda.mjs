// Recebe o webhook da Cakto (evento purchase_approved) e guarda só o primeiro nome e o plano
// da compra aprovada, para os avisos de compra da página. Nada de e-mail, telefone ou sobrenome.
// Variáveis na Vercel: CAKTO_WEBHOOK_SECRET e as do Upstash Redis (KV_REST_API_URL/KV_REST_API_TOKEN
// ou UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN).
import { createHmac, timingSafeEqual } from 'node:crypto';

const CHAVE = 'vb:vendas';
const GUARDAR = 30;
// Código de cada checkout da página (pay.cakto.com.br/<código>_...).
const OFERTAS = { eycvgvx: 'mensal', pb4q7ss: 'trimestral', n4cinqr: 'semestral', '5phanuz': 'anual' };

const json = (status, corpo) => new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json' } });

function igual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

function assinaturaValida(segredo, ts, assinatura, bruto) {
  const agora = Math.floor(Date.now() / 1000);
  if (!/^\d+$/.test(ts) || Math.abs(agora - Number(ts)) > 300) return false;
  const esperado = 'v1=' + createHmac('sha256', segredo).update(`${ts}.${bruto}`).digest('hex');
  return igual(assinatura.trim(), esperado);
}

function planoPorValor(valor) {
  const v = Number(valor);
  if (!(v > 0)) return null;
  if (v < 45) return 'mensal';
  if (v < 85) return 'trimestral';
  if (v < 125) return 'semestral';
  if (v < 200) return 'anual';
  return null;
}

function primeiroNome(nome) {
  const p = String(nome || '').trim().split(/\s+/)[0].replace(/[^\p{L}'-]/gu, '');
  if (p.length < 2 || p.length > 20) return null;
  return p.charAt(0).toLocaleUpperCase('pt-BR') + p.slice(1).toLocaleLowerCase('pt-BR');
}

export function redis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return (caminho, comandos) => fetch(url.replace(/\/$/, '') + caminho, {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(comandos),
  }).then((r) => { if (!r.ok) throw new Error(`redis ${r.status}`); return r.json(); });
}

export async function POST(request) {
  const segredo = process.env.CAKTO_WEBHOOK_SECRET;
  const db = redis();
  if (!segredo || !db) return json(503, { erro: 'não configurado' });

  const bruto = await request.text();
  let corpo;
  try { corpo = JSON.parse(bruto); } catch { return json(400, { erro: 'json inválido' }); }

  const ts = request.headers.get('x-cakto-timestamp');
  const assinatura = request.headers.get('x-cakto-signature');
  const valido = ts && assinatura ? assinaturaValida(segredo, ts, assinatura, bruto) : igual(corpo?.secret ?? '', segredo);
  if (!valido) return json(401, { erro: 'origem não confirmada' });

  const d = corpo?.data || {};
  if (corpo.event !== 'purchase_approved' || (d.status && d.status !== 'paid')) return json(200, { ok: true, ignorado: 'evento' });

  const plano = OFERTAS[d.offer?.id] || planoPorValor(d.baseAmount ?? d.amount);
  const nome = primeiroNome(d.customer?.name);
  if (!plano || !nome) return json(200, { ok: true, ignorado: 'dados' });

  const registro = JSON.stringify({ nome, plano, em: Date.now(), id: String(d.id || d.refId || '') });
  await db('/pipeline', [['LPUSH', CHAVE, registro], ['LTRIM', CHAVE, '0', String(GUARDAR - 1)]]);
  return json(200, { ok: true });
}
