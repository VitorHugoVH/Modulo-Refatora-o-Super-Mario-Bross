# Módulo: Caso Prático — Refatoração no Super Mario Bros

Documento de apoio ao módulo **Caso Prático** do curso de refatoração de código. O material usa o repositório deste jogo Super Mario Bros (Java) como base para identificar code smells, aplicar técnicas de refatoração e validar o aprendizado por meio de quiz.

---

## Sumário

1. [Introdução ao Caso Prático](#1-introdução-ao-caso-prático)
   - 1.1 [O cenário do jogo e os impactos de um código desalinhado](#11-o-cenário-do-jogo-e-os-impactos-de-um-código-desalinhado-na-prática)
   - 1.2 [Apresentação do repositório e configuração](#12-apresentação-do-repositório-e-instruções-de-configuração)
2. [Análise de Code Smells (Mão na Massa)](#2-análise-de-code-smells-mão-na-massa)
   - 2.1 [Identificando gargalos](#21-identificando-gargalos-trechos-problemáticos-encontrados-no-super-mario-bros)
   - 2.2 [Diagnóstico](#22-diagnóstico-o-que-torna-esse-código-um-alvo-para-refatoração)
3. [A Refatoração em Ação](#3-a-refatoração-em-ação)
   - 3.1 [Aplicando as técnicas](#31-aplicando-as-técnicas-o-passo-a-passo-da-reorganização)
   - 3.2 [Comparativo antes vs. depois](#32-o-código-refatorado-comparativo-do-código-antigo-vs-código-limpo)
4. [Desafio & Verificação de Conhecimento](#4-desafio--verificação-de-conhecimento-quiz--questionário)
   - 4.1 [Quiz interativo](#41-quiz-interativo-comparando-trechos-de-código-com-e-sem-code-smells)

### Material interativo (quiz + comparativo)

Abra no navegador a pasta **`docs/interativo/`**:

| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Início | [`index.html`](interativo/index.html) | Hub com links para quiz e comparativo |
| Comparativo | [`comparativo.html`](interativo/comparativo.html) | Código com smell vs. refatorado (lado a lado) |
| Quiz | [`quiz.html`](interativo/quiz.html) | 10 questões com feedback imediato |
| Guia PDF | [`guia.html`](interativo/guia.html) | Guia completo exportável em PDF |

> **Como abrir:** clique duas vezes em `docs/interativo/index.html` ou use *Live Server* / servidor local na pasta `docs/interativo/`.
>
> **Guia em PDF:** abra `docs/interativo/guia.html` e clique em **Baixar PDF** (requer internet na primeira carga das bibliotecas).

---

## 1. Introdução ao Caso Prático

### 1.1 O cenário do jogo e os impactos de um código desalinhado na prática

#### Cenário

Este projeto é um clone educacional do **Super Mario Bros** implementado em **Java** com **Swing**, originalmente desenvolvido para a disciplina CS319 — Engenharia de Software Orientada a Objetos. O jogador escolhe mapas, controla o Mario, colide com blocos, inimigos e prêmios, e tenta completar fases dentro de um tempo limitado.

#### Arquitetura em camadas

| Camada | Pacote | Responsabilidade |
|--------|--------|------------------|
| Motor do jogo | `manager/` | Loop principal, input, som, câmera, colisões |
| Modelo | `model/` | Mario, inimigos, blocos, prêmios, mapa |
| View | `view/` | Interface gráfica, sprites, animações |

#### Por que isso importa na prática?

Imagine que a faculdade pede:

- *"Adicionar um novo inimigo (Piranha Plant)"*
- *"Mario ganha escudo temporário após levar dano"*

Com o código atual, isso exige alterar **vários arquivos** (`MapCreator`, `MapManager`, `Map`, possivelmente `GameEngine`), porque:

- Colisões estão concentradas em `MapManager` (~380 linhas)
- Tipos de prêmio são tratados com `instanceof` espalhados
- Constantes numéricas (pontos, velocidade, limites) estão hardcoded

#### Impacto real de código desalinhado

| Problema | Consequência no projeto |
|----------|-------------------------|
| Classe "Deus" (`MapManager`) | Difícil testar colisões isoladamente |
| Código duplicado (`SoundManager`) | Bug em um som não corrige os outros |
| Magic numbers | Balanceamento do jogo vira caça ao número |
| `instanceof` em cadeia | Novo prêmio = N arquivos alterados |
| Acoplamento com `GameEngine` | Modelo depende do motor só para tocar som |

#### Analogia didática

O jogo **funciona**, mas a manutenção parece consertar encanamento emparelhado: mexer em um ponto estoura vazamento em outro. Esse é o cenário ideal para um caso prático de refatoração — código operacional, porém com dívida técnica acumulada.

---

### 1.2 Apresentação do repositório e instruções de configuração

#### Repositório

- **GitHub:** [Super Mario Bros (Java)](https://github.com/ahmetcandiroglu/1G.Super-Mario-Bros)
- **Linguagem:** Java
- **Framework gráfico:** Swing (AWT)

#### Requisitos

- JDK 8 ou superior
- IDE com suporte Java (IntelliJ IDEA, Eclipse, VS Code)

#### Como clonar e executar

```bash
git clone https://github.com/ahmetcandiroglu/1G.Super-Mario-Bros.git
cd Super-Mario-Bros

# Compilar (a partir da raiz do projeto)
javac -d out -sourcepath src src/manager/GameEngine.java

# Executar
java -cp out manager.GameEngine
```

#### Executar no IntelliJ IDEA

1. Abrir o projeto na IDE
2. Marcar a pasta `src` como **Sources Root**
3. Executar o método `main` da classe `manager.GameEngine`

#### Controles do jogo

| Tecla | Ação |
|-------|------|
| ↑ | Pular (no jogo) / navegar menu (telas) |
| ← → | Mover Mario |
| Espaço | Disparar bola de fogo (forma Fire) |
| Enter | Selecionar opção |
| Esc | Pausar / voltar ao menu |

#### Estrutura relevante do projeto

```
src/
├── manager/
│   ├── GameEngine.java      # Motor principal e loop do jogo
│   ├── MapManager.java      # Colisões, mapa, pontuação
│   ├── MapCreator.java      # Leitura de mapas por pixel
│   ├── SoundManager.java    # Efeitos sonoros
│   ├── InputManager.java    # Teclado e mouse
│   └── Camera.java          # Rolagem da câmera
├── model/
│   ├── hero/                # Mario, MarioForm, Fireball
│   ├── enemy/               # Goomba, KoopaTroopa
│   ├── brick/               # Blocos, tubos, surprise brick
│   └── prize/               # Moedas, cogumelos, fire flower
└── view/
    ├── UIManager.java       # Desenho das telas
    ├── ImageLoader.java     # Carregamento de sprites
    └── Animation.java       # Animações do Mario
```

---

## 2. Análise de Code Smells (Mão na Massa)

### 2.1 Identificando gargalos: trechos problemáticos encontrados no Super Mario Bros

A seguir estão os principais **code smells** identificados no código-fonte, com referência aos arquivos e trechos relevantes.

---

#### Smell 1 — God Class (Classe Deus)

**Arquivo:** `src/manager/MapManager.java`

**Descrição:** Uma única classe gerencia criação de mapa, seis tipos de colisão, pontuação, tempo, remoção de objetos e delegação de desenho.

**Trecho representativo:**

```java
public void checkCollisions(GameEngine engine) {
    if (map == null) {
        return;
    }

    checkBottomCollisions(engine);
    checkTopCollisions(engine);
    checkMarioHorizontalCollision(engine);
    checkEnemyCollisions();
    checkPrizeCollision();
    checkPrizeContact(engine);
    checkFireballContact();
}
```

**Exercício sugerido:** contar quantas responsabilidades distintas `MapManager` possui (esperado: no mínimo 5).

---

#### Smell 2 — Long Method (Método Longo)

**Arquivo:** `src/manager/MapManager.java` — método `checkPrizeCollision()` (aprox. linhas 250–302)

**Descrição:** Loops aninhados, lógica de física de prêmios, colisão horizontal e vertical no mesmo método. Dificulta leitura, teste e manutenção.

---

#### Smell 3 — Duplicate Code (Código Duplicado)

**Arquivo:** `src/manager/SoundManager.java`

**Trecho representativo:**

```java
public void playJump() {
    Clip clip = getClip(loadAudio("jump"));
    clip.start();
}

public void playCoin() {
    Clip clip = getClip(loadAudio("coin"));
    clip.start();
}
```

O mesmo padrão se repete em aproximadamente 8 métodos. Além disso, `GameEngine` repete delegações para cada som:

```java
public void playCoin() {
    soundManager.playCoin();
}
// ... playOneUp, playSuperMushroom, playMarioDies, etc.
```

---

#### Smell 4 — Magic Numbers (Números Mágicos)

**Descrição:** Valores numéricos espalhados pelo código sem nome ou contexto.

| Valor | Arquivo / método | Significado provável |
|-------|------------------|----------------------|
| `600` | `GameEngine.updateCamera()` | Offset da câmera |
| `100` | `MapManager` | Pontos por inimigo |
| `400` | `MapManager.createMap()` | Tempo limite da fase |
| `0.38` | `GameObject` | Aceleração da gravidade |
| `5` | `Mario.move()` | Velocidade horizontal |
| `320` | `MapManager.endLevel()` | Distância após bandeira |

---

#### Smell 5 — Type Checking com `instanceof` (polimorfismo frágil)

**Arquivo:** `src/manager/MapManager.java` — método `removeObjects()`

```java
private void removeObjects(ArrayList<GameObject> list){
    if(list == null)
        return;

    for(GameObject object : list){
        if(object instanceof Fireball){
            map.removeFireball((Fireball)object);
        }
        else if(object instanceof Enemy){
            map.removeEnemy((Enemy)object);
        }
        else if(object instanceof Coin || object instanceof BoostItem){
            map.removePrize((Prize)object);
        }
    }
}
```

O mesmo padrão aparece em `Map.drawPrizes()` e `Map.updateLocations()`.

---

#### Smell 6 — Feature Envy (Inveja de funcionalidade)

**Arquivos:** `src/model/hero/Mario.java` e `src/model/hero/MarioForm.java`

```java
// Dentro do construtor de Mario
ImageLoader imageLoader = new ImageLoader();
BufferedImage[] leftFrames = imageLoader.getLeftFrames(MarioForm.SMALL);
```

**Descrição:** `ImageLoader` já existe em `GameEngine`, mas `Mario` cria outra instância — desperdício de recursos e acoplamento oculto.

---

#### Smell 7 — Complexidade condicional (cadeia longa de if-else)

**Arquivo:** `src/manager/GameEngine.java` — método `receiveInput()` (aprox. linhas 173–226)

**Descrição:** Grande cadeia `if/else if` combinando `GameStatus` × `ButtonAction`. Candidato natural ao **State Pattern** ou **Command Pattern**.

---

#### Smell 8 — Primitive Obsession (Obsessão por primitivos)

**Arquivo:** `src/manager/MapCreator.java`

```java
int mario = new Color(160, 160, 160).getRGB();
int ordinaryBrick = new Color(0, 0, 255).getRGB();
int surpriseBrick = new Color(255, 255, 0).getRGB();
int groundBrick = new Color(255, 0, 0).getRGB();
int pipe = new Color(0, 255, 0).getRGB();
int goomba = new Color(0, 255, 255).getRGB();
int koopa = new Color(255, 0, 255).getRGB();
int end = new Color(160, 0, 160).getRGB();
```

**Descrição:** Cores RGB funcionam como "protocolo" do mapa — frágil, difícil de documentar e propenso a erros.

---

#### Smell 9 — Dead Code (Código morto)

**Arquivo:** `src/manager/SoundManager.java`

```java
public void playFireFlower() {

}
```

**Descrição:** Método vazio — possível esquecimento ou refatoração incompleta.

---

#### Smell 10 — Inappropriate Intimacy (Intimidade inapropriada)

**Arquivo:** `src/manager/MapManager.java` — colisões manipulam estado interno do Mario

```java
if (marioBottomBounds.intersects(brickTopBounds)) {
    mario.setY(brick.getY() - mario.getDimension().height + 1);
    mario.setFalling(false);
    mario.setVelY(0);
}
```

**Descrição:** A responsabilidade de "como reagir à colisão" deveria estar mais no próprio `Mario` ou em um handler dedicado, não espalhada em `MapManager`.

---

### 2.2 Diagnóstico: o que torna esse código um alvo para refatoração?

#### Matriz smell × princípio SOLID

| Code Smell | Princípio violado | Risco prático |
|------------|-------------------|---------------|
| God Class (`MapManager`) | **SRP** — Single Responsibility | Colisão quebra ao mudar pontuação |
| Duplicate Code (`SoundManager`) | **DRY** — Don't Repeat Yourself | Inconsistência entre efeitos sonoros |
| Cadeias de `instanceof` | **OCP** — Open/Closed | Novo prêmio exige editar 4+ classes |
| Magic numbers | Legibilidade / manutenção | Balanceamento opaco |
| Feature Envy (`Mario`) | **DIP** — Dependency Inversion | Testes unitários difíceis |
| Long if-else (`receiveInput`) | **OCP** | Novo estado de jogo = método gigante |
| Primitive Obsession (`MapCreator`) | Clareza de domínio | Mapas frágeis e difíceis de estender |

#### Conclusão didática

O projeto é um **excelente caso prático** porque:

1. **Funciona** — não é código descartável; é software real com lógica de jogo completa.
2. **Concentra dívida técnica típica** de projetos acadêmicos feitos para "entregar o jogo", não para "evoluir o jogo".
3. **Oferece smells variados** — desde duplicação simples até violações de SOLID — permitindo exercícios em diferentes níveis de complexidade.

---

## 3. A Refatoração em Ação

### 3.1 Aplicando as técnicas: o passo a passo da reorganização

Sugestão de ordem de refatoração, do **menor risco** ao **maior impacto**:

---

#### Passo 1 — Extract Constant (Extrair constante)

**Smell alvo:** Magic Numbers

**Ação:** Criar classe `GameConstants.java`:

```java
public final class GameConstants {
    public static final int STOMP_POINTS = 100;
    public static final int FIREBALL_POINTS = 100;
    public static final double GRAVITY = 0.38;
    public static final double MARIO_SPEED = 5;
    public static final int CAMERA_OFFSET = 600;
    public static final double DEFAULT_TIME_LIMIT = 400;

    private GameConstants() {}
}
```

**Benefício:** legibilidade imediata, zero mudança de comportamento.

**Técnica (Fowler):** *Replace Magic Number with Symbolic Constant*

---

#### Passo 2 — Extract Method + eliminar duplicação em `SoundManager`

**Smell alvo:** Duplicate Code

**Antes:** 8 métodos quase idênticos.

**Depois:**

```java
private void playSound(String soundName) {
    Clip clip = getClip(loadAudio(soundName));
    if (clip != null) {
        clip.start();
    }
}

public void playJump()    { playSound("jump"); }
public void playCoin()    { playSound("coin"); }
public void playFireball(){ playSound("fireball"); }
// ...
```

**Técnica (Fowler):** *Extract Method* + *Replace Duplication with Single Method*

---

#### Passo 3 — Extract Class: separar colisões de `MapManager`

**Smell alvo:** God Class

**Ação:** Criar classe `CollisionDetector` (ou pacote `collision/`):

```
CollisionDetector
├── detectBottomCollisions(Mario, Map, CollisionListener)
├── detectTopCollisions(...)
├── detectHorizontalCollisions(...)
└── detectFireballCollisions(...)
```

`MapManager` passa a **orquestrar**; `CollisionDetector` concentra a **física de colisão**.

**Técnica (Fowler):** *Extract Class*

---

#### Passo 4 — Replace Type Code with Enum em `MapCreator`

**Smell alvo:** Primitive Obsession

**Ação:**

```java
enum TileType {
    MARIO(new Color(160, 160, 160)),
    ORDINARY_BRICK(new Color(0, 0, 255)),
    SURPRISE_BRICK(new Color(255, 255, 0)),
    GROUND_BRICK(new Color(255, 0, 0)),
    PIPE(new Color(0, 255, 0)),
    GOOMBA(new Color(0, 255, 255)),
    KOOPA(new Color(255, 0, 255)),
    END_FLAG(new Color(160, 0, 160));

    private final int rgb;

    TileType(Color color) {
        this.rgb = color.getRGB();
    }

    public int getRgb() {
        return rgb;
    }

    public static TileType fromRgb(int pixel) {
        for (TileType type : values()) {
            if (type.rgb == pixel) return type;
        }
        return null;
    }
}
```

**Técnica (Fowler):** *Replace Magic Number with Symbolic Constant* / *Introduce Enum*

---

#### Passo 5 — Replace Conditional with Polymorphism (prêmios)

**Smell alvo:** Cadeias de `instanceof`

**Ação:** Enriquecer a interface `Prize` com métodos como `update()`, `draw(Graphics)` e `onCollect(Mario, GameEngine)`. Cada prêmio implementa seu próprio comportamento.

**Técnica (Fowler):** *Replace Conditional with Polymorphism*

**Princípio alinhado:** **OCP** — aberto para extensão, fechado para modificação.

---

#### Passo 6 — Introduce State Pattern (opcional, avançado)

**Smell alvo:** Long if-else em `receiveInput()`

**Ação:** Criar estados `StartScreenState`, `RunningState`, `PausedState` implementando interface `InputHandler`.

**Técnica:** *Replace Conditional with State Pattern*

---

#### Passo 7 — Dependency Injection para `ImageLoader`

**Smell alvo:** Feature Envy

**Ação:** Passar `ImageLoader` no construtor de `Mario` em vez de `new ImageLoader()` interno.

**Técnica:** *Dependency Injection*

**Benefício:** facilita testes unitários e remove acoplamento oculto.

---

### 3.2 O código refatorado: comparativo do código antigo vs. código limpo

#### Exemplo A — Sons (`SoundManager`)

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Linhas de código | ~110 | ~60 |
| Duplicação | 8 blocos iguais | 1 método `playSound` |
| Manutenção | Novo som = copiar/colar | Novo som = 1 linha |
| Testabilidade | Difícil mockar 8 métodos | Um ponto de extensão |

**Antes:**

```java
public void playJump() {
    Clip clip = getClip(loadAudio("jump"));
    clip.start();
}

public void playCoin() {
    Clip clip = getClip(loadAudio("coin"));
    clip.start();
}
```

**Depois:**

```java
private void playSound(String name) {
    Clip clip = getClip(loadAudio(name));
    if (clip != null) clip.start();
}

public void playJump() { playSound("jump"); }
public void playCoin() { playSound("coin"); }
```

**Ganhos:** legibilidade e manutenibilidade — o significado de cada método público permanece claro, mas a lógica repetida fica centralizada.

---

#### Exemplo B — Remoção de objetos (`MapManager`)

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Extensibilidade | Novo tipo → novo `else if` | Novo tipo → implementa interface |
| Legibilidade | Cadeia de `instanceof` | Chamada polimórfica |
| OCP | Violado | Respeitado |

**Depois (esboço):**

```java
public interface MapEntity {
    void removeFrom(Map map);
}

// Fireball, Enemy, Prize implementam removeFrom

private void removeObjects(List<MapEntity> list) {
    list.forEach(entity -> entity.removeFrom(map));
}
```

**Ganhos:** adicionar um novo tipo de entidade não exige alterar a lógica central de remoção.

---

#### Exemplo C — Constantes de pontuação

**Antes:**

```java
mario.acquirePoints(100);
```

**Depois:**

```java
mario.acquirePoints(GameConstants.STOMP_POINTS);
```

**Ganhos:** auto-documentação — quem lê o código entende imediatamente o que o número representa.

---

#### Métricas sugeridas para o relatório do grupo

| Métrica | Antes (estimado) | Depois (meta) |
|---------|------------------|---------------|
| Linhas em `MapManager` | ~380 | < 150 |
| Métodos duplicados em `SoundManager` | 8 | 0 |
| Ocorrências de `instanceof` em colisões/prêmios | 10+ | 0–2 |
| Magic numbers em `manager/` | 15+ | 0 (centralizados) |

---

## 4. Desafio & Verificação de Conhecimento (Quiz / Questionário)

### 4.1 Quiz interativo comparando trechos de código com e sem code smells

**Versão interativa:** abra [`docs/interativo/quiz.html`](interativo/quiz.html) no navegador. Ao finalizar, o estudante pode **baixar um comprovante em PDF** informando nome, matrícula e curso.

**Comparativo de código:** abra [`docs/interativo/comparativo.html`](interativo/comparativo.html) para ver trechos com e sem smells lado a lado.

Abaixo está o gabarito em texto (útil para Google Forms, Kahoot ou impressão). Cada questão compara trechos **com smell** e **sem smell**.

---

#### Questão 1 — Duplicate Code

Qual trecho apresenta o smell **Duplicate Code**?

**Alternativa A:**

```java
public void playJump() {
    Clip clip = getClip(loadAudio("jump"));
    clip.start();
}
public void playCoin() {
    Clip clip = getClip(loadAudio("coin"));
    clip.start();
}
```

**Alternativa B:**

```java
private void playSound(String name) {
    Clip clip = getClip(loadAudio(name));
    if (clip != null) clip.start();
}
public void playJump() { playSound("jump"); }
```

**Resposta correta:** Alternativa **A** — o padrão load + play se repete. A alternativa B é a versão refatorada.

---

#### Questão 2 — God Class

Em qual arquivo está o smell **God Class**?

- A) `Coin.java`
- B) `MapManager.java`
- C) `ButtonAction.java`

**Resposta correta:** **B** — concentra colisões, tempo, mapa, pontuação e remoção de entidades.

---

#### Questão 3 — Magic Number

Qual linha contém **Magic Number**?

- A) `mario.acquirePoints(GameConstants.STOMP_POINTS);`
- B) `mario.acquirePoints(100);`
- C) `mario.acquirePoints(STOMP_ENEMY_SCORE);` *(constante nomeada)*

**Resposta correta:** **B** — o valor `100` aparece sem contexto. As alternativas A e C são aceitáveis.

---

#### Questão 4 — OCP (Open/Closed Principle)

Para adicionar um novo prêmio `StarPrize`, qual design viola **menos** o princípio OCP?

- A) Adicionar `else if (object instanceof StarPrize)` em `removeObjects`
- B) Fazer `StarPrize implements MapEntity` com `removeFrom(Map map)`
- C) Copiar toda a lógica de `Coin` para uma nova classe sem interface

**Resposta correta:** **B** — extensão por nova classe, sem alterar a lógica central de remoção.

---

#### Questão 5 — Feature Envy

```java
// Dentro do construtor de Mario
ImageLoader imageLoader = new ImageLoader();
```

Qual problema esse trecho exemplifica?

- A) Dead Code
- B) Feature Envy / dependência desnecessária
- C) Long Method

