/* =========================================================
   three-scene.js — Galeria 3D com Three.js
   ---------------------------------------------------------
   Ideia geral do Three.js:
     cena (scene)       = o "palco" onde ficam os objetos e as luzes
     câmera (camera)    = de onde olhamos a cena
     renderizador       = desenha a cena no <canvas> a cada quadro
     malha (mesh)       = geometria (forma) + material (cor/brilho)
   ========================================================= */
import * as THREE from 'three';

const canvas = document.querySelector('#cultureCanvas');
const loading = document.querySelector('#threeLoading');
const titleLabel = document.querySelector('#objectTitle');
const heading = document.querySelector('#objectHeading');
const description = document.querySelector('#objectDescription');

// MELHORIA: respeita a configuração do sistema "reduzir movimento"
// (usada por pessoas que sentem tontura com animações).
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (erro) {
    if (loading) loading.textContent = 'Seu navegador não disponibilizou o recurso 3D. Você ainda pode explorar as imagens abaixo.';
  }

  if (renderer) {
    /* ---------- Cena, câmera e luzes ---------- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100); // (ângulo de visão, proporção, perto, longe)
    camera.position.set(0, 0, 6.2);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // limita a 2x para não pesar em telas muito densas
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    scene.add(new THREE.AmbientLight(0xffffff, 1.7));            // luz geral, ilumina tudo por igual
    const keyLight = new THREE.DirectionalLight(0xffd38a, 3.2);  // luz principal, como o sol
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0x9b4d2b, 18, 12);    // luz de preenchimento avermelhada
    fillLight.position.set(-3, -2, 3);
    scene.add(fillLight);

    // O "group" junta todas as peças do objeto. Girar o grupo gira tudo junto.
    const group = new THREE.Group();
    scene.add(group);

    /* ---------- Materiais (reaproveitados por todos os objetos) ---------- */
    const gold = new THREE.MeshStandardMaterial({ color: 0xc99a45, metalness: 0.58, roughness: 0.3 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x4a2d1e, metalness: 0.25, roughness: 0.55 });
    const red = new THREE.MeshStandardMaterial({ color: 0x9c3d2c, metalness: 0.2, roughness: 0.48 });
    const cream = new THREE.MeshStandardMaterial({ color: 0xe8d4ad, metalness: 0.2, roughness: 0.4 });

    // Remove o objeto atual antes de montar outro.
    // dispose() libera a memória da placa de vídeo usada pela geometria.
    // (Simplificação: a lista "geometries" que existia antes ficava sempre vazia
    //  e não tinha efeito, por isso foi removida.)
    function clearObject() {
      while (group.children.length) {
        const objeto = group.children[0];
        group.remove(objeto);
        if (objeto.geometry) objeto.geometry.dispose();
      }
    }

    // Função auxiliar: cria uma malha, posiciona e coloca no grupo.
    function addMesh(geometry, material, x = 0, y = 0, z = 0) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      group.add(mesh);
      return mesh;
    }

    /* ---------- Os três objetos da galeria ---------- */
    function buildGeometry() {
      clearObject();
      addMesh(new THREE.IcosahedronGeometry(1.22, 1), gold);
      addMesh(new THREE.TorusGeometry(1.55, 0.045, 12, 100), cream).rotation.x = 0.75;
      addMesh(new THREE.TorusGeometry(1.72, 0.035, 10, 100), red).rotation.y = 0.9;
      // 8 cubinhos em círculo: usamos seno e cosseno para achar cada posição.
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        addMesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), i % 2 ? red : cream, Math.cos(angle) * 1.85, Math.sin(angle) * 1.85, 0).rotation.z = angle;
      }
      setInfo('Forma ancestral', 'Padrões geométricos aparecem em diferentes expressões artísticas do continente africano e de suas diásporas. Cada forma tem contexto próprio: não existe uma única estética africana.');
    }

    function buildMask() {
      clearObject();
      addMesh(new THREE.SphereGeometry(1, 32, 24), dark).scale.set(0.82, 1.2, 0.42);
      addMesh(new THREE.ConeGeometry(0.23, 0.8, 5), gold, 0, 1.35, 0).rotation.z = Math.PI;
      addMesh(new THREE.ConeGeometry(0.23, 0.8, 5), gold, -0.58, 0.95, 0).rotation.z = -0.75;
      addMesh(new THREE.ConeGeometry(0.23, 0.8, 5), gold, 0.58, 0.95, 0).rotation.z = 0.75;
      addMesh(new THREE.SphereGeometry(0.13, 16, 12), cream, -0.32, 0.25, 0.38);
      addMesh(new THREE.SphereGeometry(0.13, 16, 12), cream, 0.32, 0.25, 0.38);
      addMesh(new THREE.BoxGeometry(0.14, 0.5, 0.14), red, 0, -0.1, 0.42);
      addMesh(new THREE.TorusGeometry(0.34, 0.055, 8, 32, Math.PI), gold, 0, -0.56, 0.36).rotation.z = Math.PI;
      setInfo('Máscara estilizada', 'Esta peça é uma criação geométrica digital inspirada em formas de arte escultural. Não reproduz uma máscara ritual ou uma tradição específica. Máscaras africanas possuem significados diversos conforme cada povo e contexto.');
    }

    function buildDrum() {
      clearObject();
      addMesh(new THREE.CylinderGeometry(0.72, 0.95, 1.8, 12, 1), dark);
      addMesh(new THREE.CylinderGeometry(0.73, 0.73, 0.12, 32), cream, 0, 0.96, 0);
      addMesh(new THREE.CylinderGeometry(0.96, 0.96, 0.12, 32), gold, 0, -0.95, 0);
      for (let i = 0; i < 10; i++) {
        const angle = Math.PI * 2 * i / 10;
        addMesh(new THREE.BoxGeometry(0.07, 1.35, 0.07), gold, Math.cos(angle) * 0.78, 0, Math.sin(angle) * 0.78);
      }
      for (let i = 0; i < 3; i++) {
        addMesh(new THREE.TorusGeometry(0.78 - i * 0.07, 0.035, 8, 48), red, 0, 0.5 - i * 0.5, 0).rotation.x = Math.PI / 2;
      }
      setInfo('Tambor simbólico', 'Tambores e instrumentos de percussão estão presentes em muitas manifestações afro-brasileiras. Os instrumentos, ritmos e seus sentidos variam entre comunidades e tradições. Este modelo é ilustrativo.');
    }

    function setInfo(titulo, texto) {
      if (titleLabel) titleLabel.textContent = titulo;
      if (heading) heading.textContent = titulo;
      if (description) description.textContent = texto;
    }

    /* ---------- Estado da interação ---------- */
    const builders = [buildGeometry, buildMask, buildDrum];
    const ZOOM_MIN = 0.65;
    const ZOOM_MAX = 1.65;
    let rotationX = -0.12;
    let rotationY = 0.35;
    let zoom = 1;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    // Função "limitar": mantém um número entre um mínimo e um máximo.
    const limitar = (valor, min, max) => Math.max(min, Math.min(max, valor));

    function resize() {
      const width = canvas.clientWidth || 600;
      const height = canvas.clientHeight || 490;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    /* ---------- Laço de animação ---------- */
    // MELHORIA (desempenho/bateria): antes, a animação rodava SEMPRE, mesmo com a
    // galeria fora da tela ou com a aba do navegador minimizada. Agora ela só roda
    // quando a galeria está visível ("galeriaVisivel") e a aba está aberta.
    let galeriaVisivel = false;
    let idAnimacao = null;

    function animate() {
      idAnimacao = requestAnimationFrame(animate);
      if (!dragging && !reduzirMovimento) rotationY += 0.0025; // giro automático lento
      // "Suavização": a rotação anda 8% do caminho até o alvo a cada quadro.
      group.rotation.x += (rotationX - group.rotation.x) * 0.08;
      group.rotation.y += (rotationY - group.rotation.y) * 0.08;
      group.scale.setScalar(zoom);
      renderer.render(scene, camera);
    }

    function iniciarAnimacao() {
      if (idAnimacao === null && galeriaVisivel && !document.hidden) animate();
    }
    function pararAnimacao() {
      if (idAnimacao !== null) cancelAnimationFrame(idAnimacao);
      idAnimacao = null;
    }

    new IntersectionObserver(([entrada]) => {
      galeriaVisivel = entrada.isIntersecting;
      if (galeriaVisivel) iniciarAnimacao(); else pararAnimacao();
    }).observe(canvas);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pararAnimacao(); else iniciarAnimacao();
    });

    /* ---------- Arrastar para girar (mouse, toque e caneta) ---------- */
    // Eventos "pointer" funcionam igual para mouse, dedo e caneta.
    canvas.addEventListener('pointerdown', (evento) => {
      dragging = true;
      lastX = evento.clientX;
      lastY = evento.clientY;
      canvas.setPointerCapture(evento.pointerId); // continua recebendo o movimento mesmo fora do canvas
    });
    canvas.addEventListener('pointermove', (evento) => {
      if (!dragging) return;
      rotationY += (evento.clientX - lastX) * 0.009;
      rotationX = limitar(rotationX + (evento.clientY - lastY) * 0.009, -1.2, 1.2);
      lastX = evento.clientX;
      lastY = evento.clientY;
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((nome) => canvas.addEventListener(nome, () => { dragging = false; }));

    /* ---------- Zoom com a roda do mouse ---------- */
    // MELHORIA (usabilidade): antes, qualquer giro da roda sobre o canvas era
    // "capturado" e a PÁGINA PARAVA DE ROLAR, o que confundia o visitante.
    // Agora o zoom só acontece com a tecla Ctrl pressionada; sem Ctrl, a página rola normalmente.
    canvas.addEventListener('wheel', (evento) => {
      if (!evento.ctrlKey) return;
      evento.preventDefault();
      zoom = limitar(zoom + (evento.deltaY < 0 ? 0.06 : -0.06), ZOOM_MIN, ZOOM_MAX);
    }, { passive: false });

    /* ---------- Teclado no canvas ---------- */
    // MELHORIA (acessibilidade): com o canvas em foco (tabindex="0" no HTML),
    // as setas giram o objeto e as teclas + e − aproximam e afastam.
    canvas.addEventListener('keydown', (evento) => {
      const acoes = {
        ArrowLeft: () => { rotationY -= 0.3; },
        ArrowRight: () => { rotationY += 0.3; },
        ArrowUp: () => { rotationX = limitar(rotationX - 0.3, -1.2, 1.2); },
        ArrowDown: () => { rotationX = limitar(rotationX + 0.3, -1.2, 1.2); },
        '+': () => { zoom = limitar(zoom + 0.12, ZOOM_MIN, ZOOM_MAX); },
        '-': () => { zoom = limitar(zoom - 0.12, ZOOM_MIN, ZOOM_MAX); }
      };
      if (acoes[evento.key]) {
        evento.preventDefault(); // evita que as setas rolem a página
        acoes[evento.key]();
      }
    });

    /* ---------- Botões de controle ---------- */
    function reiniciarVisao() { rotationX = -0.12; rotationY = 0.35; zoom = 1; }
    // O "?." (encadeamento opcional) só chama addEventListener se o botão existir.
    document.querySelector('#rotateLeft')?.addEventListener('click', () => { rotationY -= 0.55; });
    document.querySelector('#rotateRight')?.addEventListener('click', () => { rotationY += 0.55; });
    document.querySelector('#zoomIn')?.addEventListener('click', () => { zoom = limitar(zoom + 0.12, ZOOM_MIN, ZOOM_MAX); });
    document.querySelector('#zoomOut')?.addEventListener('click', () => { zoom = limitar(zoom - 0.12, ZOOM_MIN, ZOOM_MAX); });
    document.querySelector('#reset3D')?.addEventListener('click', reiniciarVisao);

    /* ---------- Escolha do objeto ---------- */
    document.querySelectorAll('.object-choice').forEach((botao) => {
      botao.addEventListener('click', () => {
        document.querySelectorAll('.object-choice').forEach((item) => {
          item.classList.remove('active');
          item.setAttribute('aria-pressed', 'false');
        });
        botao.classList.add('active');
        botao.setAttribute('aria-pressed', 'true'); // MELHORIA: informa ao leitor de tela qual está escolhido
        reiniciarVisao();
        builders[Number(botao.dataset.object)]?.();
      });
    });

    /* ---------- Início ---------- */
    buildGeometry();
    resize();
    // MELHORIA: ResizeObserver percebe mudanças no tamanho do PRÓPRIO canvas
    // (inclusive ao girar o celular), e não só da janela.
    new ResizeObserver(resize).observe(canvas);
    if (loading) loading.style.display = 'none';
    window.galeria3DPronta = true; // avisa o main.js de que a galeria carregou (ver seção 5 de main.js)
  }
}
