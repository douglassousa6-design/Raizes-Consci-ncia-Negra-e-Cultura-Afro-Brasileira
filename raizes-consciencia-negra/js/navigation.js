/* =========================================================
   navigation.js — Menu do celular (botão "hambúrguer")
   ========================================================= */

const menuToggle = document.querySelector('#menuToggle');
const mainNav = document.querySelector('#mainNav');

// Função única para abrir/fechar o menu.
// Antes, o mesmo código de "fechar" estava repetido em dois lugares.
// Juntar em uma função evita erros: se mudar algo, muda em um lugar só.
function definirMenu(aberto) {
  mainNav.classList.toggle('ativo', aberto); // o 2º parâmetro força ligar (true) ou desligar (false)
  menuToggle.setAttribute('aria-expanded', aberto);
  menuToggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const estaAberto = mainNav.classList.contains('ativo');
    definirMenu(!estaAberto); // "!" inverte: se estava aberto, fecha; se estava fechado, abre
  });

  // Ao clicar em um link, o menu fecha (a página rola até a seção escolhida).
  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => definirMenu(false));
  });

  // MELHORIA (acessibilidade): a tecla Esc fecha o menu e devolve o foco ao botão,
  // para quem usa teclado não "se perder" na página.
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && mainNav.classList.contains('ativo')) {
      definirMenu(false);
      menuToggle.focus();
    }
  });
}
