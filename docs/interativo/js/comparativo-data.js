const COMPARISONS = [
  {
    id: "duplicate-code",
    title: "Duplicate Code — Código Duplicado",
    file: "src/manager/SoundManager.java",
    smell: "Duplicate Code",
    technique: "Extract Method",
    principle: "DRY (Don't Repeat Yourself)",
    before: `public void playJump() {
    Clip clip = getClip(loadAudio("jump"));
    clip.start();
}

public void playCoin() {
    Clip clip = getClip(loadAudio("coin"));
    clip.start();
}

public void playFireball() {
    Clip clip = getClip(loadAudio("fireball"));
    clip.start();
}

public void playStomp() {
    Clip clip = getClip(loadAudio("stomp"));
    clip.start();
}

// ... repetido em ~8 métodos`,
    after: `private void playSound(String soundName) {
    Clip clip = getClip(loadAudio(soundName));
    if (clip != null) {
        clip.start();
    }
}

public void playJump()     { playSound("jump"); }
public void playCoin()     { playSound("coin"); }
public void playFireball() { playSound("fireball"); }
public void playStomp()    { playSound("stomp"); }`,
    explanation: "O padrão carregar + tocar se repete em cada método. Um único método privado centraliza a lógica.",
    benefits: [
      "Corrigir um bug de áudio corrige todos os sons de uma vez",
      "Novo efeito sonoro = uma linha, não copiar/colar",
      "Menos linhas e mais fácil de testar"
    ]
  },
  {
    id: "magic-numbers",
    title: "Magic Numbers — Números Mágicos",
    file: "src/manager/MapManager.java / src/model/GameObject.java",
    smell: "Magic Number",
    technique: "Replace Magic Number with Symbolic Constant",
    principle: "Legibilidade e manutenção",
    before: `// MapManager — pontos por pisar inimigo
mario.acquirePoints(100);

// GameObject — gravidade
setGravityAcc(0.38);

// GameEngine — offset da câmera
if (mario.getX() - 600 > camera.getX()) { ... }

// MapManager — tempo da fase
map = mapCreator.createMap("/maps/" + path, 400);`,
    after: `public final class GameConstants {
    public static final int STOMP_POINTS = 100;
    public static final double GRAVITY = 0.38;
    public static final int CAMERA_OFFSET = 600;
    public static final double DEFAULT_TIME_LIMIT = 400;
}

mario.acquirePoints(GameConstants.STOMP_POINTS);
setGravityAcc(GameConstants.GRAVITY);`,
    explanation: "Números soltos no código escondem o significado. Constantes nomeadas documentam regras de jogo.",
    benefits: [
      "Balanceamento do jogo em um único lugar",
      "Código autoexplicativo para novos desenvolvedores",
      "Evita inconsistência (100 em um lugar, 99 em outro)"
    ]
  },
  {
    id: "instanceof",
    title: "Type Checking — Cadeia de instanceof",
    file: "src/manager/MapManager.java",
    smell: "Switch Statements / Type Checking",
    technique: "Replace Conditional with Polymorphism",
    principle: "OCP (Open/Closed Principle)",
    before: `private void removeObjects(ArrayList<GameObject> list) {
    for (GameObject object : list) {
        if (object instanceof Fireball) {
            map.removeFireball((Fireball) object);
        } else if (object instanceof Enemy) {
            map.removeEnemy((Enemy) object);
        } else if (object instanceof Coin
                || object instanceof BoostItem) {
            map.removePrize((Prize) object);
        }
    }
}`,
    after: `public interface MapEntity {
    void removeFrom(Map map);
}

// Cada entidade sabe como se remover:
// fireball.removeFrom(map);
// enemy.removeFrom(map);

private void removeObjects(List<MapEntity> list) {
    list.forEach(entity -> entity.removeFrom(map));
}`,
    explanation: "Cada novo tipo de objeto exige mais um else if. Polimorfismo delega a responsabilidade às próprias classes.",
    benefits: [
      "Novo prêmio/inimigo sem alterar removeObjects",
      "Elimina casts inseguros",
      "Respeita o princípio Aberto/Fechado (OCP)"
    ]
  },
  {
    id: "god-class",
    title: "God Class — Classe Deus",
    file: "src/manager/MapManager.java (~380 linhas)",
    smell: "God Class / Large Class",
    technique: "Extract Class",
    principle: "SRP (Single Responsibility Principle)",
    before: `public class MapManager {
    // Cria mapa
    public boolean createMap(...) { ... }

    // 6 tipos de colisão
    public void checkCollisions(...) {
        checkBottomCollisions(...);
        checkTopCollisions(...);
        checkMarioHorizontalCollision(...);
        checkEnemyCollisions();
        checkPrizeCollision();
        checkFireballContact();
    }

    // Pontuação, tempo, desenho, remoção...
    public int passMission() { ... }
    public void updateTime() { ... }
    public void drawMap(...) { ... }
}`,
    after: `public class MapManager {
    private CollisionDetector collisions;

    public void checkCollisions(GameEngine engine) {
        collisions.detectAll(map, engine);
    }
}

public class CollisionDetector {
    void detectBottom(...) { ... }
    void detectTop(...) { ... }
    void detectHorizontal(...) { ... }
    // colisões isoladas e testáveis
}`,
    explanation: "MapManager concentra mapa, física, pontuação e tempo. Separar colisões reduz acoplamento.",
    benefits: [
      "Colisões testáveis sem carregar todo o MapManager",
      "Arquivo menor e mais legível",
      "Mudanças em física não afetam pontuação"
    ]
  },
  {
    id: "feature-envy",
    title: "Feature Envy — Dependência desnecessária",
    file: "src/model/hero/Mario.java",
    smell: "Feature Envy",
    technique: "Dependency Injection",
    principle: "DIP (Dependency Inversion Principle)",
    before: `public Mario(double x, double y) {
    super(x, y, null);
    setDimension(48, 48);

    // Mario cria seu próprio carregador de imagens
    ImageLoader imageLoader = new ImageLoader();
    BufferedImage[] leftFrames =
        imageLoader.getLeftFrames(MarioForm.SMALL);
    BufferedImage[] rightFrames =
        imageLoader.getRightFrames(MarioForm.SMALL);

    Animation animation =
        new Animation(leftFrames, rightFrames);
    marioForm = new MarioForm(animation, false, false);
}`,
    after: `public Mario(double x, double y, ImageLoader imageLoader) {
    super(x, y, null);
    setDimension(48, 48);

    BufferedImage[] leftFrames =
        imageLoader.getLeftFrames(MarioForm.SMALL);
    BufferedImage[] rightFrames =
        imageLoader.getRightFrames(MarioForm.SMALL);

    Animation animation =
        new Animation(leftFrames, rightFrames);
    marioForm = new MarioForm(animation, false, false);
}

// MapCreator recebe o ImageLoader do GameEngine`,
    explanation: "GameEngine já possui ImageLoader, mas Mario cria outra instância — desperdício e acoplamento oculto.",
    benefits: [
      "Uma única instância de ImageLoader no jogo",
      "Mario testável com mock de ImageLoader",
      "Dependências explícitas no construtor"
    ]
  },
  {
    id: "primitive-obsession",
    title: "Primitive Obsession — Cores RGB como protocolo",
    file: "src/manager/MapCreator.java",
    smell: "Primitive Obsession",
    technique: "Introduce Enum / Replace Type Code",
    principle: "Clareza de domínio",
    before: `int ordinaryBrick = new Color(0, 0, 255).getRGB();
int surpriseBrick = new Color(255, 255, 0).getRGB();
int groundBrick = new Color(255, 0, 0).getRGB();
int goomba = new Color(0, 255, 255).getRGB();

for (int x = 0; x < mapImage.getWidth(); x++) {
    for (int y = 0; y < mapImage.getHeight(); y++) {
        int pixel = mapImage.getRGB(x, y);
        if (pixel == ordinaryBrick) { ... }
        else if (pixel == surpriseBrick) { ... }
        else if (pixel == goomba) { ... }
    }
}`,
    after: `enum TileType {
    ORDINARY_BRICK(new Color(0, 0, 255)),
    SURPRISE_BRICK(new Color(255, 255, 0)),
    GROUND_BRICK(new Color(255, 0, 0)),
    GOOMBA(new Color(0, 255, 255)),
    KOOPA(new Color(255, 0, 255)),
    END_FLAG(new Color(160, 0, 160));

    private final int rgb;
    TileType(Color c) { rgb = c.getRGB(); }

    static TileType fromRgb(int pixel) { ... }
}`,
    explanation: "Pixels RGB funcionam como 'protocolo' do mapa sem documentação. Enum torna o domínio explícito.",
    benefits: [
      "Novos tiles = novo valor no enum",
      "Impossível confundir cores sem contexto",
      "Mapas mais fáceis de documentar para designers"
    ]
  },
  {
    id: "long-method",
    title: "Long Method — Colisão de prêmios",
    file: "src/manager/MapManager.java — checkPrizeCollision()",
    smell: "Long Method",
    technique: "Extract Method",
    principle: "SRP / legibilidade",
    before: `private void checkPrizeCollision() {
    for (Prize prize : map.getRevealedPrizes()) {
        if (prize instanceof BoostItem) {
            BoostItem boost = (BoostItem) prize;
            // ~50 linhas: queda, chão,
            // colisão horizontal esquerda/direita,
            // borda inferior, velocidade...
            for (Brick brick : bricks) {
                if (boost.isFalling()) { ... }
                if (boost.getVelX() > 0) { ... }
                else if (boost.getVelX() < 0) { ... }
            }
        }
    }
}`,
    after: `private void checkPrizeCollision() {
    for (Prize prize : map.getRevealedPrizes()) {
        if (prize instanceof BoostItem) {
            resolveBoostItemPhysics((BoostItem) prize);
        }
    }
}

private void resolveBoostItemPhysics(BoostItem boost) {
    applyVerticalCollision(boost);
    applyHorizontalCollision(boost);
    clampToBottomBorder(boost);
}`,
    explanation: "Um método com loops aninhados e três tipos de colisão misturados é difícil de ler e testar.",
    benefits: [
      "Cada método tem uma responsabilidade clara",
      "Testes unitários por tipo de colisão",
      "Depuração mais rápida"
    ]
  },
  {
    id: "dead-code",
    title: "Dead Code — Método vazio",
    file: "src/manager/SoundManager.java",
    smell: "Dead Code",
    technique: "Remove Dead Code / Completar implementação",
    principle: "Código limpo",
    before: `public void playFireFlower() {

}

public void playSuperMushroom() {
    Clip clip = getClip(loadAudio("superMushroom"));
    clip.start();
}`,
    after: `public void playFireFlower() {
    playSound("fireFlower");
}

public void playSuperMushroom() {
    playSound("superMushroom");
}`,
    explanation: "Método vazio indica refatoração incompleta ou funcionalidade esquecida — confunde quem mantém o código.",
    benefits: [
      "Comportamento consistente com outros sons",
      "Remove ambiguidade para quem lê o código",
      "Evita chamadas silenciosas que parecem bugs"
    ]
  }
];