**Resposta correta:** **B** — Mario cria dependência que já existe no motor do jogo.

---

#### Questão 6 — Primitive Obsession

O que **melhor** substitui este trecho?

```java
int ordinaryBrick = new Color(0, 0, 255).getRGB();
if (currentPixel == ordinaryBrick) { ... }
```

- A) Comentário `// blue = ordinary brick`
- B) Enum `TileType.ORDINARY_BRICK`
- C) `if (currentPixel == 255)`

**Resposta correta:** **B** — enum documenta e centraliza o mapeamento pixel → entidade.

---

#### Questão 7 — Verdadeiro ou Falso

> "Refatorar sempre muda o comportamento visível do jogo."

**Resposta correta:** **Falso** — refatoração preserva o comportamento externo; melhora apenas a estrutura interna.

---

#### Questão 8 — Associar smell à técnica

Complete a tabela:

| Smell | Técnica de refatoração |
|-------|------------------------|
| 1. Long if-else em `receiveInput` | ? |
| 2. Magic numbers | ? |
| 3. God Class `MapManager` | ? |

**Respostas:**

1. State Pattern / Extract Method
2. Extract Constant / Introduce Enum
3. Extract Class (`CollisionDetector`)

---

## Smells extras (material didático adicional)

Se o grupo precisar de **mais exercícios**, é possível introduzir smells de propósito:

