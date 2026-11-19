# Raízes — Cultura, História e Identidade

Site educativo e interativo em alusão ao **Dia da Consciência Negra (20 de novembro)**. Ele apresenta a história, a cultura e as contribuições da população negra no Brasil, com textos, imagens, modelos 3D e música.

---

## 1. Sobre o projeto

| | |
|---|---|
| **Aluno desenvolvedor** | Douglas Silvino de Sousa |
| **Orientação** | Prof. Mateus Rodrigues, professor EBTT de Informática |
| **Instituição** | Instituto Federal do Tocantins (IFTO) – Campus Formoso do Araguaia |
| **Tipo** | Projeto extracurricular |
| **Ano** | 2026 |

---

## 2. Como abrir o site

1. Abra a pasta `raizes-consciencia-negra` no **Visual Studio Code**.
2. Clique com o botão direito no arquivo `index.html` e escolha **Open with Live Server**.
3. O site abre no navegador.

> **É preciso internet.** As fotos, os áudios, as fontes de letra e a biblioteca de 3D (Three.js) são carregados da internet.

---

## 3. O que o visitante encontra no site

O site é uma página única, dividida em seções. O menu no topo leva direto a cada uma delas.

| Seção | O que mostra |
|---|---|
| **Início** | Apresentação do projeto e da data de 20 de novembro. |
| **01 · História** | Texto sobre escravização, resistência e quilombos, e uma **linha do tempo interativa**: Período colonial, Palmares, 1888, por que 20 de novembro e os dias de hoje, com as leis 10.639/2003, 12.519/2011 e 14.759/2023. |
| **02 · Cultura** | Cards sobre música, capoeira, arte e gastronomia. O botão "Descobrir mais" abre uma janela com mais informações. |
| **03 · Contribuições** | A parte mais interativa do site, detalhada no quadro abaixo. |
| **04 · Personalidades** | Oito personalidades negras que marcaram o Brasil, como Machado de Assis, Carolina Maria de Jesus, Milton Santos e Lélia Gonzalez. As imagens de Dandara e Zumbi são identificadas como representações artísticas, pois não existem fotografias deles. |
| **05 · Resistência** | Combate ao racismo, igualdade e representatividade, com um espaço para o visitante escrever sua própria reflexão. |
| **06 · Galeria 3D** | Três objetos 3D estilizados para girar e aproximar. |
| **Créditos** | Autor e licença de cada imagem e de cada áudio usado no site. |

### A seção Contribuições

| Parte | O que tem |
|---|---|
| **Capoeira** | O que é a capoeira e os principais marcos da sua história: a proibição em 1890, Mestre Bimba e Mestre Pastinha, o reconhecimento pelo Iphan (2008) e pela UNESCO (2014). |
| **A roda em 3D** | Dois capoeiristas jogando em 3D. O visitante escolhe o movimento: **ginga**, **meia-lua de frente com esquiva**, **benção com cocorinha** ou **jogo completo**. Também pode pausar, mudar a velocidade e girar a roda com o mouse. |
| **Instrumentos** | Berimbau, atabaque, pandeiro, agogô e reco-reco. Cada um tem um **modelo 3D** que pode ser girado, uma explicação do seu papel na roda e uma legenda que mostra de quais formas geométricas o modelo foi feito. |
| **Comidas típicas** | Acarajé, vatapá, caruru, moqueca baiana, mungunzá e azeite de dendê, com foto e texto explicativo. |
| **Mito ou fato?** | Um quadro sobre a ideia de que a feijoada nasceu nas senzalas, que mostra o que os historiadores dizem sobre isso. |

### Trilha sonora

No canto inferior esquerdo da tela há o botão **"Trilha sonora"**. Ele abre um pequeno player com dois grupos de faixas:

- **Toques de berimbau:** Iúna, Santa Maria e Angola.
- **Músicas de roda (com canto):** gravações reais de rodas na Lapa (Rio de Janeiro) e em Nanterre (França).

Quando uma faixa toca, os capoeiristas em 3D passam a jogar no ritmo dela. Isso ilustra uma ideia da capoeira: **é o berimbau que comanda o jogo**.

---

## 4. Como o site foi construído

### As tecnologias, explicadas de forma simples

