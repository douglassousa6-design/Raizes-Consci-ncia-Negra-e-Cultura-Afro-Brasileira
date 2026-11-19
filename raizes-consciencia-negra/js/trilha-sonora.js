/* =====================================================================
   trilha-sonora.js — Player com toques de berimbau
   ---------------------------------------------------------------------
   CONCEITOS QUE ESTE ARQUIVO MOSTRA
   • O elemento <audio> do HTML e seus comandos: play(), pause(), load()
   • Vários formatos para o mesmo som (<source> MP3 e OGG): o navegador
     usa o primeiro que conseguir tocar.
   • Promises: audio.play() devolve uma "promessa" que pode dar certo
     (.then) ou falhar (.catch).
   • Eventos: o <audio> avisa quando começa ('playing'), pausa ('pause')
     ou dá erro. Nós "escutamos" esses avisos para atualizar a tela.
   • CustomEvent: avisamos o resto do site que a música mudou
     (a roda 3D usa isso para ajustar a velocidade dos capoeiristas).

   POR QUE A MÚSICA NÃO COMEÇA SOZINHA?
   1) Os navegadores bloqueiam som automático: só é permitido tocar
      depois de um clique da pessoa.
   2) Regra de acessibilidade (WCAG 1.4.2): som que começa sozinho
      atrapalha quem usa leitor de tela, que também "fala" pelo áudio.
   ===================================================================== */

/* ---------- 1. AS FAIXAS (dados) ----------
   Dois tipos de faixa:
   • TOQUES DE BERIMBAU (Wikimedia Commons): só os instrumentos.
   • MÚSICAS DE RODA (Freesound): gravações de rodas de verdade, na rua,
     com canto, instrumentos e palmas.
   Cada faixa tem dois arquivos: MP3 (funciona em todos os navegadores,
   inclusive no iPhone) e OGG (formato livre). */
const toques = {
  iuna: {
    nome: 'Iúna',
    velocidade: 0.9, // andamento relativo do toque (1 = normal); enviado junto com o evento 'trilha-sonora'
    descricao: 'Toque sem cantoria, tocado por três berimbaus. Mestre Bimba dizia que ele imitava o canto do pássaro iúna: o macho chama e a fêmea responde. Tradicionalmente, acompanha o jogo dos alunos formados.',
    mp3: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/1/10/I%C3%BAna.ogg/I%C3%BAna.ogg.mp3',
    ogg: 'https://upload.wikimedia.org/wikipedia/commons/1/10/I%C3%BAna.ogg',
    credito: 'Gravação: Djino (2008) • Domínio público',
    pagina: 'https://commons.wikimedia.org/wiki/File:I%C3%BAna.ogg'
  },
  santamaria: {
    nome: 'Santa Maria',
    velocidade: 1,
    descricao: 'Tocado por três berimbaus. O mesmo toque recebe nomes diferentes conforme o grupo de capoeira, como Santa Maria, Hino da Capoeira Regional ou Apanha Laranja no Chão Tico-Tico.',
    mp3: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/1/18/Santa_maria.ogg/Santa_maria.ogg.mp3',
    ogg: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Santa_maria.ogg',
    credito: 'Gravação: Djino (2008) • CC BY-SA 3.0',
    pagina: 'https://commons.wikimedia.org/wiki/File:Santa_maria.ogg'
  },
  angola: {
    nome: 'Angola',
    velocidade: 0.7,
    descricao: 'Toque tradicional da capoeira angola, de ritmo cadenciado, que pede um jogo mais lento, baixo e próximo do chão. É uma gravação curta, que se repete.',
    mp3: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/f/fa/Toque-de-angola.ogg/Toque-de-angola.ogg.mp3',
    ogg: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Toque-de-angola.ogg',
    credito: 'Gravação: autor não informado • Domínio público',
    pagina: 'https://commons.wikimedia.org/wiki/File:Toque-de-angola.ogg'
  },

  // ----- MÚSICAS DE RODA (com canto) — gravações do Freesound -----
  // Atenção às licenças: CC BY exige crédito; CC BY-NC exige crédito e proíbe
  // uso COMERCIAL (vender, fazer propaganda paga). Um projeto escolar sem fins
  // lucrativos pode usar.
  lapa: {
    nome: 'Roda na Lapa (Rio de Janeiro)',
    velocidade: 1,
    descricao: 'Gravação de uma roda de capoeira na feira da Lapa, no Rio de Janeiro, em 2018. Dá para ouvir o canto, os instrumentos e um pouco do vento da rua.',
    mp3: 'https://cdn.freesound.org/previews/455/455955_9474234-hq.mp3',
    ogg: 'https://cdn.freesound.org/previews/455/455955_9474234-hq.ogg',
    credito: 'Gravação: arthur_parmentier (2018) • CC BY-NC 4.0',
    pagina: 'https://freesound.org/people/arthur_parmentier/sounds/455955/'
  },
  nanterre1: {
    nome: 'Roda de rua na França (parte 1)',
    velocidade: 1,
    descricao: 'Apresentação de capoeira na rua, durante um festival na cidade de Nanterre, perto de Paris, em 2019. Os capoeiristas cantam e tocam, e ao fundo se ouve o público. A capoeira nasceu no Brasil e hoje é praticada no mundo inteiro.',
    mp3: 'https://cdn.freesound.org/previews/485/485966_9034501-hq.mp3',
    ogg: 'https://cdn.freesound.org/previews/485/485966_9034501-hq.ogg',
    credito: 'Gravação: kevp888 – Kevin Luce (2019) • CC BY 4.0',
    pagina: 'https://freesound.org/people/kevp888/sounds/485966/'
  },
  nanterre2: {
    nome: 'Roda de rua na França (parte 2)',
    velocidade: 1,
    descricao: 'Continuação da mesma roda em Nanterre (França), com canto, música, palmas e aplausos do público.',
    mp3: 'https://cdn.freesound.org/previews/485/485967_9034501-hq.mp3',
    ogg: 'https://cdn.freesound.org/previews/485/485967_9034501-hq.ogg',
    credito: 'Gravação: kevp888 – Kevin Luce (2019) • CC BY 4.0',
    pagina: 'https://freesound.org/people/kevp888/sounds/485967/'
  }
};

