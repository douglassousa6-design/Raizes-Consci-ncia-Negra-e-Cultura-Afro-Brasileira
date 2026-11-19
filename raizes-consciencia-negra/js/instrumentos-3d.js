/* =====================================================================
   instrumentos-3d.js — Modelos 3D dos instrumentos da capoeira
   ---------------------------------------------------------------------
   OBJETIVO DIDÁTICO
   Mostrar que objetos 3D "complexos" podem ser montados juntando
   FORMAS SIMPLES, como se fossem peças de LEGO:

     Forma do Three.js       Parece com...          Usada em...
     -------------------     -------------------    ---------------------------
     CylinderGeometry        cano, lata, moeda      arame, atabaque, pandeiro
     ConeGeometry            casquinha de sorvete   agogô, caxixi
     SphereGeometry          bola                   cabaça do berimbau
     TorusGeometry           rosquinha / anel       verga do berimbau, aros
     BoxGeometry             caixa                  cunhas do atabaque
     CircleGeometry          disco achatado         boca da cabaça

   COMO O ARQUIVO ESTÁ ORGANIZADO (siga os PASSOS na ordem)
     PASSO 1 – Preparar a cena (palco, câmera, luzes e renderizador)
     PASSO 2 – Criar os materiais (as "tintas" de cada parte)
     PASSO 3 – Função auxiliar criarPeca() (cria e encaixa uma peça)
     PASSO 4 – A "receita" de cada instrumento
     PASSO 5 – Trocar de instrumento e montar a legenda
     PASSO 6 – Interação: arrastar para girar e teclado
     PASSO 7 – Animação (desenhar a cena muitas vezes por segundo)

   SISTEMA DE COORDENADAS (como posicionar as peças)
       y (para cima)
       |
       |____ x (para a direita)
      /
     z (saindo da tela, em direção a você)
   O ponto (0, 0, 0) é o centro do palco. As medidas não são em
   centímetros: são "unidades" do Three.js. O que importa é a proporção.

   ÂNGULOS
   O Three.js usa RADIANOS, não graus. Lembre-se:
     Math.PI = 180°   |   Math.PI / 2 = 90°   |   Math.PI * 2 = 360°
   ===================================================================== */

// "import" traz a biblioteca Three.js. Por isso este arquivo é carregado
// no HTML com type="module" (veja o final do index.html).
import * as THREE from 'three';

const canvas = document.querySelector('#instrumentCanvas');
const legenda = document.querySelector('#instrumentLegend');
const aviso = document.querySelector('#instrumentLoading');

// Respeita a configuração do sistema "reduzir movimento".
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =====================================================================
   PASSO 1 – PREPARAR A CENA
   ===================================================================== */