| Tecnologia | Para que serve | Comparação |
|---|---|---|
| **HTML** | Define o **conteúdo** e a estrutura: títulos, textos, imagens, botões. | O esqueleto de uma casa. |
| **CSS** | Define a **aparência**: cores, letras, tamanhos, posições e adaptação ao celular. | A pintura e a decoração. |
| **JavaScript** | Define o **comportamento**: o que acontece quando o visitante clica, rola a página ou escolhe uma opção. | A parte elétrica: faz as coisas funcionarem. |
| **Three.js** | Biblioteca de JavaScript para desenhar **objetos 3D** no navegador. | Uma caixa de ferramentas pronta para o 3D. |

### Organização das pastas

```text
raizes-consciencia-negra/
├── index.html              → a página do site (todo o conteúdo)
├── css/                    → aparência
│   ├── style.css           → estilo principal (cores, letras, seções)
│   ├── responsive.css      → ajustes para tablet e celular
│   ├── animations.css      → animações de entrada
│   └── melhorias.css       → acessibilidade, créditos, Contribuições e trilha sonora
├── js/                     → comportamento
│   ├── navigation.js       → menu do celular
│   ├── animations.js       → efeito de "aparecer" ao rolar e barra de progresso
│   ├── timeline.js         → abas da linha do tempo
│   ├── main.js             → janelas de informação, alto contraste, reflexão do visitante
│   ├── contribuicoes.js    → textos dos instrumentos e das comidas típicas
│   ├── instrumentos-3d.js  → modelos 3D dos 5 instrumentos
│   ├── capoeiristas-3d.js  → os dois capoeiristas em 3D
│   ├── trilha-sonora.js    → player de música
│   └── three-scene.js      → objetos da Galeria 3D
├── assets/                 → pastas reservadas para imagens e modelos locais
├── _versao_original/       → cópias das versões anteriores (histórico)
└── README.md               → este documento
```

> Todos os arquivos de JavaScript são **comentados em português**. Os arquivos de 3D são divididos em **PASSOS numerados**, para serem lidos na ordem. As mudanças feitas na revisão estão marcadas no código com a palavra **MELHORIA**.

---

## 5. Destaques técnicos, explicados

### 5.1 Instrumentos em 3D: peças simples formam objetos complexos

Os cinco instrumentos foram montados **só com formas geométricas simples**, como peças de LEGO:

| Forma do Three.js | Parece com... | Onde foi usada |
|---|---|---|
| Cilindro (`CylinderGeometry`) | lata, cano, moeda | arame do berimbau, corpo do atabaque, aro do pandeiro |
| Cone (`ConeGeometry`) | casquinha de sorvete | campânulas do agogô, caxixi |
| Esfera (`SphereGeometry`) | bola | cabaça do berimbau |
| Anel (`TorusGeometry`) | rosquinha | verga do berimbau, aros do atabaque, sulcos do reco-reco |
| Caixa (`BoxGeometry`) | caixinha | cunhas do atabaque |

Exemplos:
- A **verga do berimbau** é um pedacinho de um anel enorme. Por isso ela parece um arco.
- As **cordas do atabaque** e as **platinelas do pandeiro** são a mesma peça repetida em círculo, com uma repetição (`for`) e um pouco de trigonometria (seno e cosseno).

No site, a legenda abaixo do modelo mostra qual forma do código virou cada parte do instrumento.

### 5.2 Capoeiristas em 3D: quatro técnicas usadas em jogos

**1. Esqueleto em camadas.** Cada boneco é montado como um corpo de verdade: a mão está presa ao antebraço, o antebraço ao braço, e o braço ao ombro. Por isso, quando o ombro gira, todo o braço vai junto.

```text
quadril
 ├─ tronco ─┬─ pescoço ── cabeça
 │          ├─ ombro ── cotovelo ── mão   (esquerdo e direito)
 ├─ perna ── joelho ── tornozelo ── pé    (esquerda e direita)
```

**2. Cinemática inversa: pés firmes no chão.** Em vez de dizer "dobre o joelho 70 graus", o código diz "**coloque o pé aqui**". A matemática descobre sozinha quanto o quadril e o joelho precisam dobrar. A perna é tratada como um triângulo (coxa, canela e a distância até o pé), e os ângulos saem da **lei dos cossenos**, conteúdo do Ensino Médio. O resultado: os pés não escorregam nem afundam no chão.

