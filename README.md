# Estrutura do Projeto Marvel Snap Clone

Este projeto foi refatorado para uma estrutura mais modular e organizada, separando as responsabilidades em diferentes arquivos e pastas.

## Estrutura de Pastas

```
src/
├── components/           # Componentes visuais reutilizáveis do Phaser
│   ├── CardContainer.ts
│   ├── CardDetailsPanel.ts
│   ├── EndTurnButton.ts
│   ├── EnergyDisplay.ts
│   ├── LaneDisplay.ts
│   └── TurnDisplay.ts
├── interfaces/           # Definições de interfaces para os dados do jogo
│   ├── Card.ts
│   ├── Lane.ts
│   └── Slot.ts
├── scenes/               # Cenas do Phaser (onde a lógica principal do jogo reside)
│   └── GameScene.ts
└── utils/                # Utilitários e lógicas de negócio separadas
    ├── BotAI.ts
    ├── DragAndDropManager.ts
    └── GameEndManager.ts
```

## Descrição dos Arquivos

### `src/interfaces/`

- `Card.ts`: Define as interfaces `Card` e `CardData` para as cartas do jogo.
- `Lane.ts`: Define a interface `Lane` para as pistas de jogo.
- `Slot.ts`: Define a interface `Slot` para os espaços onde as cartas podem ser jogadas.

### `src/components/`

- `CardContainer.ts`: Representa visualmente uma carta no jogo, encapsulando sua renderização e dados.
- `CardDetailsPanel.ts`: Gerencia a exibição do painel de detalhes da carta.
- `EndTurnButton.ts`: Componente para o botão de finalizar turno.
- `EnergyDisplay.ts`: Gerencia a exibição da energia do jogador.
- `LaneDisplay.ts`: Responsável pela criação e gerenciamento das pistas de jogo e seus slots.
- `TurnDisplay.ts`: Gerencia a exibição do turno atual.

### `src/scenes/`

- `GameScene.ts`: A cena principal do jogo. Agora atua como um orquestrador, utilizando os componentes e utilitários para construir a lógica do jogo. Contém as propriedades de estado do jogo e os métodos que coordenam as interações entre os diferentes módulos.

### `src/utils/`

- `BotAI.ts`: Contém a lógica de inteligência artificial para o turno do bot, incluindo a seleção e colocação de cartas.
- `DragAndDropManager.ts`: Gerencia toda a lógica de arrastar e soltar das cartas do jogador.
- `GameEndManager.ts`: Responsável por verificar as condições de fim de jogo e exibir o modal de resultado.

## Como Usar

Para integrar esta nova estrutura ao seu projeto, você precisará:

1.  **Criar as pastas** `src/components`, `src/interfaces`, `src/scenes` e `src/utils` no seu projeto.
2.  **Copiar os arquivos** `.ts` gerados para suas respectivas pastas.
3.  **Atualizar o arquivo principal do seu jogo** (provavelmente `main.ts` ou similar) para importar e iniciar a `GameScene` da nova localização (`src/scenes/GameScene.ts`).

Esta refatoração visa melhorar a manutenibilidade, legibilidade e escalabilidade do seu código, tornando mais fácil adicionar novas funcionalidades ou fazer alterações no futuro.
