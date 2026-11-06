// Recebe o webhook da Cakto (evento purchase_approved) e faz duas coisas com a compra aprovada:
// 1. guarda só primeiro nome, plano e valor, para os avisos de compra da página (nada de e-mail,
//    telefone ou sobrenome);
// 2. envia o Purchase à API de Conversões da Meta (e-mail e celular em hash), uma vez por pedido, e
//    marca o celular em hash por 7 dias para o Clic CRM não mandar outro Purchase (api/compra-pagina.mjs).
// Variáveis na Vercel: CAKTO_WEBHOOK_SECRET, as do Upstash Redis (KV_REST_API_URL/KV_REST_API_TOKEN
// ou UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN) e as da Meta (veja api/_meta.mjs).
import { createHmac, timingSafeEqual } from 'node:crypto';
import { montarEvento, enviarMeta, hashesDoCelular } from './_meta.mjs';
import { CODIGO } from './sessao.mjs';

const CHAVE = 'vb:vendas';
const GUARDAR = 30;
const JANELA_MS = 48 * 60 * 60 * 1000;
// Grava uma única vez por pedido, sem renovar a data nas retentativas da Cakto.
const GRAVAR = `
if redis.call('EXISTS', KEYS[2]) == 1 then return 0 end
redis.call('LPUSH', KEYS[1], ARGV[1])
redis.call('LTRIM', KEYS[1], 0, ARGV[2])
redis.call('EXPIRE', KEYS[1], ARGV[3])
redis.call('SET', KEYS[2], '1', 'EX', ARGV[3])
return 1`;
// Código de cada checkout da página (pay.cakto.com.br/<código>_...).
const META_MS = 7 * 24 * 60 * 60 * 1000;
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
    signal: AbortSignal.timeout(5000),
  }).then(async (r) => {
    if (!r.ok) throw new Error(`redis ${r.status}`);
    const resposta = await r.json();
    if (resposta.error || (Array.isArray(resposta) && resposta.some((item) => item.error))) throw new Error('redis comando');
    return resposta;
  });
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
  const valido = ts || assinatura ? assinaturaValida(segredo, ts || '', assinatura || '', bruto) : igual(corpo?.secret ?? '', segredo);
  if (!valido) return json(401, { erro: 'origem não confirmada' });

  if (corpo?.event !== 'purchase_approved') return json(200, { ok: true, ignorado: 'evento' });
  const pedidos = Array.isArray(corpo.data) ? corpo.data : [corpo.data];
  let recebidos = 0, meta = 0, guardarFalhou = false, metaFalhou = false;
  for (const d of pedidos) {
    if (d?.status !== 'paid' || (d.offer_type && d.offer_type !== 'main')) continue;
    const plano = Object.hasOwn(OFERTAS, d.offer?.id) ? OFERTAS[d.offer.id] : null;
    const id = typeof d.id === 'string' ? d.id : '';
    const em = Date.parse(d.paidAt);
    const idade = Date.now() - em;

    // Produto fora da página: só o "Testar" da Cakto, que vira evento de teste na Meta se houver código.
    if (!plano) {
      if (process.env.META_TEST_EVENT_CODE) {
        const r = await enviarMeta(montarEvento(d, null, { teste: true }), { teste: true });
        meta += r.ok ? 1 : 0;
      }
      continue;
    }

    const nome = primeiroNome(d.customer?.name);
    if (nome && id && id.length <= 128 && Number.isFinite(em) && idade >= 0 && idade <= JANELA_MS) {
      const valor = typeof d.amount === 'number' || typeof d.amount === 'string' ? Number(d.amount) : NaN;
      const registro = JSON.stringify({ nome, plano, em, id, ...(Number.isFinite(valor) && valor > 0 ? { valor } : {}) });
      try {
        const { result } = await db('', ['EVAL', GRAVAR, '2', CHAVE, `${CHAVE}:${id}`, registro, String(GUARDAR - 1), String(JANELA_MS / 1000)]);
        recebidos += Number(result) === 1 ? 1 : 0;
      } catch { guardarFalhou = true; }
    }

    // Purchase na Meta: uma vez por pedido. Nas retentativas da Cakto, a marca impede o reenvio;
    // se o Redis falhar, o mesmo event_id deixa a Meta descartar a repetição.
    if (!process.env.META_CAPI_TOKEN || !id || id.length > 128 || !Number.isFinite(em) || idade > META_MS) continue;
    const marca = `vb:meta:${id}`;
    const jaFoi = await db('', ['EXISTS', marca]).then(({ result }) => Number(result) === 1, () => false);
    if (jaFoi) continue;
    const sessao = await lerSessao(db, d.callback);
    const r = await enviarMeta(montarEvento(d, sessao, { plano }));
    if (r.ok) {
      meta += 1;
      const marcas = hashesDoCelular(d.customer?.phone).map((h) => ['SET', `vb:compra-tel:${h}`, '1', 'EX', String(META_MS / 1000)]);
      await db('/pipeline', [['SET', marca, '1', 'EX', String(META_MS / 1000)], ...marcas]).catch(() => {});
    } else if (r.temporario) metaFalhou = true;
  }
  // Erro devolvido = a Cakto reenvia o webhook; os avisos e a marca da Meta impedem repetição.
  if (guardarFalhou) return json(503, { erro: 'armazenamento indisponível' });
  if (metaFalhou) return json(502, { erro: 'meta indisponível' });
  return json(200, { ok: true, recebidos, meta });
}

async function lerSessao(db, codigo) {
  if (!CODIGO.test(String(codigo || ''))) return null;
  try {
    const { result } = await db('', ['GET', `vb:sessao:${codigo}`]);
    return result ? JSON.parse(result) : null;
  } catch { return null; }
}