**3. Movimento suave entre as poses.** A animação é feita com **poses-chave**: algumas posições importantes, como "ginga para a esquerda", "centro" e "ginga para a direita". O computador calcula tudo o que fica entre elas usando uma **curva suave** (Catmull-Rom), a mesma ideia usada em programas de desenho. Assim o boneco não "trava" em cada pose.

**4. Detalhes calculados a cada momento.**
- A cabeça compensa o giro do corpo e **continua olhando o adversário**, como ensina a capoeira.
- O pé **levanta um pouco** quando troca de lugar.
- Os dois jogadores **circulam devagar pela roda**.

> Os movimentos são uma simplificação. Na capoeira, eles se aprendem na roda, com um mestre.

### 5.3 Trilha sonora

- Usa o elemento `<audio>` do HTML. Cada faixa tem dois formatos de arquivo (MP3 e OGG), e o navegador escolhe o que conseguir tocar.
- **A música nunca começa sozinha.** Os navegadores bloqueiam som automático e as regras de acessibilidade pedem isso: som inesperado atrapalha quem usa leitor de tela.
- A escolha da faixa e o volume ficam guardados no navegador para a próxima visita.
- O player **conversa** com a roda 3D por meio de um "aviso" (evento personalizado): quando a música começa, a roda fica sabendo e ajusta a velocidade do jogo.

### 5.4 Acessibilidade: um site para todas as pessoas

- **Navegação pelo teclado:**
  - o elemento selecionado com Tab fica destacado com um contorno;
  - um link "Pular para o conteúdo" leva direto ao conteúdo principal;
  - as abas da linha do tempo funcionam com as setas;
  - os modelos 3D giram com as setas.
- **Janelas de informação:** o foco entra na janela quando ela abre e volta para o botão quando ela fecha. Também fecham com a tecla Esc.
- **Alto contraste:** um botão no topo ativa o modo de alto contraste, e o site lembra da escolha.
- **Leitores de tela:**
  - as imagens têm descrições (texto alternativo);
  - os ícones decorativos ficam escondidos para não serem lidos em voz alta.
- **Cores:** os textos têm contraste suficiente, seguindo a norma internacional WCAG.
- **Menos movimento:** as animações se reduzem quando o sistema do visitante pede "menos movimento".

### 5.5 Desempenho: um site mais leve

- As fotos são pedidas ao Wikimedia já em tamanho reduzido.
- As animações 3D **pausam** quando saem da tela ou quando a aba do navegador fica escondida. Isso economiza bateria.
- Os áudios só são baixados quando o visitante aperta "Tocar".

---

## 6. Cuidados com o conteúdo

- As informações históricas, como datas, leis e reconhecimentos de patrimônio, foram conferidas em fontes oficiais e acadêmicas.
- **Dandara e Zumbi** viveram no século XVII, antes da fotografia. Por isso, as imagens deles estão identificadas como **representações artísticas**.
- Os objetos 3D da Galeria e os instrumentos são **modelos ilustrativos**. Eles não reproduzem objetos sagrados nem uma tradição específica.
- O quadro "Mito ou fato?" mostra que a história da feijoada **ainda é debatida** por pesquisadores, para incentivar a conferência de fontes.

---

## 7. Créditos e licenças

Todas as imagens e todos os áudios vêm de acervos com **licenças livres**:
- as imagens e os toques de berimbau, do **Wikimedia Commons**;
- as músicas de roda, do **Freesound**.

A lista completa, com o autor e a licença de cada item, está na seção **Créditos** no final do site.

| Licença | O que permite |
|---|---|
| **Domínio público / CC0** | Uso livre, sem condições. |
| **CC BY** | Uso livre, **dando crédito** ao autor. |
| **CC BY-SA** | Uso livre, dando crédito e **mantendo a mesma licença** em obras derivadas. |
| **CC BY-NC** | Uso livre, dando crédito, **sem fins comerciais**. Pode ser usada em um projeto escolar, mas não em um site que venda algo. |

A biblioteca **Three.js** tem licença MIT, que é livre.

---

## 8. Histórico de versões

Cada etapa do desenvolvimento fica registrada no **histórico de commits do Git**. Nele dá para ver o que mudou, quando mudou e por quê, e comparar o "antes e depois" de qualquer arquivo. No GitHub, basta abrir a aba **Commits** do repositório.