| Smell introduzido | Como simular | Técnica para corrigir |
|-------------------|--------------|------------------------|
| Long Method excessivo | Juntar `updateLocations()` e `checkCollisions()` em um método | Extract Method |
| Data Class | Transformar `Mario` em bag de getters/setters sem comportamento | Move Method |
| Comments desnecessários | Adicionar `// incrementa moedas` em `coins++` | Remove Comment |

> **Nota:** O código original já possui smells suficientes para um módulo completo. Introduzir smells artificiais é opcional.

---

## Sugestão de entregáveis do grupo

| Seção do módulo | Entregável sugerido |
|-----------------|---------------------|
| 1.1 | 1 página + diagrama de camadas |
| 1.2 | README traduzido + passos de execução |
| 2.1 | Tabela de smells com arquivo e linha |
| 2.2 | Matriz smell × SOLID |
| 3.1 | Refatorar pelo menos 2 smells (ex.: SoundManager + GameConstants) |
| 3.2 | Diff no Git + texto comparativo |
| 4.1 | Quiz em Google Forms ou Kahoot |

---

## Referências

- Martin Fowler — *Refactoring: Improving the Design of Existing Code*
- Robert C. Martin — *Clean Code* (capítulos sobre SOLID e code smells)
- Repositório original: [1G.Super-Mario-Bros](https://github.com/ahmetcandiroglu/1G.Super-Mario-Bros)

---

*Documento elaborado para o módulo Caso Prático — Curso de Refatoração de Código.*