/* ---------- 2. ELEMENTOS DA PÁGINA ---------- */
const trilha = document.querySelector('#trilhaSonora');
const audio = document.querySelector('#trilhaAudio');
const botaoAbrir = document.querySelector('#trilhaAbrir');
const painelTrilha = document.querySelector('#trilhaPainel');
const seletor = document.querySelector('#trilhaToque');
const botaoTocar = document.querySelector('#trilhaTocar');
const volume = document.querySelector('#trilhaVolume');
const textoDescricao = document.querySelector('#trilhaDescricao');
const textoCredito = document.querySelector('#trilhaCredito');
const textoStatus = document.querySelector('#trilhaStatus');

const CHAVE_PREFERENCIAS = 'raizes-trilha'; // nome usado no localStorage

if (trilha && audio) {
  let toqueAtual = 'iuna';

  /* ---------- 3. TROCAR O TOQUE ---------- */
  function escolherToque(chave) {
    const toque = toques[chave];
    if (!toque) return;
    const estavaTocando = !audio.paused; // guardamos para continuar tocando depois da troca
    toqueAtual = chave;

    // Remove as fontes antigas e cria as novas.
    audio.replaceChildren();
    const fonteMp3 = document.createElement('source');
    fonteMp3.src = toque.mp3;
    fonteMp3.type = 'audio/mpeg';
    const fonteOgg = document.createElement('source');
    fonteOgg.src = toque.ogg;
    fonteOgg.type = 'audio/ogg';
    // Se a ÚLTIMA fonte falhar, nenhuma funcionou: mostramos um aviso.
    fonteOgg.addEventListener('error', () => {
      mostrarStatus('Não foi possível carregar o áudio. Verifique a conexão com a internet.');
    });
    audio.append(fonteMp3, fonteOgg);
    audio.load(); // obrigatório: faz o navegador ler as novas fontes

    // Atualiza os textos (textContent = texto puro, mais seguro).
    textoDescricao.textContent = toque.descricao;
    textoCredito.replaceChildren(
      document.createTextNode(toque.credito + ' • '),
      criarLink(toque.pagina, toque.pagina.includes('freesound') ? 'Freesound' : 'Wikimedia Commons')
    );
    seletor.value = chave;
    salvarPreferencias();

    if (estavaTocando) tocar();
  }

  function criarLink(endereco, texto) {
    const link = document.createElement('a');
    link.href = endereco;
    link.textContent = texto;
    link.target = '_blank';
    link.rel = 'noopener';
    return link;
  }

  /* ---------- 4. TOCAR E PAUSAR ---------- */
  function tocar() {
    // play() devolve uma Promise: ela pode falhar (sem internet, por exemplo).
    audio.play()
      .then(() => mostrarStatus(''))
      .catch(() => mostrarStatus('O navegador não conseguiu tocar o áudio agora.'));
  }
  function pausar() {
    audio.pause();
  }

  // Um único botão alterna entre tocar e pausar.
  botaoTocar.addEventListener('click', () => {
    if (audio.paused) tocar(); else pausar();
  });

  // O <audio> avisa quando realmente começou ou parou de tocar.
  // Atualizamos a tela AQUI (e não no clique), porque o áudio pode demorar a
  // carregar ou falhar; assim a tela sempre mostra o estado verdadeiro.
  audio.addEventListener('playing', () => atualizarTela(true));
  audio.addEventListener('pause', () => atualizarTela(false));

  function atualizarTela(tocando) {
    trilha.classList.toggle('tocando', tocando);
    botaoTocar.setAttribute('aria-pressed', tocando);
    botaoTocar.querySelector('.trilha-icone').textContent = tocando ? '❚❚' : '▶';
    botaoTocar.querySelector('.trilha-rotulo').textContent = tocando ? 'Pausar' : 'Tocar';

    // Avisa o resto do site (a roda 3D escuta este evento).
    document.dispatchEvent(new CustomEvent('trilha-sonora', {
      detail: { tocando, nome: toques[toqueAtual].nome, velocidade: toques[toqueAtual].velocidade }
    }));
  }

  function mostrarStatus(mensagem) {
    textoStatus.textContent = mensagem;
  }

  /* ---------- 5. VOLUME ---------- */
  // O volume do <audio> vai de 0 (mudo) a 1 (máximo).
  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value); // o valor do <input> é texto; Number() converte
    salvarPreferencias();
  });

  seletor.addEventListener('change', () => escolherToque(seletor.value));

  /* ---------- 6. ABRIR E FECHAR O PAINEL ---------- */
  function abrirPainel(abrir) {
    painelTrilha.hidden = !abrir;
    botaoAbrir.setAttribute('aria-expanded', abrir);
  }
  botaoAbrir.addEventListener('click', () => abrirPainel(painelTrilha.hidden));
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && !painelTrilha.hidden) {
      abrirPainel(false);
      botaoAbrir.focus();
    }
  });

  /* ---------- 7. LEMBRAR AS PREFERÊNCIAS ---------- */
  // Guardamos o toque e o volume escolhidos (mas NUNCA tocamos sozinhos).
  // JSON.stringify transforma o objeto em texto, pois o localStorage só guarda texto.
  function salvarPreferencias() {
    try {
      localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify({ toque: toqueAtual, volume: volume.value }));
    } catch (erro) { /* navegador sem armazenamento: ignora */ }
  }
  function carregarPreferencias() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_PREFERENCIAS)) || {};
    } catch (erro) {
      return {};
    }
  }

  // Outras partes do site podem PEDIR uma pausa disparando o evento 'pausar-trilha'.
  // Exemplo: document.dispatchEvent(new CustomEvent('pausar-trilha'));
  document.addEventListener('pausar-trilha', pausar);

  /* ---------- 8. INÍCIO ---------- */
  const preferencias = carregarPreferencias();
  if (preferencias.volume) volume.value = preferencias.volume;
  audio.volume = Number(volume.value);
  audio.loop = true; // repete ao terminar
  escolherToque(toques[preferencias.toque] ? preferencias.toque : 'iuna');

  // Pequena "API" para outras partes do site: qualquer botão com o atributo
  // data-tocar-trilha abre o player e começa a tocar.
  document.querySelectorAll('[data-tocar-trilha]').forEach((botao) => {
    botao.addEventListener('click', () => {
      abrirPainel(true);
      tocar();
    });
  });
}
