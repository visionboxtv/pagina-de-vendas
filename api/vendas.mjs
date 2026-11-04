// Entrega à página as compras aprovadas mais recentes (primeiro nome, plano, valor e há quantos minutos).
// Sem banco configurado ou sem vendas recentes, responde lista vazia e a página não mostra aviso.
import { redis } from './venda.mjs';
import { createHash } from 'node:crypto';

const CHAVE = 'vb:vendas';
const JANELA_HORAS = 48;
const MAXIMO = 12;

export async function GET() {
  const cabecalhos = { 'content-type': 'application/json', 'cache-control': 'public, s-maxage=30, stale-while-revalidate=60' };
  const db = redis();
  if (!db) return new Response(JSON.stringify({ vendas: [] }), { headers: cabecalhos });
  try {
    const { result = [] } = await db('', ['LRANGE', CHAVE, '0', '29']);
    const agora = Date.now(), vistos = new Set(), vendas = [];
    for (const item of result) {
      let v; try { v = JSON.parse(item); } catch { continue; }
      const minutos = Math.floor((agora - Number(v.em)) / 60000);
      if (!(minutos >= 0) || minutos > JANELA_HORAS * 60) continue;
      const chave = v.id || `${v.nome}|${v.plano}`;
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      const valor = typeof v.valor === 'number' ? v.valor : NaN;
      const evento = createHash('sha256').update(String(v.id || `${v.nome}|${v.plano}|${v.em}`)).digest('hex').slice(0, 24);
      vendas.push({ evento, nome: v.nome, plano: v.plano, minutos, ...(Number.isFinite(valor) && valor > 0 ? { valor } : {}) });
      if (vendas.length >= MAXIMO) break;
    }
    return new Response(JSON.stringify({ vendas }), { headers: cabecalhos });
  } catch {
    return new Response(JSON.stringify({ vendas: [] }), { headers: cabecalhos });
  }
}
