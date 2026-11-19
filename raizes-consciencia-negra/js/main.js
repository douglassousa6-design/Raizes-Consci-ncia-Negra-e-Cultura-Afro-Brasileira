/* =========================================================
   main.js — Janela de informações (modal), alto contraste,
             reflexão do visitante e tratamento de imagens
   ========================================================= */

/* ---------- 1. JANELA DE INFORMAÇÕES (MODAL) ---------- */
const modal = document.querySelector('#infoModal');
const modalTitle = document.querySelector('#modalTitle');
const modalText = document.querySelector('#modalText');
const modalClose = document.querySelector('.modal-close');

// MELHORIA (acessibilidade): guardamos qual botão abriu o modal
// para devolver o foco a ele quando o modal fechar.
let elementoQueAbriu = null;

function abrirModal(titulo, texto) {
  if (!modal || !modalTitle || !modalText) return;
  elementoQueAbriu = document.activeElement; // document.activeElement = elemento com foco agora
  modalTitle.textContent = titulo;
  modalText.textContent = texto;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // trava a rolagem da página atrás do modal
  // MELHORIA: o foco vai para dentro do modal. Sem isso, quem usa teclado
  // ou leitor de tela continuaria "atrás" da janela, sem saber que ela abriu.
  if (modalClose) modalClose.focus();
}

function fecharModal() {
  if (!modal || !modal.classList.contains('open')) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  // MELHORIA: devolve o foco ao botão que abriu ("Descobrir mais", "Ler perfil"...).
  if (elementoQueAbriu) elementoQueAbriu.focus();
}

document.querySelectorAll('[data-close-modal]').forEach((botao) => botao.addEventListener('click', fecharModal));

document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape') fecharModal();

  // MELHORIA: "armadilha de foco" (focus trap). Com o modal aberto, o Tab
  // circula apenas pelos elementos DENTRO dele, sem escapar para a página de trás.
  if (evento.key === 'Tab' && modal && modal.classList.contains('open')) {
    const focaveis = modal.querySelectorAll('button, a[href], textarea, input, [tabindex]:not([tabindex="-1"])');
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault(); ultimo.focus();       // Shift+Tab no primeiro → vai para o último
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault(); primeiro.focus();     // Tab no último → volta ao primeiro
    }
  }
});

// Botões "Descobrir mais +" da seção Cultura: o texto está no atributo data-info.
document.querySelectorAll('.learn-more').forEach((botao) => {
  botao.addEventListener('click', () => abrirModal('Cultura afro-brasileira', botao.dataset.info));
});

// Botões "Ler perfil": o atributo data-person guarda "Nome|Texto".
// split('|') divide em duas partes e a desestruturação [nome, texto] pega cada uma.
document.querySelectorAll('.person-more').forEach((botao) => {
  botao.addEventListener('click', () => {
    const [nome, texto] = botao.dataset.person.split('|');
    abrirModal(nome, texto);
  });
});

/* ---------- 2. ALTO CONTRASTE ---------- */
const contrastToggle = document.querySelector('#contrastToggle');
const CHAVE_CONTRASTE = 'raizes-alto-contraste'; // nome usado para salvar no navegador

function aplicarContraste(ativo) {
  document.body.classList.toggle('high-contrast', ativo);
  if (contrastToggle) {
    contrastToggle.setAttribute('aria-pressed', ativo);
    contrastToggle.title = ativo ? 'Desativar alto contraste' : 'Ativar alto contraste';
  }
}

// MELHORIA: a escolha fica salva no localStorage. Antes, ao recarregar a
// página, o alto contraste desligava e a pessoa precisava ativar de novo.
// O try/catch evita erro em navegadores que bloqueiam o armazenamento (ex.: modo anônimo).
try {
  aplicarContraste(localStorage.getItem(CHAVE_CONTRASTE) === 'sim');
} catch (erro) { /* sem armazenamento: segue sem salvar */ }

if (contrastToggle) {
  contrastToggle.addEventListener('click', () => {
    const ativo = !document.body.classList.contains('high-contrast');
    aplicarContraste(ativo);
    try { localStorage.setItem(CHAVE_CONTRASTE, ativo ? 'sim' : 'nao'); } catch (erro) { /* ignora */ }
  });
}

/* ---------- 3. REFLEXÃO DO VISITANTE ---------- */
// O texto fica salvo apenas NESTE navegador (localStorage), não vai para nenhum servidor.
const reflectionInput = document.querySelector('#reflectionInput');
const saveReflection = document.querySelector('#saveReflection');
const reflectionFeedback = document.querySelector('#reflectionFeedback');
if (reflectionInput && saveReflection) {
  try {
    reflectionInput.value = localStorage.getItem('raizes-reflexao') || '';
  } catch (erro) {
    console.info('Armazenamento local indisponível neste navegador.');
  }
  saveReflection.addEventListener('click', () => {
    const texto = reflectionInput.value.trim(); // trim() remove espaços no início e no fim
    if (!texto) {
      reflectionFeedback.textContent = 'Escreva sua reflexão antes de guardar.';
      return;
    }
    try {
      localStorage.setItem('raizes-reflexao', texto);
      reflectionFeedback.textContent = 'Sua reflexão foi guardada neste dispositivo.';
    } catch (erro) {
      reflectionFeedback.textContent = 'Não foi possível guardar neste navegador.';
    }
  });
}

/* ---------- 4. IMAGENS QUE NÃO CARREGAM ---------- */
// MELHORIA: antes a imagem quebrada só ficava transparente e deixava um buraco.
// Agora o contêiner recebe a classe "imagem-indisponivel", que mostra um fundo
// e uma mensagem (estilo em css/melhorias.css).
document.querySelectorAll('img').forEach((imagem) => {
  imagem.addEventListener('error', () => {
    imagem.alt = `${imagem.alt} (imagem externa indisponível)`;
    imagem.classList.add('img-falhou');
    if (imagem.parentElement) imagem.parentElement.classList.add('imagem-indisponivel');
  });
});

/* ---------- 5. PLANO B DA GALERIA 3D ---------- */
// MELHORIA: a galeria 3D depende da biblioteca Three.js, baixada da internet (CDN).
// Se ela não carregar (sem internet, rede da escola bloqueando...), o arquivo
// three-scene.js nem chega a rodar e a mensagem "Preparando..." ficava para sempre.
// Aqui, depois de 10 segundos, verificamos se a galeria avisou que está pronta.
setTimeout(() => {
  const avisoCarregando = document.querySelector('#threeLoading');
  if (!window.galeria3DPronta && avisoCarregando && avisoCarregando.style.display !== 'none') {
    avisoCarregando.textContent = 'Não foi possível carregar a galeria 3D (verifique a conexão com a internet). As fotografias abaixo continuam disponíveis.';
  }
}, 10000);