let renderizador;
try {
  // O renderizador desenha a cena dentro do <canvas>.
  // antialias: suaviza as bordas | alpha: deixa o fundo transparente.
  renderizador = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch (erro) {
  // Alguns computadores antigos não têm suporte a WebGL (gráficos 3D).
  if (aviso) aviso.textContent = 'Seu navegador não conseguiu exibir o 3D. Veja a foto real dos instrumentos ao lado.';
}

if (canvas && renderizador) {
  renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderizador.outputColorSpace = THREE.SRGBColorSpace;

  // A cena é o "palco": tudo o que aparece precisa ser adicionado a ela.
  const cena = new THREE.Scene();

  // A câmera é o nosso "olho". PerspectiveCamera imita a visão humana:
  // objetos distantes parecem menores.
  // Parâmetros: (ângulo de visão em graus, proporção da tela, distância mínima, distância máxima)
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.1, 7.8); // um pouquinho acima e 7,8 unidades à frente do centro

  // Luzes: sem luz, os materiais "Standard" ficam pretos!
  cena.add(new THREE.AmbientLight(0xffffff, 1.4));          // luz geral, vem de todos os lados
  const luzPrincipal = new THREE.DirectionalLight(0xfff1d6, 2.6); // como o sol: vem de uma direção
  luzPrincipal.position.set(3, 4, 5);
  cena.add(luzPrincipal);
  const luzDeTras = new THREE.DirectionalLight(0xd5a84d, 1.2);    // contorno dourado por trás
  luzDeTras.position.set(-4, 2, -3);
  cena.add(luzDeTras);

  // Um GRUPO junta várias peças. Girar o grupo gira o instrumento inteiro.
  const grupo = new THREE.Group();
  cena.add(grupo);

  /* ===================================================================
     PASSO 2 – MATERIAIS (as "tintas")
     -------------------------------------------------------------------
     MeshStandardMaterial reage à luz de forma realista:
       color     → cor (em hexadecimal, como no CSS, mas com 0x no lugar de #)
       roughness → aspereza: 0 = liso e brilhante, 1 = fosco
       metalness → aparência de metal: 0 = não é metal, 1 = metal
     side: THREE.DoubleSide pinta os DOIS lados da superfície. É necessário
     em peças "ocas", como o aro do pandeiro e os cones do agogô; sem isso,
     o lado de dentro ficaria invisível.
     =================================================================== */
  const materiais = {
    madeira: new THREE.MeshStandardMaterial({ color: 0x9a6236, roughness: 0.75, side: THREE.DoubleSide }),
    madeiraEscura: new THREE.MeshStandardMaterial({ color: 0x5a3820, roughness: 0.8 }),
    couro: new THREE.MeshStandardMaterial({ color: 0xead8b4, roughness: 0.95 }),
    cabaca: new THREE.MeshStandardMaterial({ color: 0xc08a45, roughness: 0.6 }),
    escuro: new THREE.MeshStandardMaterial({ color: 0x241710, roughness: 1 }),
    corda: new THREE.MeshStandardMaterial({ color: 0xf2e6c9, roughness: 1 }),
    arame: new THREE.MeshStandardMaterial({ color: 0xb8b8b8, metalness: 0.9, roughness: 0.25 }),
    metal: new THREE.MeshStandardMaterial({ color: 0xd6d6d6, metalness: 0.85, roughness: 0.3, side: THREE.DoubleSide }),
    dourado: new THREE.MeshStandardMaterial({ color: 0xd5a84d, metalness: 0.75, roughness: 0.3, side: THREE.DoubleSide }),
    bambu: new THREE.MeshStandardMaterial({ color: 0xcfae62, roughness: 0.6 }),
    palha: new THREE.MeshStandardMaterial({ color: 0xd9b26a, roughness: 0.9 })
  };

  /* ===================================================================
     PASSO 3 – FUNÇÃO AUXILIAR criarPeca()
     -------------------------------------------------------------------
     Toda peça 3D (Mesh, "malha") é: FORMA (geometria) + TINTA (material).
     Esta função cria a peça, coloca na posição (x, y, z) e a adiciona
     ao grupo. Ela devolve (return) a peça, para podermos girá-la depois.
     Os valores "= 0" são PADRÕES: se não informarmos x, y ou z, vale 0.
     =================================================================== */
  function criarPeca(forma, material, x = 0, y = 0, z = 0) {
    const peca = new THREE.Mesh(forma, material);
    peca.position.set(x, y, z);
    grupo.add(peca);
    return peca;
  }

  /* ===================================================================
     PASSO 4 – A "RECEITA" DE CADA INSTRUMENTO
     -------------------------------------------------------------------
     Cada instrumento é um objeto com:
       nome     → texto exibido
       partes   → lista usada para montar a LEGENDA (nome, forma e material)
       inclinar → giro inicial em x e y, para mostrar o melhor ângulo
       montar() → função que cria as peças, uma a uma
     Para criar um instrumento novo, copie um bloco, mude as peças
     e acrescente um botão com o mesmo data-instrumento no HTML.
     =================================================================== */
  const instrumentos3D = {

    /* ------------------------- BERIMBAU ------------------------- */
    berimbau: {
      nome: 'Berimbau',
      inclinar: { x: 0, y: 0.5 },
      partes: [
        { nome: 'Verga (arco de madeira)', forma: 'TorusGeometry — um pedaço de anel', material: materiais.madeira },
        { nome: 'Arame', forma: 'CylinderGeometry — cilindro bem fino', material: materiais.arame },
        { nome: 'Cabaça (caixa de som)', forma: 'SphereGeometry — esfera', material: materiais.cabaca },
        { nome: 'Cordão que prende a cabaça', forma: 'CylinderGeometry deitado', material: materiais.corda },
        { nome: 'Baqueta', forma: 'CylinderGeometry inclinado', material: materiais.madeiraEscura },
        { nome: 'Dobrão (moeda ou pedra)', forma: 'CylinderGeometry baixinho, como uma moeda', material: materiais.dourado },
        { nome: 'Caxixi (chocalho de palha)', forma: 'ConeGeometry + CylinderGeometry', material: materiais.palha }
      ],
      montar() {
        // A VERGA é um pedaço de um anel enorme (raio 6).
        // O último número de TorusGeometry é o tamanho do pedaço, em radianos:
        // 0.55 rad ≈ 31°, ou seja, menos de 1/10 do anel. Por isso ele parece um arco.
        const raio = 6;
        const abertura = 0.55;
        const verga = criarPeca(new THREE.TorusGeometry(raio, 0.05, 8, 64, abertura), materiais.madeira, -raio, 0, 0);
        verga.rotation.z = -abertura / 2; // centraliza o arco na vertical

        // Um pouco de trigonometria para o ARAME ligar as duas pontas do arco:
        //   meiaAltura = metade da distância entre as pontas (seno)
        //   recuo      = quanto as pontas ficam "para trás" do meio do arco (cosseno)
        const meiaAltura = raio * Math.sin(abertura / 2);
        const recuo = raio * (1 - Math.cos(abertura / 2));
        // CylinderGeometry(raio de cima, raio de baixo, altura, número de lados)
        criarPeca(new THREE.CylinderGeometry(0.012, 0.012, meiaAltura * 2, 6), materiais.arame, -recuo, 0, 0);

        // CABAÇA: esfera perto da parte de baixo, presa ao arco.
        // scale.set(x, y, z) "estica" a esfera para ela ficar menos perfeita.
        const cabaca = criarPeca(new THREE.SphereGeometry(0.42, 32, 24), materiais.cabaca, 0.36, -1.0, 0);
        cabaca.scale.set(1, 1.08, 1);
        // Boca da cabaça: um disco escuro virado para a direita (+x).
        const boca = criarPeca(new THREE.CircleGeometry(0.2, 32), materiais.escuro, 0.785, -1.0, 0);
        boca.rotation.y = Math.PI / 2; // gira 90° para o disco "olhar" para a direita

        // CORDÃO: cilindro fino deitado (rotation.z = 90°) ligando arame, verga e cabaça.
        const cordao = criarPeca(new THREE.CylinderGeometry(0.022, 0.022, 0.42, 8), materiais.corda, -0.03, -0.95, 0);
        cordao.rotation.z = Math.PI / 2;

        // BAQUETA: vareta inclinada ao lado do berimbau.
        const baqueta = criarPeca(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 8), materiais.madeiraEscura, 1.35, 0.35, 0);
        baqueta.rotation.z = 0.5;

        // DOBRÃO: um cilindro bem baixinho vira uma moeda.
        const dobrao = criarPeca(new THREE.CylinderGeometry(0.13, 0.13, 0.025, 24), materiais.dourado, -0.55, -0.25, 0.1);
        dobrao.rotation.z = Math.PI / 2;

        // CAXIXI: cone de palha + fundo de cabaça + alça (pedaço de anel).
        criarPeca(new THREE.ConeGeometry(0.17, 0.36, 20), materiais.palha, 1.4, -0.7, 0);
        criarPeca(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 20), materiais.cabaca, 1.4, -0.89, 0);
        criarPeca(new THREE.TorusGeometry(0.07, 0.015, 6, 20, Math.PI), materiais.palha, 1.4, -0.5, 0);
      }
    },

    /* ------------------------- ATABAQUE ------------------------- */
    atabaque: {
      nome: 'Atabaque',
      inclinar: { x: 0.25, y: 0.3 },
      partes: [
        { nome: 'Corpo de madeira', forma: 'CylinderGeometry — mais largo em cima do que embaixo', material: materiais.madeira },
        { nome: 'Couro (onde se bate)', forma: 'CylinderGeometry bem baixo', material: materiais.couro },
        { nome: 'Aros', forma: 'TorusGeometry — anéis completos', material: materiais.madeiraEscura },
        { nome: 'Cordas de afinação', forma: 'CylinderGeometry finos, repetidos com um laço for', material: materiais.corda },
        { nome: 'Cunhas (esticam o couro)', forma: 'BoxGeometry — caixinhas', material: materiais.madeiraEscura }
      ],
      montar() {
        // Cilindro com raio de cima (0.55) MAIOR que o de baixo (0.38):
        // vira um tambor que afina para baixo.
        criarPeca(new THREE.CylinderGeometry(0.55, 0.38, 2.4, 32), materiais.madeira, 0, 0, 0);
        // Couro: cilindro baixinho no topo (y = 1.2 é a metade da altura 2.4).
        criarPeca(new THREE.CylinderGeometry(0.57, 0.57, 0.05, 32), materiais.couro, 0, 1.22, 0);

        // Aros: o anel (Torus) nasce "em pé"; rotation.x = 90° deita ele.
        const aroDeCima = criarPeca(new THREE.TorusGeometry(0.57, 0.04, 8, 48), materiais.madeiraEscura, 0, 1.17, 0);
        aroDeCima.rotation.x = Math.PI / 2;
        const aroDoMeio = criarPeca(new THREE.TorusGeometry(0.5, 0.04, 8, 48), materiais.madeiraEscura, 0, 0.05, 0);
        aroDoMeio.rotation.x = Math.PI / 2;
        const aroDeBaixo = criarPeca(new THREE.TorusGeometry(0.39, 0.035, 8, 48), materiais.madeiraEscura, 0, -1.18, 0);
        aroDeBaixo.rotation.x = Math.PI / 2;

        // Laço FOR: repete o bloco 12 vezes, uma para cada corda/cunha.
        // Para espalhar em CÍRCULO usamos: x = cos(ângulo) * raio, z = sin(ângulo) * raio
        const quantidade = 12;
        for (let i = 0; i < quantidade; i++) {
          const angulo = (Math.PI * 2 * i) / quantidade; // divide 360° em 12 partes iguais
          const x = Math.cos(angulo);
          const z = Math.sin(angulo);
          criarPeca(new THREE.CylinderGeometry(0.012, 0.012, 1.1, 4), materiais.corda, x * 0.545, 0.62, z * 0.545);
          const cunha = criarPeca(new THREE.BoxGeometry(0.09, 0.22, 0.07), materiais.madeiraEscura, x * 0.53, -0.08, z * 0.53);
          cunha.rotation.y = -angulo; // vira a cunha para fora, acompanhando o círculo
        }
      }
    },

    /* ------------------------- PANDEIRO ------------------------- */
    pandeiro: {
      nome: 'Pandeiro',
      inclinar: { x: 0.95, y: 0 },
      partes: [
        { nome: 'Aro de madeira', forma: 'CylinderGeometry oco (openEnded = true)', material: materiais.madeira },
        { nome: 'Couro', forma: 'CylinderGeometry bem fino', material: materiais.couro },
        { nome: 'Platinelas (pares de discos de metal)', forma: 'CylinderGeometry baixinhos, repetidos com for', material: materiais.metal }
      ],
      montar() {
        // O 6º parâmetro "true" (openEnded) deixa o cilindro SEM tampa: vira um aro.
        // (heightSegments = 1 é o 5º parâmetro: quantas "fatias" na altura)
        criarPeca(new THREE.CylinderGeometry(1.1, 1.1, 0.3, 64, 1, true), materiais.madeira, 0, 0, 0);
        // Couro esticado em cima do aro.
        criarPeca(new THREE.CylinderGeometry(1.1, 1.1, 0.012, 64), materiais.couro, 0, 0.15, 0);

        // 5 pares de platinelas espalhados pelo aro.
        const pares = 5;
        for (let i = 0; i < pares; i++) {
          const angulo = (Math.PI * 2 * i) / pares;
          const x = Math.cos(angulo) * 1.1;
          const z = Math.sin(angulo) * 1.1;
          criarPeca(new THREE.CylinderGeometry(0.15, 0.15, 0.015, 24), materiais.metal, x, 0.035, z); // disco de cima
          criarPeca(new THREE.CylinderGeometry(0.15, 0.15, 0.015, 24), materiais.metal, x, -0.035, z); // disco de baixo
          criarPeca(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), materiais.arame, x, 0, z);       // pino que segura
        }
      }
    },

    /* --------------------------- AGOGÔ --------------------------- */
    agogo: {
      nome: 'Agogô',
      inclinar: { x: 0.15, y: 0.4 },
      partes: [
        { nome: 'Campânula grande (som grave)', forma: 'ConeGeometry oco', material: materiais.dourado },
        { nome: 'Campânula pequena (som agudo)', forma: 'ConeGeometry oco, menor', material: materiais.dourado },
        { nome: 'Haste que une as campânulas', forma: 'TorusGeometry — meio anel', material: materiais.metal },
        { nome: 'Baqueta', forma: 'CylinderGeometry', material: materiais.madeiraEscura }
      ],
      montar() {
        // ConeGeometry(raio da base, altura, lados, fatias, oco?)
        // Os dois cones terminam na MESMA altura (y = 0.45) para a haste encaixar.
        criarPeca(new THREE.ConeGeometry(0.42, 1.3, 40, 1, true), materiais.dourado, -0.55, -0.2, 0);
        criarPeca(new THREE.ConeGeometry(0.31, 0.98, 40, 1, true), materiais.dourado, 0.55, -0.04, 0);
        // Meio anel (Math.PI = 180°) ligando as pontas dos dois cones.
        criarPeca(new THREE.TorusGeometry(0.55, 0.035, 8, 40, Math.PI), materiais.metal, 0, 0.45, 0);
        // Baqueta inclinada.
        const baqueta = criarPeca(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 8), materiais.madeiraEscura, 1.45, -0.1, 0);
        baqueta.rotation.z = 0.6;
      }
    },

    /* ------------------------- RECO-RECO ------------------------- */
    recoreco: {
      nome: 'Reco-reco',
      inclinar: { x: 0.35, y: -0.35 },
      partes: [
        { nome: 'Corpo de bambu', forma: 'CylinderGeometry deitado', material: materiais.bambu },
        { nome: 'Sulcos (cortes que fazem o som)', forma: 'TorusGeometry — anéis repetidos com for', material: materiais.madeiraEscura },
        { nome: 'Vareta (raspa os sulcos)', forma: 'CylinderGeometry fino', material: materiais.madeira }
      ],
      montar() {
        // Cilindro "deitado": por padrão ele nasce em pé (eixo y);
        // rotation.z = 90° o deita sobre o eixo x.
        const corpo = criarPeca(new THREE.CylinderGeometry(0.28, 0.28, 2.6, 32), materiais.bambu, 0, 0, 0);
        corpo.rotation.z = Math.PI / 2;

        // 16 sulcos, um a cada 0.1 unidade, começando em x = -0.75.
        for (let i = 0; i < 16; i++) {
          const sulco = criarPeca(new THREE.TorusGeometry(0.285, 0.02, 6, 40), materiais.madeiraEscura, -0.75 + i * 0.1, 0, 0);
          sulco.rotation.y = Math.PI / 2; // gira o anel para ele "abraçar" o bambu
        }
        // Nós do bambu nas pontas (anéis mais grossos).
        [-1.15, 1.15].forEach((x) => {   // forEach: faz o mesmo para cada valor da lista
          const no = criarPeca(new THREE.TorusGeometry(0.29, 0.04, 8, 40), materiais.bambu, x, 0, 0);
          no.rotation.y = Math.PI / 2;
        });

        // Vareta apoiada sobre os sulcos.
        const vareta = criarPeca(new THREE.CylinderGeometry(0.025, 0.025, 1.7, 8), materiais.madeira, 0.1, 0.5, 0.15);
        vareta.rotation.z = Math.PI / 2 - 0.35;
      }
    }
  };

  /* ===================================================================
     PASSO 5 – TROCAR DE INSTRUMENTO E MONTAR A LEGENDA
     =================================================================== */

  // Remove todas as peças do instrumento anterior.
  // dispose() libera a memória da placa de vídeo usada pela forma.
  function limparGrupo() {
    while (grupo.children.length > 0) {
      const peca = grupo.children[0];
      grupo.remove(peca);
      peca.geometry.dispose();
    }
  }

  // Cria um item da legenda para cada parte: bolinha colorida + nome + forma usada.
  // Usamos createElement + textContent (em vez de innerHTML) por segurança.
  function mostrarLegenda(partes) {
    if (!legenda) return;
    legenda.replaceChildren(); // apaga os itens anteriores
    partes.forEach((parte) => {
      const item = document.createElement('li');

      const bolinha = document.createElement('span');
      bolinha.className = 'legend-dot';
      bolinha.setAttribute('aria-hidden', 'true');
      // getHexString() devolve a cor do material, ex.: "9a6236"
      bolinha.style.background = '#' + parte.material.color.getHexString();

      const nome = document.createElement('strong');
      nome.textContent = parte.nome;

      const forma = document.createElement('small');
      forma.textContent = parte.forma;

      item.append(bolinha, nome, forma);
      legenda.append(item);
    });
  }

  // Ângulo atual (alvo) do instrumento. O PASSO 7 gira suavemente até ele.
  let giroX = 0;
  let giroY = 0;

  function montarInstrumento(chave) {
    const instrumento = instrumentos3D[chave];
    if (!instrumento) return; // chave desconhecida: não faz nada
    limparGrupo();
    instrumento.montar();
    mostrarLegenda(instrumento.partes);
    giroX = instrumento.inclinar.x;
    giroY = instrumento.inclinar.y;
    grupo.rotation.set(giroX, giroY - 0.6, 0); // começa um pouco "atrás" para dar um giro de entrada
    canvas.setAttribute('aria-label', `Modelo 3D do instrumento ${instrumento.nome}. Use as setas do teclado para girar.`);
  }

  // OUVINDO UM EVENTO PERSONALIZADO
  // Quando um botão de instrumento é clicado, o arquivo contribuicoes.js
  // "anuncia" o evento 'instrumento-escolhido' com o nome do instrumento
  // em evento.detail. Aqui só precisamos "escutar" esse anúncio.
  // Assim, os dois arquivos conversam sem um depender do código do outro.
  document.addEventListener('instrumento-escolhido', (evento) => {
    montarInstrumento(evento.detail);
  });

  /* ===================================================================
     PASSO 6 – INTERAÇÃO
     =================================================================== */
  let arrastando = false;
  let ultimoX = 0;
  let ultimoY = 0;

  // Eventos "pointer" funcionam com mouse, dedo e caneta.
  canvas.addEventListener('pointerdown', (evento) => {
    arrastando = true;
    ultimoX = evento.clientX;
    ultimoY = evento.clientY;
    canvas.setPointerCapture(evento.pointerId);
  });
  canvas.addEventListener('pointermove', (evento) => {
    if (!arrastando) return;
    giroY += (evento.clientX - ultimoX) * 0.01; // mover na horizontal gira em torno do eixo y
    giroX += (evento.clientY - ultimoY) * 0.01; // mover na vertical gira em torno do eixo x
    giroX = Math.max(-1.3, Math.min(1.3, giroX)); // limita para não virar de cabeça para baixo
    ultimoX = evento.clientX;
    ultimoY = evento.clientY;
  });
  ['pointerup', 'pointercancel'].forEach((nome) => canvas.addEventListener(nome, () => { arrastando = false; }));

  // Teclado: setas giram o instrumento quando o canvas está em foco.
  canvas.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowLeft') giroY -= 0.3;
    else if (evento.key === 'ArrowRight') giroY += 0.3;
    else if (evento.key === 'ArrowUp') giroX = Math.max(-1.3, giroX - 0.3);
    else if (evento.key === 'ArrowDown') giroX = Math.min(1.3, giroX + 0.3);
    else return;          // outra tecla: não faz nada
    evento.preventDefault(); // impede a página de rolar com as setas
  });

  // Ajusta o desenho ao tamanho do canvas (inclusive ao girar o celular).
  function ajustarTamanho() {
    const largura = canvas.clientWidth || 500;
    const altura = canvas.clientHeight || 380;
    renderizador.setSize(largura, altura, false);
    camera.aspect = largura / altura;
    camera.updateProjectionMatrix(); // obrigatório depois de mudar a câmera
  }
  new ResizeObserver(ajustarTamanho).observe(canvas);

  /* ===================================================================
     PASSO 7 – ANIMAÇÃO
     -------------------------------------------------------------------
     requestAnimationFrame pede ao navegador para chamar a função de novo
     no próximo quadro (cerca de 60 vezes por segundo). Cada chamada
     atualiza o giro e redesenha a cena: é isso que cria o movimento.
     Para economizar bateria, só animamos quando o palco está visível.
     =================================================================== */
  let animando = null;
  let visivel = false;

  function animar() {
    animando = requestAnimationFrame(animar);
    if (!arrastando && !reduzirMovimento) giroY += 0.004; // giro automático bem lento
    // "Suavização": a cada quadro, anda 8% do caminho até o ângulo alvo.
    grupo.rotation.x += (giroX - grupo.rotation.x) * 0.08;
    grupo.rotation.y += (giroY - grupo.rotation.y) * 0.08;
    renderizador.render(cena, camera);
  }
  function ligar() { if (animando === null && visivel && !document.hidden) animar(); }
  function desligar() { if (animando !== null) cancelAnimationFrame(animando); animando = null; }

  new IntersectionObserver(([entrada]) => {
    visivel = entrada.isIntersecting;
    if (visivel) ligar(); else desligar();
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? desligar() : ligar()));

  /* ---------- INÍCIO ---------- */
  // Monta o instrumento cujo botão estiver ativo (normalmente o berimbau).
  const botaoAtivo = document.querySelector('.instrument-choice.active');
  montarInstrumento(botaoAtivo ? botaoAtivo.dataset.instrumento : 'berimbau');
  ajustarTamanho();
  if (aviso) aviso.hidden = true;     // esconde "Carregando..."
  window.instrumentos3DProntos = true; // avisa o contribuicoes.js (plano B)

  // Deixa o grupo acessível no console do navegador para experimentos em aula.
  // Experimente digitar no console (F12):  instrumento3D.scale.set(2, 2, 2)
  window.instrumento3D = grupo;
}
