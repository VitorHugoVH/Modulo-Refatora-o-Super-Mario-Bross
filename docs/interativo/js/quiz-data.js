const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Qual trecho apresenta o smell Duplicate Code (Código Duplicado)?",
    type: "code-choice",
    options: [
      {
        label: "Alternativa A",
        code: `public void playJump() {
    Clip clip = getClip(loadAudio("jump"));
    clip.start();
}
public void playCoin() {
    Clip clip = getClip(loadAudio("coin"));
    clip.start();
}`,
        correct: true
      },
      {
        label: "Alternativa B",
        code: `private void playSound(String name) {
    Clip clip = getClip(loadAudio(name));
    if (clip != null) clip.start();
}
public void playJump() { playSound("jump"); }`,
        correct: false
      }
    ],
    explanation: "A alternativa A repete o padrão carregar + tocar em cada método. A B centraliza a lógica em playSound — é a versão refatorada."
  },
  {
    id: 2,
    question: "Em qual arquivo está o smell God Class (Classe Deus)?",
    type: "text-choice",
    options: [
      { text: "Coin.java", correct: false },
      { text: "MapManager.java", correct: true },
      { text: "ButtonAction.java", correct: false },
      { text: "Animation.java", correct: false }
    ],
    explanation: "MapManager concentra colisões, tempo, mapa, pontuação e remoção de entidades — muitas responsabilidades em uma classe."
  },
  {
    id: 3,
    question: "Qual linha contém Magic Number (número mágico)?",
    type: "text-choice",
    options: [
      { text: "mario.acquirePoints(GameConstants.STOMP_POINTS);", correct: false },
      { text: "mario.acquirePoints(100);", correct: true },
      { text: "mario.acquirePoints(STOMP_ENEMY_SCORE);", correct: false },
      { text: "mario.acquirePoints(getStompPoints());", correct: false }
    ],
    explanation: "O valor 100 aparece sem contexto. Constantes nomeadas (GameConstants, STOMP_ENEMY_SCORE) ou métodos descritivos eliminam o smell."
  },
  {
    id: 4,
    question: "Para adicionar um novo prêmio StarPrize, qual design viola MENOS o princípio OCP?",
    type: "text-choice",
    options: [
      { text: "Adicionar else if (object instanceof StarPrize) em removeObjects", correct: false },
      { text: "Fazer StarPrize implements MapEntity com removeFrom(Map map)", correct: true },
      { text: "Copiar toda a lógica de Coin para uma nova classe sem interface", correct: false },
      { text: "Adicionar um switch com 15 cases em MapManager", correct: false }
    ],
    explanation: "OCP favorece extensão por novas classes sem modificar código existente. MapEntity.removeFrom() permite isso."
  },
  {
    id: 5,
    question: "O trecho abaixo exemplifica qual code smell?",
    snippet: `// Dentro do construtor de Mario
ImageLoader imageLoader = new ImageLoader();`,
    type: "text-choice",
    options: [
      { text: "Dead Code", correct: false },
      { text: "Feature Envy / dependência desnecessária", correct: true },
      { text: "Long Method", correct: false },
      { text: "God Class", correct: false }
    ],
    explanation: "Mario cria ImageLoader embora GameEngine já possua uma instância — inveja de funcionalidade e acoplamento oculto."
  },
  {
    id: 6,
    question: "O que MELHOR substitui cores RGB hardcoded no MapCreator?",
    type: "text-choice",
    options: [
      { text: "Comentário // blue = ordinary brick", correct: false },
      { text: "Enum TileType.ORDINARY_BRICK", correct: true },
      { text: "if (currentPixel == 255)", correct: false },
      { text: "Duplicar o valor RGB em 3 arquivos", correct: false }
    ],
    explanation: "Enum documenta e centraliza o mapeamento pixel → entidade, eliminando Primitive Obsession."
  },
  {
    id: 7,
    question: "Refatorar sempre muda o comportamento visível do jogo.",
    type: "text-choice",
    options: [
      { text: "Verdadeiro", correct: false },
      { text: "Falso", correct: true }
    ],
    explanation: "Refatoração preserva o comportamento externo; melhora apenas a estrutura interna do código."
  },
  {
    id: 8,
    question: "Qual técnica de refatoração é mais adequada para a God Class MapManager?",
    type: "text-choice",
    options: [
      { text: "Extract Class (ex.: CollisionDetector)", correct: true },
      { text: "Inline Method", correct: false },
      { text: "Add mais responsabilidades ao GameEngine", correct: false },
      { text: "Rename Variable", correct: false }
    ],
    explanation: "Extract Class separa colisões e reduz o tamanho de MapManager — ataca diretamente o God Class."
  },
  {
    id: 9,
    question: "Qual smell está presente neste trecho de removeObjects?",
    snippet: `if (object instanceof Fireball) {
    map.removeFireball((Fireball) object);
} else if (object instanceof Enemy) {
    map.removeEnemy((Enemy) object);
} else if (object instanceof Coin || object instanceof BoostItem) {
    map.removePrize((Prize) object);
}`,
    type: "text-choice",
    options: [
      { text: "Duplicate Code", correct: false },
      { text: "Type Checking com instanceof (viola OCP)", correct: true },
      { text: "Dead Code", correct: false },
      { text: "Magic Number", correct: false }
    ],
    explanation: "Cadeias de instanceof exigem modificar o método a cada novo tipo — polimorfismo resolve isso."
  },
  {
    id: 10,
    question: "Associar smell → técnica: Magic Numbers devem ser tratados com:",
    type: "text-choice",
    options: [
      { text: "Extract Constant / Introduce Enum", correct: true },
      { text: "State Pattern", correct: false },
      { text: "Remove Method", correct: false },
      { text: "Add Parameter", correct: false }
    ],
    explanation: "Replace Magic Number with Symbolic Constant (ou enum) dá nome e contexto aos valores numéricos."
  }
];
