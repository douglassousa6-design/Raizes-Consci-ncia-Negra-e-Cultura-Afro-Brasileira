/* =====================================================================
   capoeiristas-3d.js — Dois capoeiristas jogando na roda (Three.js)
   ---------------------------------------------------------------------
   VERSÃO 2: animação mais natural.
   Este arquivo mostra QUATRO técnicas usadas em jogos e filmes de animação.

   1) ESQUELETO EM CAMADAS (hierarquia)
      Cada articulação é um THREE.Group pendurado em outro. Girar o ombro
      gira o braço, o antebraço e a mão juntos, como no corpo humano.

        raiz (lugar do jogador na roda)
         └─ quadril
             ├─ tronco ─┬─ pescoço ── cabeça
             │          ├─ ombro E ── cotovelo E ── mão
             │          └─ ombro D ── cotovelo D ── mão
             ├─ perna E ── joelho E ── tornozelo E ── pé
             └─ perna D ── joelho D ── tornozelo D ── pé

   2) CINEMÁTICA INVERSA (IK) NAS PERNAS
      Cinemática "direta": dizemos os ÂNGULOS e descobrimos onde o pé vai parar.
      Cinemática "inversa": dizemos onde o PÉ deve ficar e a matemática
      descobre os ângulos do quadril e do joelho. Assim o pé não escorrega
      nem afunda no chão. A conta usa a LEI DOS COSSENOS (veja o PASSO 6).

   3) CURVA SUAVE ENTRE AS POSES (Catmull-Rom)
      Na versão 1, o boneco parava em cada pose (parecia um robô). Agora a
      animação usa uma curva que PASSA por todas as poses sem frear,
      levando em conta a pose anterior e a seguinte (PASSO 7).

   4) CAMADA "PROCEDURAL" (calculada a cada quadro)
      Detalhes que não precisam ser desenhados em cada pose:
        • a cabeça compensa o giro do corpo e continua olhando o adversário
          (na capoeira, nunca se tira os olhos do outro jogador);
        • o pé levanta um pouco quando troca de lugar;
        • os dois jogadores circulam devagar pela roda.

   ORGANIZAÇÃO (siga os PASSOS)
     PASSO 1 – Cena, câmera, luzes, sombras e chão
     PASSO 2 – Materiais
     PASSO 3 – Construir um capoeirista
     PASSO 4 – Poses (onde ficam os pés + ângulos dos braços e do tronco)
     PASSO 5 – Sequências de movimentos
     PASSO 6 – Cinemática inversa das pernas
     PASSO 7 – Motor de animação (curva Catmull-Rom)
     PASSO 8 – Controles da página
     PASSO 9 – Laço de animação

   AVISO: os bonecos são uma simplificação. Os movimentos reais da
   capoeira se aprendem na roda, com um mestre.
   ===================================================================== */
import * as THREE from 'three';

const canvas = document.querySelector('#rodaCanvas');
const aviso = document.querySelector('#rodaLoading');

// O Three.js trabalha com radianos; nas poses usamos graus, que são mais fáceis de imaginar.
const graus = (valor) => THREE.MathUtils.degToRad(valor);
// Mantém um número entre um mínimo e um máximo.
const limitar = (valor, min, max) => Math.max(min, Math.min(max, valor));

let renderizador;
try {
  renderizador = canvas ? new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }) : null;
} catch (erro) {
  if (aviso) aviso.textContent = 'Seu navegador não conseguiu exibir o 3D.';
}

