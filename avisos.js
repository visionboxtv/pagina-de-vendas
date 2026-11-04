import { comprasHistoricas } from './lib/compras-historicas.mjs';

const PLANOS = { mensal: 'mensal', trimestral: 'trimestral', semestral: 'semestral', anual: 'anual' };
const INTERVALO_MIN = 45000;
const INTERVALO_MAX = 83000;
const caixa = document.getElementById('avisos');

export function embaralhar(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function validarCompra(v) {
  if (!v || !Object.hasOwn(PLANOS, v.plano) || typeof v.nome !== 'string') return null;
  const nome = v.nome.trim().split(/\s+/)[0];
  if (!/^[\p{L}][\p{L}'-]{1,19}$/u.test(nome)) return null;
  return { nome, plano: v.plano, evento: typeof v.evento === 'string' ? v.evento : '',
    ...(typeof v.valor === 'number' && Number.isFinite(v.valor) && v.valor > 0 ? { valor: v.valor } : {}) };
}

function mostrar(compra, rotulo = '') {
  if (!caixa) return;
  caixa.replaceChildren();
  const card = document.createElement('div');
  card.className = 'aviso';
  const icone = document.createElement('span');
  icone.className = 'aviso-ini';
  icone.setAttribute('aria-hidden', 'true');
  icone.textContent = '✓';
  const texto = document.createElement('span');
  texto.className = 'aviso-txt';
  texto.append(document.createTextNode('Notificação: '));
  const nome = document.createElement('b');
  nome.textContent = compra.nome;
  texto.append(nome, document.createTextNode(' comprou o plano ' + PLANOS[compra.plano]));
  if (compra.valor) texto.append(document.createTextNode(' por ' + compra.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })));
  if (rotulo) texto.append(document.createTextNode(' · ' + rotulo));
  const fechar = document.createElement('button');
  fechar.className = 'aviso-fechar';
  fechar.type = 'button';
  fechar.setAttribute('aria-label', 'Fechar notificação');
  fechar.textContent = '×';
  fechar.addEventListener('click', () => card.remove());
  card.append(icone, texto, fechar);
  caixa.append(card);
  requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('in')));
  setTimeout(() => { card.classList.remove('in'); setTimeout(() => card.remove(), 400); }, 7000);
}

if (caixa) {
  const local = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (local && new URLSearchParams(location.search).has('teste-avisos')) {
    // Demonstrações continuam restritas ao computador e sempre identificadas.
    window.vbAvisos = (lista, rotulo, primeiro, intervalo) => {
      let i = 0;
      function proximo() {
        if (i >= lista.length) return;
        const compra = validarCompra(lista[i++]);
        if (compra) mostrar(compra, rotulo || 'teste');
        setTimeout(proximo, intervalo[0] + Math.random() * (intervalo[1] - intervalo[0]));
      }
      setTimeout(proximo, primeiro);
    };
    const script = document.createElement('script');
    script.src = 'teste/avisos-simulados.js';
    document.body.append(script);
  } else {
    const base = comprasHistoricas.map(validarCompra).filter(Boolean);
    let filaHistorica = embaralhar(base);
    const filaRecente = [];
    const vistos = new Set();
    let ultimoPlano = '';
    let buscando = false;

    function intervalo() { return INTERVALO_MIN + Math.random() * (INTERVALO_MAX - INTERVALO_MIN); }

    function proximo() {
      if (!document.hidden && !document.documentElement.classList.contains('modal-aberto')) {
        if (!filaHistorica.length) filaHistorica = embaralhar(base);
        const fila = filaRecente.length ? filaRecente : filaHistorica;
        // Alterna modalidades quando possível, sem uma sequência fixa de planos.
        if (fila.length > 1 && fila[0].plano === ultimoPlano) {
          const diferente = fila.findIndex(v => v.plano !== ultimoPlano);
          if (diferente > 0) [fila[0], fila[diferente]] = [fila[diferente], fila[0]];
        }
        const compra = fila.shift();
        if (compra) { mostrar(compra); ultimoPlano = compra.plano; }
      }
      setTimeout(proximo, intervalo());
    }

    async function atualizar() {
      if (buscando || document.hidden || !/^https?:$/.test(location.protocol)) return;
      buscando = true;
      try {
        const resposta = await fetch('/api/vendas', { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
        if (!resposta.ok) return;
        const dados = await resposta.json();
        if (!Array.isArray(dados.vendas)) return;
        for (const registro of dados.vendas) {
          const compra = validarCompra(registro);
          if (!compra) continue;
          const chave = compra.evento || compra.nome + '|' + compra.plano;
          if (vistos.has(chave)) continue;
          vistos.add(chave);
          filaRecente.push(compra);
          if (vistos.size > 500) vistos.delete(vistos.values().next().value);
        }
      } catch { /* O histórico comprovado continua disponível se a API falhar. */ }
      finally { buscando = false; }
    }

    atualizar();
    setInterval(atualizar, 60000);
    setTimeout(proximo, intervalo());
  }
}
