// Guarda por 7 dias os dados do navegador de quem clicou em comprar (fbp, fbc, IP e navegador),
// com um código aleatório que vai no link do checkout (?callback=). A Cakto devolve esse código no
// webhook, e o /api/venda junta esses dados ao Purchase da API de Conversões. Sem nome, e-mail ou telefone.
import { redis } from './venda.mjs';

const VALIDADE = 7 * 24 * 60 * 60;
export const CODIGO = /^[A-Za-z0-9_-]{16,64}$/;
const FBP = /^fb\.[0-9]\.[0-9]{10,16}\.[0-9]{1,24}$/;
const FBC = /^fb\.[0-9]\.[0-9]{10,16}\.[A-Za-z0-9_-]{1,500}$/;

const vazio = (status) => new Response(null, { status });

export function ipDoVisitante(request) {
  const bruto = request.headers.get('x-real-ip') || (request.headers.get('x-forwarded-for') || '').split(',')[0];
  const ip = String(bruto || '').trim();
  return ip.length <= 45 && /^[0-9a-fA-F:.]+$/.test(ip) ? ip : '';
}

export async function POST(request) {
  const db = redis();
  if (!db) return vazio(204);
  let corpo;
  try {
    const texto = await request.text();
    if (texto.length > 2000) return vazio(413);
    corpo = JSON.parse(texto);
  } catch { return vazio(400); }
  const codigo = String(corpo?.t || '');
  if (!CODIGO.test(codigo)) return vazio(400);
  const fbp = FBP.test(String(corpo.fbp || '')) ? corpo.fbp : '';
  const fbc = FBC.test(String(corpo.fbc || '')) ? corpo.fbc : '';
  const ua = String(request.headers.get('user-agent') || '').slice(0, 512);
  const registro = JSON.stringify({ fbp, fbc, ip: ipDoVisitante(request), ua, url: 'https://visionboxtv.app/', em: Date.now() });
  try {
    // NX: um código já usado não é sobrescrito por outra pessoa.
    await db('', ['SET', `vb:sessao:${codigo}`, registro, 'EX', String(VALIDADE), 'NX']);
  } catch { return vazio(503); }
  return vazio(204);
}

