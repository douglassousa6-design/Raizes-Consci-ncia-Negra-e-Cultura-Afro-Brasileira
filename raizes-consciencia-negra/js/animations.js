/* =========================================================
   animations.js — Efeito de "aparecer" ao rolar e barra de progresso
   ========================================================= */

const elementosReveal = document.querySelectorAll('.reveal');

// O IntersectionObserver avisa quando um elemento ENTRA na área visível da tela.
// É bem mais leve do que ficar calculando posições a cada movimento de rolagem.
if ('IntersectionObserver' in window) {
  const observador = new IntersectionObserver((entradas, observer) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visible');
        observer.unobserve(entrada.target); // já apareceu: não precisa mais observar
      }
    });
  }, { threshold: 0.12 }); // dispara quando 12% do elemento estiver visível

  elementosReveal.forEach((elemento) => observador.observe(elemento));
} else {
  // Navegadores muito antigos: mostra tudo de uma vez.
  elementosReveal.forEach((elemento) => elemento.classList.add('visible'));
}

/* ---------- Barra de progresso da rolagem ---------- */
const scrollProgress = document.querySelector('#scrollProgress');
let atualizacaoAgendada = false;

function atualizarProgresso() {
  const altura = document.documentElement.scrollHeight - window.innerHeight;
  const progresso = altura > 0 ? (window.scrollY / altura) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = `${progresso}%`;
  atualizacaoAgendada = false;
}

// MELHORIA (desempenho):
// 1) { passive: true } avisa ao navegador que não vamos bloquear a rolagem,
//    então ele pode rolar a página sem esperar o nosso código.
// 2) O evento "scroll" dispara dezenas de vezes por segundo. Com
//    requestAnimationFrame, atualizamos a barra no máximo uma vez por quadro
//    de tela (cerca de 60 vezes por segundo), e não a cada evento.
window.addEventListener('scroll', () => {
  if (!atualizacaoAgendada) {
    atualizacaoAgendada = true;
    requestAnimationFrame(atualizarProgresso);
  }
}, { passive: true });
