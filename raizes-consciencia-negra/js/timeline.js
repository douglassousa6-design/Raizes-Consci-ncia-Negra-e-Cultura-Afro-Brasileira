/* =========================================================
   timeline.js — Linha do tempo com abas
   ========================================================= */

// Os textos ficam em um objeto JavaScript. A "chave" (colonial, palmares...)
// é a mesma escrita no atributo data-period de cada botão no HTML.
const periodos = {
  colonial: {
    data: 'SÉCULOS XVI–XIX',
    titulo: 'Escravização e resistência',
    texto: 'Milhões de africanos foram trazidos à força para o Brasil. Ao longo de todo esse período, ocorreram fugas, revoltas, negociações, preservação cultural e formação de comunidades de resistência.'
  },
  palmares: {
    data: 'SÉCULO XVII',
    titulo: 'Quilombo dos Palmares',
    texto: 'Palmares foi uma grande comunidade formada por pessoas que resistiam à escravização, localizada na região da atual Alagoas. Zumbi tornou-se uma de suas lideranças mais lembradas e foi morto em 20 de novembro de 1695. Dandara é associada à resistência do quilombo.'
  },
  abolicao: {
    data: '13 DE MAIO DE 1888',
    titulo: 'Abolição legal da escravidão',
    texto: 'A Lei Áurea determinou o fim legal da escravidão no Brasil. A liberdade jurídica, porém, não veio acompanhada de políticas suficientes de reparação e inclusão, e desigualdades raciais permaneceram.'
  },
  // MELHORIA (conteúdo): nova aba explicando POR QUE a data é 20 de novembro.
  data: {
    data: '1971 • 2011 • 2023',
    titulo: 'Por que 20 de novembro?',
    texto: 'A data lembra a morte de Zumbi dos Palmares, em 1695. Na década de 1970, o movimento negro, com destaque para o Grupo Palmares, de Porto Alegre, propôs o 20 de novembro como alternativa ao 13 de maio, valorizando a luta e a resistência negra. A Lei nº 12.519/2011 instituiu o Dia Nacional de Zumbi e da Consciência Negra, e a Lei nº 14.759/2023 tornou a data feriado nacional.'
  },
  hoje: {
    data: 'SÉCULOS XX–XXI',
    titulo: 'Memória, direitos e reconhecimento',
    texto: 'Movimentos negros, pesquisadores, educadores e artistas seguem ampliando o debate público. Um marco na educação é a Lei nº 10.639/2003, que tornou obrigatório o ensino de história e cultura afro-brasileira e africana nas escolas (ampliada pela Lei nº 11.645/2008, que incluiu a temática indígena).'
  }
};

const timelineCard = document.querySelector('#timelineCard');
const abas = Array.from(document.querySelectorAll('.time-tab')); // Array.from permite usar indexOf

function selecionarAba(botao, moverFoco = false) {
  const periodo = periodos[botao.dataset.period];
  if (!periodo || !timelineCard) return;

  // Desmarca todas as abas...
  abas.forEach((item) => {
    item.classList.remove('active');
    item.setAttribute('aria-selected', 'false');
    item.setAttribute('tabindex', '-1'); // aba inativa sai da ordem do Tab
  });
  // ...e marca só a escolhida.
  botao.classList.add('active');
  botao.setAttribute('aria-selected', 'true');
  botao.setAttribute('tabindex', '0');
  if (moverFoco) botao.focus();

  // MELHORIA (segurança/boa prática): antes, o texto era colocado com innerHTML.
  // innerHTML interpreta o texto como HTML; se um dia o conteúdo vier de fora
  // (um formulário, por exemplo), isso abre espaço para código malicioso (ataque XSS).
  // textContent coloca o texto como TEXTO PURO, sem interpretar nada.
  timelineCard.querySelector('.timeline-date').textContent = periodo.data;
  timelineCard.querySelector('h4').textContent = periodo.titulo;
  timelineCard.querySelector('p').textContent = periodo.texto;
  timelineCard.setAttribute('aria-labelledby', botao.id); // painel "pertence" a esta aba
}

abas.forEach((botao) => {
  botao.addEventListener('click', () => selecionarAba(botao));

  // MELHORIA (acessibilidade): padrão de abas do W3C.
  // Setas ← → trocam de aba; Home e End vão para a primeira e a última.
  botao.addEventListener('keydown', (evento) => {
    const atual = abas.indexOf(botao);
    let proxima = null;
    if (evento.key === 'ArrowRight') proxima = (atual + 1) % abas.length;               // % volta ao início
    if (evento.key === 'ArrowLeft') proxima = (atual - 1 + abas.length) % abas.length;  // + length evita número negativo
    if (evento.key === 'Home') proxima = 0;
    if (evento.key === 'End') proxima = abas.length - 1;
    if (proxima !== null) {
      evento.preventDefault(); // impede a página de rolar com Home/End
      selecionarAba(abas[proxima], true);
    }
  });
});
