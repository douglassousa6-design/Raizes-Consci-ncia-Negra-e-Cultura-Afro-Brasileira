/* =========================================================
   contribuicoes.js — Seção "Contribuições" (capoeira e comidas)
   ---------------------------------------------------------
   Este arquivo segue o MESMO padrão do timeline.js:
     1) os textos ficam guardados em um objeto JavaScript;
     2) cada botão tem um atributo data-* com a "chave" do texto;
     3) ao clicar, procuramos o texto pela chave e atualizamos a página.
   Separar DADOS (o objeto) de COMPORTAMENTO (os eventos) facilita
   acrescentar conteúdo: para um novo instrumento, basta incluir um
   item no objeto e um botão no HTML.
   ========================================================= */

/* ---------- 1. INSTRUMENTOS DA RODA ---------- */
const instrumentos = {
  berimbau: {
    nome: 'Berimbau',
    texto: 'Arco de madeira (geralmente biriba) com um arame de aço e uma cabaça, que funciona como caixa de som. É tocado com uma baqueta, um dobrão (moeda ou pedra) e o caxixi. É o instrumento que comanda a roda: o toque do berimbau define o ritmo e o tipo de jogo. Muitas rodas têm três berimbaus: gunga (som grave), médio e viola (som agudo).'
  },
  atabaque: {
    nome: 'Atabaque',
    texto: 'Tambor alto, feito de madeira e couro, tocado com as mãos. Marca a base do ritmo e dá força à roda. O atabaque também está presente em religiões de matriz africana, como o candomblé.'
  },
  pandeiro: {
    nome: 'Pandeiro',
    texto: 'Aro de madeira coberto de couro, com pequenas platinelas de metal nas laterais. Acompanha o berimbau e ajuda a manter o ritmo. Em muitas rodas há dois pandeiros.'
  },
  agogo: {
    nome: 'Agogô',
    texto: 'Duas campânulas de metal de tamanhos diferentes, ligadas por uma haste e tocadas com uma baqueta. Cada campânula produz um som (grave e agudo). É um instrumento de origem africana.'
  },
  recoreco: {
    nome: 'Reco-reco',
    texto: 'Pedaço de bambu ou madeira com cortes (sulcos) na superfície. O som é produzido raspando uma vareta sobre os sulcos, acompanhando o ritmo da bateria.'
  }
};

const painel = document.querySelector('#painelInstrumento');
const botoesInstrumento = document.querySelectorAll('.instrument-choice');

botoesInstrumento.forEach((botao) => {
  botao.addEventListener('click', () => {
    // dataset.instrumento lê o atributo data-instrumento do botão clicado.
    const dados = instrumentos[botao.dataset.instrumento];
    if (!dados || !painel) return; // segurança: se a chave não existir, não faz nada

    // Marca apenas o botão clicado como ativo.
    botoesInstrumento.forEach((item) => {
      item.classList.remove('active');
      item.setAttribute('aria-pressed', 'false');
    });
    botao.classList.add('active');
    botao.setAttribute('aria-pressed', 'true');

    // textContent: insere como texto puro (mais seguro que innerHTML).
    painel.querySelector('h4').textContent = dados.nome;
    painel.querySelector('p').textContent = dados.texto;

    // Reinicia a animação de entrada do painel:
    // remover a classe, forçar o navegador a "recalcular" (offsetWidth)
    // e colocar a classe de novo faz a animação CSS tocar outra vez.
    painel.classList.remove('trocou');
    void painel.offsetWidth;
    painel.classList.add('trocou');

    // ANUNCIA para o resto da página que um instrumento foi escolhido.
    // CustomEvent cria um evento com o nome que quisermos; "detail" leva a informação.
    // Quem estiver "escutando" (o arquivo instrumentos-3d.js) troca o modelo 3D.
    document.dispatchEvent(new CustomEvent('instrumento-escolhido', { detail: botao.dataset.instrumento }));
  });
});

// PLANO B do 3D: se a biblioteca Three.js não carregar (sem internet, por
// exemplo), avisamos depois de 10 segundos. A foto real continua disponível.
setTimeout(() => {
  const aviso3D = document.querySelector('#instrumentLoading');
  if (!window.instrumentos3DProntos && aviso3D && !aviso3D.hidden) {
    aviso3D.textContent = 'Não foi possível carregar o modelo 3D. Veja a foto real dos instrumentos ao lado.';
  }
}, 10000);

/* ---------- 2. COMIDAS TÍPICAS ---------- */
// Os botões "Saiba mais" reaproveitam o modal que já existe no site.
// A função abrirModal foi criada em js/main.js. Como os dois arquivos são
// scripts comuns (não são "module"), funções declaradas no topo de um
// ficam disponíveis para o outro, desde que main.js seja carregado ANTES.
document.querySelectorAll('.food-more').forEach((botao) => {
  botao.addEventListener('click', () => {
    const [nome, texto] = botao.dataset.dish.split('|');
    abrirModal(nome, texto);
  });
});