if (canvas && renderizador) {
  /* ===================================================================
     PASSO 1 – CENA, CÂMERA, LUZES, SOMBRAS E CHÃO
     =================================================================== */
  renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderizador.outputColorSpace = THREE.SRGBColorSpace;
  renderizador.toneMapping = THREE.ACESFilmicToneMapping; // cores mais parecidas com uma foto
  // SOMBRAS REAIS: a luz "fotografa" a cena de cima e descobre o que fica na sombra.
  renderizador.shadowMap.enabled = true;
  renderizador.shadowMap.type = THREE.PCFSoftShadowMap; // bordas da sombra suaves

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
  camera.position.set(0, 1.7, 5.4);
  camera.lookAt(0, 0.65, 0);

  cena.add(new THREE.HemisphereLight(0xfff1dc, 0x2a1d14, 1.3)); // luz do céu + reflexo do chão
  const sol = new THREE.DirectionalLight(0xfff0d8, 2.6);
  sol.position.set(2.5, 6, 3);
  sol.castShadow = true;                 // esta luz projeta sombras
  sol.shadow.mapSize.set(1024, 1024);    // resolução da "foto" de sombras
  sol.shadow.camera.left = -3;           // área coberta pelas sombras
  sol.shadow.camera.right = 3;
  sol.shadow.camera.top = 3;
  sol.shadow.camera.bottom = -3;
  sol.shadow.radius = 4;
  cena.add(sol);
  const contraLuz = new THREE.DirectionalLight(0xd5a84d, 1.4); // luz dourada por trás: contorna os corpos
  contraLuz.position.set(-3, 3, -4);
  cena.add(contraLuz);

  const mundo = new THREE.Group(); // tudo o que gira quando arrastamos o mouse
  cena.add(mundo);

  const chao = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 64),
    new THREE.MeshStandardMaterial({ color: 0x6b4a33, roughness: 0.95 })
  );
  chao.rotation.x = graus(-90);
  chao.receiveShadow = true; // o chão RECEBE as sombras dos jogadores
  mundo.add(chao);

  const linhaDaRoda = new THREE.Mesh(
    new THREE.RingGeometry(2.2, 2.27, 64),
    new THREE.MeshStandardMaterial({ color: 0xd5a84d, roughness: 0.5 })
  );
  linhaDaRoda.rotation.x = graus(-90);
  linhaDaRoda.position.y = 0.003;
  mundo.add(linhaDaRoda);

  /* ===================================================================
     PASSO 2 – MATERIAIS
     =================================================================== */
  const material = (cor, aspereza = 0.7) => new THREE.MeshStandardMaterial({ color: cor, roughness: aspereza });
  const materiais = {
    abada: material(0xf2eee6, 0.9), // abadá: a calça branca da capoeira
    peleA: material(0x4e3020, 0.55),
    peleB: material(0x7a4b2e, 0.55),
    cabelo: material(0x16100c, 1),
    camisaA: material(0xd5a84d),
    camisaB: material(0xa83b2d),
    cordaA: material(0x2f6db5),     // o cordão na cintura indica a graduação
    cordaB: material(0x3f8f4a)
  };

  /* ===================================================================
     PASSO 3 – CONSTRUIR UM CAPOEIRISTA
     -------------------------------------------------------------------
     Novidade: usamos CapsuleGeometry (um cilindro com pontas arredondadas,
     como um comprimido). As pontas redondas escondem as "emendas" nas
     articulações e deixam o corpo mais orgânico.
     =================================================================== */
  const COXA = 0.45;   // comprimento da coxa (em metros, aproximadamente)
  const CANELA = 0.45; // comprimento da canela

  // Adiciona uma peça ao "pai" e liga a sombra dela.
  function adicionar(pai, malha, x = 0, y = 0, z = 0) {
    malha.position.set(x, y, z);
    malha.castShadow = true;
    pai.add(malha);
    return malha;
  }

  // Cria uma ARTICULAÇÃO: um grupo vazio que funciona como dobradiça.
  // Ela fica na posição (x, y, z) RELATIVA ao pai, e tudo o que for
  // pendurado nela gira junto quando ela gira.
  function criarArticulacao(pai, x, y, z) {
    const articulacao = new THREE.Group();
    articulacao.position.set(x, y, z);
    pai.add(articulacao);
    return articulacao;
  }

  // Membro em forma de cápsula pendurado na articulação.
  // CapsuleGeometry(raio, comprimento da parte reta, ...) → altura total = comprimento + 2 × raio
  function criarMembro(articulacao, comprimento, raio, cor) {
    const capsula = new THREE.Mesh(new THREE.CapsuleGeometry(raio, comprimento - raio * 2, 6, 14), cor);
    return adicionar(articulacao, capsula, 0, -comprimento / 2, 0);
  }

  function criarCapoeirista(pele, camisa, corda) {
    const raiz = new THREE.Group();
    mundo.add(raiz);

    // QUADRIL: uma esfera "achatada" (scale) vira a bacia.
    const quadril = criarArticulacao(raiz, 0, 0.95, 0);
    const bacia = adicionar(quadril, new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 14), materiais.abada));
    bacia.scale.set(1.05, 0.75, 0.8);
    const cordao = adicionar(quadril, new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.018, 6, 28), corda), 0, 0.07, 0);
    cordao.rotation.x = graus(90);
    cordao.scale.set(1.02, 0.8, 1);

    // TRONCO: cápsula alargada nos ombros (scale x) e achatada na frente (scale z).
    const tronco = criarArticulacao(quadril, 0, 0.06, 0);
    const peito = adicionar(tronco, new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.24, 6, 18), camisa), 0, 0.27, 0);
    peito.scale.set(1.25, 1, 0.75);

    // PESCOÇO E CABEÇA
    const pescoco = criarArticulacao(tronco, 0, 0.5, 0);
    adicionar(pescoco, new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.1, 12), pele), 0, 0.04, 0);
    const cabeca = adicionar(pescoco, new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 18), pele), 0, 0.18, 0.01);
    cabeca.scale.set(0.92, 1.12, 1);
    // Cabelo: só a parte de cima de uma esfera (os 2 últimos números "cortam" a esfera).
    const cabelo = adicionar(pescoco, new THREE.Mesh(new THREE.SphereGeometry(0.115, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), materiais.cabelo), 0, 0.19, 0);
    cabelo.scale.set(0.95, 1.1, 1.03);

    function criarBraco(lado) { // lado = +1 (esquerdo, x positivo) ou -1 (direito)
      const ombro = criarArticulacao(tronco, 0.21 * lado, 0.44, 0);
      adicionar(ombro, new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 10), camisa)); // "bola" do ombro
      criarMembro(ombro, 0.3, 0.052, camisa);
      const cotovelo = criarArticulacao(ombro, 0, -0.3, 0);
      criarMembro(cotovelo, 0.27, 0.042, pele);
      const mao = adicionar(cotovelo, new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 10), pele), 0, -0.3, 0.01);
      mao.scale.set(0.75, 1.25, 0.55);
      return { ombro, cotovelo };
    }

    function criarPerna(lado) {
      const perna = criarArticulacao(quadril, 0.1 * lado, -0.05, 0);
      perna.rotation.order = 'ZXY'; // primeiro gira para frente/trás (X), depois abre para o lado (Z) — usado pela IK
      criarMembro(perna, COXA, 0.08, materiais.abada);
      const joelho = criarArticulacao(perna, 0, -COXA, 0);
      criarMembro(joelho, CANELA, 0.065, materiais.abada);
      const tornozelo = criarArticulacao(joelho, 0, -CANELA, 0);
      // Pé: cápsula deitada (rotation.x = 90°) e achatada.
      const pe = adicionar(tornozelo, new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.15, 4, 10), pele), 0, -0.035, 0.06);
      pe.rotation.x = graus(90);
      pe.scale.set(1.1, 1, 0.6);
      return { perna, joelho, tornozelo };
    }

    const bracoE = criarBraco(+1);
    const bracoD = criarBraco(-1);
    const pernaE = criarPerna(+1);
    const pernaD = criarPerna(-1);

    return {
      raiz, quadril, tronco, pescoco,
      ombroE: bracoE.ombro, cotoveloE: bracoE.cotovelo,
      ombroD: bracoD.ombro, cotoveloD: bracoD.cotovelo,
      pernaE: pernaE.perna, joelhoE: pernaE.joelho, tornozeloE: pernaE.tornozelo,
      pernaD: pernaD.perna, joelhoD: pernaD.joelho, tornozeloD: pernaD.tornozelo
    };
  }

  const jogadorA = criarCapoeirista(materiais.peleA, materiais.camisaA, materiais.cordaA);
  const jogadorB = criarCapoeirista(materiais.peleB, materiais.camisaB, materiais.cordaB);

  /* ===================================================================
     PASSO 4 – POSES
     -------------------------------------------------------------------
     Agora a pose diz ONDE FICA CADA PÉ (x, y, z) e a cinemática inversa
     calcula as pernas. Coordenadas a partir do lugar do jogador:
        x → para a ESQUERDA do jogador (negativo = direita)
        y → altura (0,06 = tornozelo com o pé apoiado no chão)
        z → para a FRENTE do jogador (negativo = para trás)
     corpo  → posição do quadril (o "centro de gravidade") e giro em graus
     tronco → inclinações em graus | braços → ângulos em graus (como antes)
     As poses descrevem o jogador A; o B usa as mesmas, pois cada um mede
     as posições a partir do PRÓPRIO corpo.
     =================================================================== */
  const CHAO = 0.06; // altura do tornozelo quando o pé está no chão

  // CENTRO DA GINGA: pés paralelos e afastados, joelhos dobrados, braços prontos.
  const CENTRO = {
    corpo: { x: 0, y: 0.74, z: -0.05, giro: 0 },
    tronco: { frente: 22, lado: 0, giro: 0 },
    cabeca: { frente: 0 },
    ombroE: { frente: 40, lado: 22 }, cotoveloE: 65,
    ombroD: { frente: 40, lado: 22 }, cotoveloD: 65,
    peE: { x: 0.3, y: CHAO, z: 0.05 },
    peD: { x: -0.3, y: CHAO, z: 0.05 }
  };

  const copiar = (objeto) => JSON.parse(JSON.stringify(objeto));

  // Cria uma pose alterando só o que muda em relação ao CENTRO.
  function pose(alteracoes) {
    const resultado = copiar(CENTRO);
    for (const chave in alteracoes) {
      if (typeof alteracoes[chave] === 'object') Object.assign(resultado[chave], alteracoes[chave]);
      else resultado[chave] = alteracoes[chave];
    }
    return resultado;
  }

  // Espelha uma pose: troca esquerda e direita e inverte o sinal de x e dos giros.
  function espelhar(p) {
    const e = copiar(p);
    e.ombroE = copiar(p.ombroD); e.ombroD = copiar(p.ombroE);
    e.cotoveloE = p.cotoveloD; e.cotoveloD = p.cotoveloE;
    e.peE = { x: -p.peD.x, y: p.peD.y, z: p.peD.z };
    e.peD = { x: -p.peE.x, y: p.peE.y, z: p.peE.z };
    e.corpo.x = -p.corpo.x;
    e.corpo.giro = -p.corpo.giro;
    e.tronco.lado = -p.tronco.lado;
    e.tronco.giro = -p.tronco.giro;
    return e;
  }

  // GINGA: pé direito vai para trás, o quadril acompanha e gira um pouco,
  // e o braço direito (do lado da perna de trás) protege o rosto.
  const GINGA = pose({
    corpo: { x: 0.04, y: 0.72, z: -0.16, giro: -22 },
    tronco: { frente: 20, giro: -8 },
    ombroD: { frente: 85, lado: -5 }, cotoveloD: 100,
    ombroE: { frente: 25, lado: 35 }, cotoveloE: 40,
    peE: { x: 0.28, y: CHAO, z: 0.12 },
    peD: { x: -0.22, y: CHAO, z: -0.55 }
  });
  const GINGA_OUTRO_LADO = espelhar(GINGA);

  // MEIA-LUA DE FRENTE: o peso vai para a perna esquerda e o pé direito,
  // com a perna esticada, desenha um arco à frente do corpo (de fora para dentro).
  const meiaLua = (peD, extras = {}) => pose({
    corpo: { x: 0.15, y: 0.86, z: 0.02, giro: extras.giro ?? 10 },
    tronco: { frente: extras.frente ?? 6, giro: 5 },
    ombroE: { frente: 30, lado: 55 }, cotoveloE: 30,
    ombroD: { frente: 70, lado: 10 }, cotoveloD: 95,
    peE: { x: 0.27, y: CHAO, z: 0.1 },
    peD
  });
  const MEIA_LUA_1 = meiaLua({ x: -0.55, y: 0.45, z: 0.15 }, { giro: 20 });
  const MEIA_LUA_2 = meiaLua({ x: -0.55, y: 0.95, z: 0.6 }, { frente: -2 });
  const MEIA_LUA_3 = meiaLua({ x: 0.05, y: 1.2, z: 0.85 }, { frente: -12, giro: 0 });
  const MEIA_LUA_4 = meiaLua({ x: 0.55, y: 0.92, z: 0.6 }, { frente: -2, giro: -10 });
  const MEIA_LUA_5 = meiaLua({ x: 0.1, y: 0.25, z: 0.2 }, { giro: -5 });

  // ESQUIVA: abaixar, abrir as pernas e inclinar o tronco para o lado, protegendo a cabeça.
  const ESQUIVA = pose({
    corpo: { x: 0.12, y: 0.46, z: -0.12, giro: 10 },
    tronco: { frente: 38, lado: 28, giro: 5 },
    cabeca: { frente: -10 },
    ombroD: { frente: 150, lado: 5 }, cotoveloD: 75,
    ombroE: { frente: 25, lado: 45 }, cotoveloE: 25,
    peE: { x: 0.42, y: CHAO, z: 0.12 },
    peD: { x: -0.36, y: CHAO, z: -0.28 }
  });

  // BENÇÃO: recolher o joelho e empurrar com a sola do pé para a frente.
  const BENCAO_RECOLHE = pose({
    corpo: { x: 0.1, y: 0.88, z: 0, giro: 0 },
    tronco: { frente: 6 },
    ombroE: { frente: 55, lado: 20 }, cotoveloE: 85,
    ombroD: { frente: 55, lado: 20 }, cotoveloD: 85,
    peE: { x: 0.24, y: CHAO, z: 0.08 },
    peD: { x: -0.1, y: 0.62, z: 0.32 }
  });
  const BENCAO_EMPURRA = pose({
    corpo: { x: 0.1, y: 0.88, z: -0.08, giro: 0 },
    tronco: { frente: -20 },
    ombroE: { frente: 40, lado: 35 }, cotoveloE: 60,
    ombroD: { frente: 40, lado: 35 }, cotoveloD: 60,
    peE: { x: 0.24, y: CHAO, z: 0.08 },
    peD: { x: -0.08, y: 0.72, z: 0.95 }
  });

  // COCORINHA: agachar bem baixo com o braço protegendo a cabeça.
  const COCORINHA = pose({
    corpo: { x: 0, y: 0.4, z: -0.08, giro: 0 },
    tronco: { frente: 38 },
    cabeca: { frente: 10 },
    ombroD: { frente: 155, lado: 5 }, cotoveloD: 60,
    ombroE: { frente: 45, lado: 25 }, cotoveloE: 55,
    peE: { x: 0.24, y: CHAO, z: 0.06 },
    peD: { x: -0.24, y: CHAO, z: 0.06 }
  });

  /* ===================================================================
     PASSO 5 – SEQUÊNCIAS
     -------------------------------------------------------------------
     Lista de passos: em "tempo" segundos o jogador vai até a pose do passo.
     =================================================================== */
  const passosGinga = [
    { tempo: 0.6, A: GINGA, B: GINGA_OUTRO_LADO },
    { tempo: 0.55, A: CENTRO, B: CENTRO },
    { tempo: 0.6, A: GINGA_OUTRO_LADO, B: GINGA },
    { tempo: 0.55, A: CENTRO, B: CENTRO }
  ];
  const passosMeiaLua = [
    { tempo: 0.6, A: GINGA, B: GINGA_OUTRO_LADO },
    { tempo: 0.35, A: MEIA_LUA_1, B: CENTRO },
    { tempo: 0.22, A: MEIA_LUA_2, B: ESQUIVA },
    { tempo: 0.2, A: MEIA_LUA_3, B: ESQUIVA },
    { tempo: 0.2, A: MEIA_LUA_4, B: ESQUIVA },
    { tempo: 0.3, A: MEIA_LUA_5, B: ESQUIVA },
    { tempo: 0.5, A: CENTRO, B: CENTRO }
  ];
  const passosBencao = [
    { tempo: 0.6, A: GINGA, B: GINGA_OUTRO_LADO },
    { tempo: 0.35, A: BENCAO_RECOLHE, B: CENTRO },
    { tempo: 0.25, A: BENCAO_EMPURRA, B: COCORINHA },
    { tempo: 0.35, A: BENCAO_RECOLHE, B: COCORINHA },
    { tempo: 0.5, A: CENTRO, B: CENTRO }
  ];
  const trocarPapeis = (passos) => passos.map((passo) => ({ tempo: passo.tempo, A: passo.B, B: passo.A }));

  const sequencias = {
    ginga: {
      nome: 'Ginga',
      descricao: 'O movimento básico da capoeira. O corpo balança de um lado para o outro, trocando a perna de trás, com um braço protegendo o rosto e os olhos sempre no outro jogador. É da ginga que saem os ataques e as defesas.',
      passos: passosGinga
    },
    meialua: {
      nome: 'Meia-lua de frente e esquiva',
      descricao: 'O jogador de amarelo leva o peso para uma perna e gira a outra, esticada, num arco à frente do corpo: é a meia-lua de frente. O de vermelho responde com uma esquiva: abaixa e se desvia, protegendo a cabeça.',
      passos: passosMeiaLua
    },
    bencao: {
      nome: 'Benção e cocorinha',
      descricao: 'A benção é um chute que empurra para a frente com a sola do pé. A defesa mostrada é a cocorinha: agachar com o braço protegendo a cabeça.',
      passos: passosBencao
    },
    jogo: {
      nome: 'Jogo completo',
      descricao: 'Ginga, ataques e defesas em sequência, com os jogadores trocando de papel e circulando pela roda. Na capoeira, um golpe é como uma pergunta e a defesa é a resposta: é um diálogo, não uma briga.',
      passos: [...passosGinga, ...passosMeiaLua, ...passosGinga, ...trocarPapeis(passosBencao),
               ...passosGinga, ...trocarPapeis(passosMeiaLua), ...passosGinga, ...passosBencao]
    }
  };

  /* ===================================================================
     PASSO 6 – CINEMÁTICA INVERSA (IK) DA PERNA
     -------------------------------------------------------------------
     A perna é um triângulo: COXA, CANELA e a DISTÂNCIA do quadril até o pé.
     Conhecendo os 3 lados, a LEI DOS COSSENOS dá os ângulos:
         c² = a² + b² − 2·a·b·cos(C)   →   cos(C) = (a² + b² − c²) / (2·a·b)

               quadril
                 /\
          COXA  /  \  distância
               /    \
        joelho ------ pé
               CANELA
     =================================================================== */
  const vetorAlvo = new THREE.Vector3(); // reaproveitado para não criar objetos a cada quadro

  function resolverPerna(boneco, perna, joelho, tornozelo, alvo) {
    // 1) Converte a posição do pé (medida a partir da raiz) para o "ponto de vista" do quadril.
    vetorAlvo.set(alvo.x, alvo.y, alvo.z);
    boneco.raiz.localToWorld(vetorAlvo);
    boneco.quadril.worldToLocal(vetorAlvo);
    vetorAlvo.sub(perna.position); // agora é o caminho do início da perna até o pé
    const { x, y, z } = vetorAlvo;

    // 2) Abertura lateral: quanto a perna precisa "abrir" para o lado.
    const abertura = Math.atan2(x, -y);
    const paraBaixo = Math.hypot(x, y); // Math.hypot = raiz quadrada de (x² + y²)

    // 3) Distância até o pé. Se o pé estiver longe demais, a perna fica esticada.
    const distancia = limitar(Math.hypot(paraBaixo, z), 0.05, COXA + CANELA - 0.001);

    // 4) Lei dos cossenos: ângulo do joelho e ângulo extra da coxa.
    const cosJoelho = (COXA ** 2 + CANELA ** 2 - distancia ** 2) / (2 * COXA * CANELA);
    const dobraJoelho = Math.PI - Math.acos(limitar(cosJoelho, -1, 1));
    const cosCoxa = (COXA ** 2 + distancia ** 2 - CANELA ** 2) / (2 * COXA * distancia);
    const anguloCoxa = Math.atan2(z, paraBaixo) + Math.acos(limitar(cosCoxa, -1, 1));

    // 5) Aplica os ângulos encontrados.
    perna.rotation.set(-anguloCoxa, 0, abertura);
    joelho.rotation.x = dobraJoelho;
    // O tornozelo desfaz a inclinação da perna, deixando a sola paralela ao chão.
    tornozelo.rotation.x = anguloCoxa - dobraJoelho;
  }

  /* ===================================================================
     PASSO 7 – MOTOR DE ANIMAÇÃO
     =================================================================== */

  // Aplica uma pose ao boneco (cinemática direta no tronco e braços, IK nas pernas).
  function aplicarPose(boneco, p) {
    boneco.quadril.position.set(p.corpo.x, p.corpo.y, p.corpo.z);
    boneco.quadril.rotation.y = graus(p.corpo.giro);
    boneco.tronco.rotation.set(graus(p.tronco.frente), graus(p.tronco.giro), graus(-p.tronco.lado));

    // CABEÇA "VIVA" (procedural): desfaz o giro e parte da inclinação do corpo,
    // para continuar olhando o adversário, como um capoeirista de verdade.
    boneco.pescoco.rotation.set(
      graus(-p.tronco.frente * 0.75 + p.cabeca.frente),
      graus(-(p.corpo.giro + p.tronco.giro)),
      graus(p.tronco.lado * 0.6)
    );

    boneco.ombroE.rotation.set(graus(-p.ombroE.frente), 0, graus(p.ombroE.lado));
    boneco.ombroD.rotation.set(graus(-p.ombroD.frente), 0, graus(-p.ombroD.lado));
    boneco.cotoveloE.rotation.x = graus(-p.cotoveloE);
    boneco.cotoveloD.rotation.x = graus(-p.cotoveloD);

    boneco.raiz.updateMatrixWorld(true); // atualiza as posições antes de calcular a IK
    resolverPerna(boneco, boneco.pernaE, boneco.joelhoE, boneco.tornozeloE, p.peE);
    resolverPerna(boneco, boneco.pernaD, boneco.joelhoD, boneco.tornozeloD, p.peD);
  }

  // CURVA CATMULL-ROM: calcula um ponto entre p1 e p2 usando também o ponto
  // anterior (p0) e o seguinte (p3). Assim a velocidade não "zera" em cada pose.
  // (É a mesma fórmula usada para desenhar curvas suaves em programas de desenho.)
  function catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  }
  // Aplica a curva em todos os números da pose (recursão para os objetos de dentro).
  function interpolarPose(p0, p1, p2, p3, t) {
    const resultado = {};
    for (const chave in p1) {
      resultado[chave] = typeof p1[chave] === 'number'
        ? catmullRom(p0[chave], p1[chave], p2[chave], p3[chave], t)
        : interpolarPose(p0[chave], p1[chave], p2[chave], p3[chave], t);
    }
    return resultado;
  }

  // PÉ QUE LEVANTA (procedural): se o pé vai mudar de lugar no chão,
  // somamos uma pequena "subida" no meio do caminho (seno vai de 0 a 1 e volta a 0).
  function levantarPes(poseAtual, de, para, t) {
    ['peE', 'peD'].forEach((pe) => {
      const deslocamento = Math.hypot(para[pe].x - de[pe].x, para[pe].z - de[pe].z);
      if (deslocamento > 0.12 && de[pe].y < 0.15 && para[pe].y < 0.15) {
        poseAtual[pe].y += Math.sin(Math.PI * t) * 0.07;
      }
    });
  }

  let passos = sequencias.ginga.passos;
  let indice = 0;
  let progresso = 0;
  let velocidade = 1;
  let atualA = copiar(CENTRO);
  let atualB = copiar(CENTRO);
  // Na troca de sequência, a primeira curva começa da pose em que o boneco ESTÁ.
  let partidaA = null;
  let partidaB = null;

  // Pega o passo da lista "dando a volta" quando passa do fim ou do começo.
  const passoNaPosicao = (n) => passos[((n % passos.length) + passos.length) % passos.length];

  function atualizarAnimacao(segundos) {
    progresso += (segundos * velocidade) / passos[indice].tempo;
    if (progresso >= 1) {
      progresso -= 1;
      indice = (indice + 1) % passos.length;
      partidaA = null;
      partidaB = null;
    }
    progresso = Math.min(progresso, 1);

    // Os 4 pontos da curva: anterior, de onde sai, para onde vai, seguinte.
    const anterior = passoNaPosicao(indice - 2);
    const origem = passoNaPosicao(indice - 1);
    const destino = passos[indice];
    const seguinte = passoNaPosicao(indice + 1);

    const deA = partidaA || origem.A;
    const deB = partidaB || origem.B;
    atualA = interpolarPose(partidaA || anterior.A, deA, destino.A, seguinte.A, progresso);
    atualB = interpolarPose(partidaB || anterior.B, deB, destino.B, seguinte.B, progresso);
    levantarPes(atualA, deA, destino.A, progresso);
    levantarPes(atualB, deB, destino.B, progresso);

    aplicarPose(jogadorA, atualA);
    aplicarPose(jogadorB, atualB);
  }

  function trocarSequencia(nome) {
    const sequencia = sequencias[nome];
    if (!sequencia) return;
    partidaA = copiar(atualA);
    partidaB = copiar(atualB);
    passos = sequencia.passos;
    indice = 0;
    progresso = 0;
    const painel = document.querySelector('#rodaDescricao');
    if (painel) {
      painel.querySelector('h4').textContent = sequencia.nome;
      painel.querySelector('p').textContent = sequencia.descricao;
    }
  }

  // POSIÇÃO NA RODA: os dois ficam em lados opostos de um círculo imaginário
  // e vão girando devagar, sempre de frente um para o outro.
  const DISTANCIA_DO_CENTRO = 0.85;
  let anguloNaRoda = 0;
  function posicionarNaRoda() {
    const x = Math.cos(anguloNaRoda) * DISTANCIA_DO_CENTRO;
    const z = Math.sin(anguloNaRoda) * DISTANCIA_DO_CENTRO;
    jogadorA.raiz.position.set(-x, 0, z);
    jogadorB.raiz.position.set(x, 0, -z);
    // atan2 descobre o ângulo para "olhar" na direção do outro jogador.
    jogadorA.raiz.rotation.y = Math.atan2(2 * x, -2 * z);
    jogadorB.raiz.rotation.y = Math.atan2(-2 * x, 2 * z);
  }

  /* ===================================================================
     PASSO 8 – CONTROLES DA PÁGINA
     =================================================================== */
  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pausado = reduzirMovimento;

  const botoesMovimento = document.querySelectorAll('.movimento-choice');
  botoesMovimento.forEach((botao) => {
    botao.addEventListener('click', () => {
      botoesMovimento.forEach((item) => {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
      });
      botao.classList.add('active');
      botao.setAttribute('aria-pressed', 'true');
      trocarSequencia(botao.dataset.sequencia);
    });
  });

  const botaoPausar = document.querySelector('#rodaPausar');
  function definirPausa(valor) {
    pausado = valor;
    if (!botaoPausar) return;
    botaoPausar.setAttribute('aria-pressed', pausado);
    botaoPausar.textContent = pausado ? '▶ Continuar' : '❚❚ Pausar';
  }
  botaoPausar?.addEventListener('click', () => definirPausa(!pausado));
  definirPausa(pausado);

  const controleVelocidade = document.querySelector('#rodaVelocidade');
  const textoVelocidade = document.querySelector('#rodaVelocidadeValor');
  function definirVelocidade(valor) {
    velocidade = valor;
    if (controleVelocidade) controleVelocidade.value = valor;
    if (textoVelocidade) textoVelocidade.textContent = `${Number(valor).toFixed(2).replace('.', ',')}×`;
  }
  controleVelocidade?.addEventListener('input', () => definirVelocidade(Number(controleVelocidade.value)));


  // Integração com a trilha sonora: o toque do berimbau define o ritmo do jogo.
  const etiquetaRitmo = document.querySelector('#rodaRitmo');
  document.addEventListener('trilha-sonora', (evento) => {
    const { tocando, nome, velocidade: velocidadeDoToque } = evento.detail;
    if (etiquetaRitmo) {
      etiquetaRitmo.hidden = !tocando;
      etiquetaRitmo.textContent = `♪ No ritmo de: ${nome}`;
    }
    if (tocando) {
      definirVelocidade(velocidadeDoToque);
      definirPausa(false);
    }
  });

  // Arrastar para girar a roda.
  let arrastando = false;
  let ultimoX = 0;
  let giroDaCamera = graus(-15);
  canvas.addEventListener('pointerdown', (evento) => {
    arrastando = true;
    ultimoX = evento.clientX;
    canvas.setPointerCapture(evento.pointerId);
  });
  canvas.addEventListener('pointermove', (evento) => {
    if (!arrastando) return;
    giroDaCamera += (evento.clientX - ultimoX) * 0.01;
    ultimoX = evento.clientX;
  });
  ['pointerup', 'pointercancel'].forEach((nome) => canvas.addEventListener(nome, () => { arrastando = false; }));
  canvas.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowLeft') giroDaCamera -= 0.3;
    else if (evento.key === 'ArrowRight') giroDaCamera += 0.3;
    else if (evento.key === ' ') definirPausa(!pausado);
    else return;
    evento.preventDefault();
  });

  function ajustarTamanho() {
    const largura = canvas.clientWidth || 600;
    const altura = canvas.clientHeight || 420;
    renderizador.setSize(largura, altura, false);
    camera.aspect = largura / altura;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(ajustarTamanho).observe(canvas);

  /* ===================================================================
     PASSO 9 – LAÇO DE ANIMAÇÃO
     =================================================================== */
  const relogio = new THREE.Clock();
  let animando = null;
  let visivel = false;

  function animar() {
    animando = requestAnimationFrame(animar);
    const segundos = Math.min(relogio.getDelta(), 0.1);
    if (!pausado) {
      anguloNaRoda += segundos * velocidade * 0.12; // giro lento pela roda
      posicionarNaRoda();
      atualizarAnimacao(segundos);
    }
    mundo.rotation.y += (giroDaCamera - mundo.rotation.y) * 0.1;
    renderizador.render(cena, camera);
  }
  function ligar() {
    if (animando === null && visivel && !document.hidden) {
      relogio.getDelta();
      animar();
    }
  }
  function desligar() {
    if (animando !== null) cancelAnimationFrame(animando);
    animando = null;
  }
  new IntersectionObserver(([entrada]) => {
    visivel = entrada.isIntersecting;
    if (visivel) ligar(); else desligar();
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? desligar() : ligar()));

  /* ---------- INÍCIO ---------- */
  posicionarNaRoda();
  atualizarAnimacao(0);
  ajustarTamanho();
  mundo.rotation.y = giroDaCamera;
  if (aviso) aviso.hidden = true;
  window.rodaProntaRaizes = true;

  // Para experimentar no console (F12):
  //   capoeiristas.A.raiz.scale.set(1.2, 1.2, 1.2)
  window.capoeiristas = { A: jogadorA, B: jogadorB };

  // Usado só para testes automáticos: pula a animação para um passo exato.
  window.capoeiristasIrPara = (nome, passo, t = 0.999) => {
    trocarSequencia(nome);
    partidaA = null; partidaB = null;
    indice = passo; progresso = t;
    atualizarAnimacao(0);
    renderizador.render(cena, camera);
  };
}
