// Purchase pela API de Conversões da Meta, a partir da compra aprovada na Cakto.
// O arquivo começa com "_" para a Vercel não publicá-lo como rota.
// Variáveis na Vercel: META_CAPI_TOKEN (obrigatória; sem ela nada é enviado), META_PIXEL_ID (padrão abaixo)
// e META_TEST_EVENT_CODE (só para o "Testar" da Cakto aparecer em Eventos de teste).
//
// Contra contagem dupla com o Clic CRM (contrato de 2026-11-06): a venda da Cakto tem o Purchase só daqui.
// Depois de enviar, o /api/venda marca o celular do comprador no Redis por 7 dias e o CRM consulta
// /api/compra-pagina antes de mandar o Purchase dele; achando a marca, o CRM não envia.
import { createHash } from 'node:crypto';

export const PIXEL_PADRAO = '665915886273131';
const GRAPH = 'https://graph.facebook.com/v25.0';

const sha = (texto) => createHash('sha256').update(texto).digest('hex');
const PAIS = sha('br');

// Celular brasileiro sempre com o nono dígito: 55 + DDD + 9 + 8 dígitos. Outros números ficam como vieram.
export function celularCanonico(telefone) {
  let d = String(telefone || '').replace(/\D/g, '');
  if (d.length === 10 || d.length === 11) d = '55' + d;
  if (d.startsWith('55') && d.length === 12 && /[6-9]/.test(d[4])) d = d.slice(0, 4) + '9' + d.slice(4);
  return /^[1-9]\d{9,14}$/.test(d) ? d : '';
}

// As duas formas do celular (com e sem o nono dígito), como o CRM (metaPhoneHashes) envia.
export function formasDoCelular(canonico) {
  if (!canonico) return [];
  const formas = [canonico];
  if (canonico.startsWith('55') && canonico.length === 13 && canonico[4] === '9') formas.push(canonico.slice(0, 4) + canonico.slice(5));
  return formas;
}

// SHA-256 de cada forma do celular: vai à Meta (user_data.ph) e marca a compra para o CRM.
export const hashesDoCelular = (telefone) => formasDoCelular(celularCanonico(telefone)).map(sha);

// event_id estável pelo pedido da Cakto: as retentativas do webhook repetem o mesmo id.
export const idDoEvento = (pedido) => sha(`visionbox-cakto-compra\u0000${pedido}`);

const limpo = (texto) => String(texto || '').trim().toLocaleLowerCase('pt-BR');
const semAcento = (texto) => limpo(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');

export function montarEvento(pedido, sessao, { plano, teste = false } = {}) {
  const cliente = pedido.customer || {};
  const canonico = celularCanonico(cliente.phone);
  const email = limpo(cliente.email);
  const partes = String(cliente.name || '').trim().split(/\s+/).filter(Boolean);
  const nome = semAcento(partes[0]);
  const sobrenome = partes.length > 1 ? semAcento(partes[partes.length - 1]) : '';
  const cep = String(pedido.address?.zipcode || '').replace(/\D/g, '').slice(0, 5);
  const cidade = semAcento(pedido.address?.city);
  const estado = semAcento(pedido.address?.state).slice(0, 2);

  const user_data = { country: [PAIS] };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) user_data.em = [sha(email)];
  if (canonico) user_data.ph = hashesDoCelular(canonico);
  if (nome) user_data.fn = [sha(nome)];
  if (sobrenome) user_data.ln = [sha(sobrenome)];
  if (cep.length === 5) user_data.zp = [sha(cep)];
  if (cidade) user_data.ct = [sha(cidade)];
  if (estado.length === 2) user_data.st = [sha(estado)];
  if (sessao?.fbp) user_data.fbp = sessao.fbp;
  if (sessao?.fbc) user_data.fbc = sessao.fbc;
  if (sessao?.ip) user_data.client_ip_address = sessao.ip;
  if (sessao?.ua) user_data.client_user_agent = sessao.ua;

  const valor = Number(pedido.amount);
  const pago = Date.parse(pedido.paidAt);
  const agora = Math.floor(Date.now() / 1000);
  // A Meta recusa evento com mais de 7 dias; o teste da Cakto traz uma data antiga fixa.
  const horario = teste || !Number.isFinite(pago) ? agora : Math.min(agora, Math.floor(pago / 1000));
  const site = Boolean(sessao?.ua);

  return {
    event_name: 'Purchase',
    event_time: horario,
    event_id: idDoEvento(pedido.id || pedido.refId),
    // Com dados do navegador (veio pela página), é compra no site; sem eles, o link veio pela conversa.
    action_source: site ? 'website' : 'chat',
    ...(site ? { event_source_url: sessao.url || 'https://visionboxtv.app/' } : {}),
    user_data,
    custom_data: {
      currency: 'BRL',
      value: Number.isFinite(valor) && valor > 0 ? Math.round(valor * 100) / 100 : 0,
      order_id: String(pedido.refId || pedido.id || ''),
      content_name: plano ? `VisionBox ${plano}` : String(pedido.offer?.name || pedido.product?.name || 'VisionBox').slice(0, 300),
      content_category: 'VisionBox',
      content_ids: [String(pedido.offer?.id || pedido.product?.short_id || 'visionbox')],
      content_type: 'product',
      custom_properties: { origem: 'cakto', plano: plano || 'teste' },
    },
  };
}

// Envia à Meta. Devolve { ok, status, temporario }: temporario = vale tentar de novo (Cakto reenvia).
export async function enviarMeta(evento, { teste = false } = {}) {
  const token = process.env.META_CAPI_TOKEN;
  const pixel = (process.env.META_PIXEL_ID || PIXEL_PADRAO).trim();
  const codigoTeste = (process.env.META_TEST_EVENT_CODE || '').trim();
  if (!token) return { ok: false, status: 0, temporario: false, motivo: 'sem token' };
  if (teste && !codigoTeste) return { ok: false, status: 0, temporario: false, motivo: 'sem código de teste' };
  // A chave vai no corpo, nunca no endereço, para não aparecer em registros de acesso.
  const corpo = { data: [evento], access_token: token, ...(teste ? { test_event_code: codigoTeste } : {}) };
  try {
    const r = await fetch(`${GRAPH}/${pixel}/events`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(8000),
    });
    const resposta = await r.json().catch(() => ({}));
    if (r.ok && Number(resposta.events_received) >= 1) return { ok: true, status: r.status, temporario: false };
    const erro = resposta?.error || {};
    console.error('meta capi recusou', r.status, erro.code, erro.error_subcode, erro.message);
    return { ok: false, status: r.status, temporario: r.status === 429 || r.status >= 500 || erro.is_transient === true };
  } catch (e) {
    console.error('meta capi sem resposta', e?.name);
    return { ok: false, status: 0, temporario: true };
  }
}
