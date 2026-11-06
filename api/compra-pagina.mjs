// Consulta do Clic CRM antes de mandar o Purchase de uma venda VisionBox (contrato de 2026-11-06):
// "este celular comprou pela página nos últimos 7 dias?". Só devolve sim ou não.
// Chave: Authorization: Bearer <HMAC-SHA256 hex do texto "clic-pagina-compra-v1" com o META_CAPI_TOKEN>.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { redis } from './venda.mjs';

const json = (status, corpo) => new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

function chaveValida(recebida, token) {
  const esperada = Buffer.from(createHmac('sha256', token).update('clic-pagina-compra-v1').digest('hex'));
  const veio = Buffer.from(String(recebida || '').replace(/^Bearer\s+/i, '').trim());
  return veio.length === esperada.length && timingSafeEqual(veio, esperada);
}

export async function POST(request) {
  const token = process.env.META_CAPI_TOKEN;
  const db = redis();
  if (!token || !db) return json(503, { erro: 'não configurado' });
  if (!chaveValida(request.headers.get('authorization'), token)) return json(401, { erro: 'chave inválida' });

  let corpo;
  try { corpo = JSON.parse(await request.text()); } catch { return json(400, { erro: 'json inválido' }); }
  const hashes = corpo?.hashes;
  if (!Array.isArray(hashes) || hashes.length < 1 || hashes.length > 4 || !hashes.every((h) => typeof h === 'string' && /^[a-f0-9]{64}$/.test(h))) {
    return json(400, { erro: 'hashes inválidos' });
  }
  try {
    const { result } = await db('', ['EXISTS', ...hashes.map((h) => `vb:compra-tel:${h}`)]);
    return json(200, { comprou: Number(result) > 0 });
  } catch {
    return json(503, { erro: 'armazenamento indisponível' });
  }
}
