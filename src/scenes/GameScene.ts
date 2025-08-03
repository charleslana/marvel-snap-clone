import Phaser from "phaser";

interface Carta {
  nome: string;
  custo: number;
  poder: number;
  index: number;
}

interface Slot {
  x: number;
  y: number;
  ocupado: boolean;
  overlay?: Phaser.GameObjects.Rectangle;
}

interface Lane {
  x: number;
  y: number;
  playerSlots: Slot[];
  botSlots: Slot[];
  mundoText?: Phaser.GameObjects.Text;
  poderJogadorText?: Phaser.GameObjects.Text;
  poderBotText?: Phaser.GameObjects.Text;
  mundoContainer?: Phaser.GameObjects.Container;
}

interface CartaData extends Carta {
  index: number;
}

interface DraggableCard extends Phaser.GameObjects.Rectangle {
  cartaData: CartaData;
  startX: number;
  startY: number;
}

export default class GameScene extends Phaser.Scene {
  private jogadorMao: Omit<Carta, "index">[] = [
    { nome: "Homem de Ferro", custo: 2, poder: 3 },
    { nome: "Hulk", custo: 3, poder: 6 },
    { nome: "Viúva Negra", custo: 1, poder: 2 },
    { nome: "Capitão América", custo: 2, poder: 4 },
    { nome: "Nick Fury", custo: 5, poder: 9 },
  ];
  private botMao: Omit<Carta, "index">[] = [
    { nome: "Thanos", custo: 3, poder: 7 },
    { nome: "Loki", custo: 2, poder: 4 },
    { nome: "Ultron", custo: 1, poder: 2 },
    { nome: "Capitão América", custo: 2, poder: 4 },
    { nome: "Thor", custo: 4, poder: 8 },
  ];
  private turnoDoJogador = true;
  private energia = 5;
  private lanes: Lane[] = [];
  private maoJogadorContainers: Phaser.GameObjects.Container[] = [];
  private maoBotContainers: Phaser.GameObjects.Container[] = [];
  private finalizarTurnoButton?: Phaser.GameObjects.Text;
  private turnoAtual = 1;
  private energiaContainer?: Phaser.GameObjects.Container;
  private energiaTexto?: Phaser.GameObjects.Text;
  private energiaJogador = 0;
  private energiaBot = 0;

  create(): void {
    this.add.text(20, 20, "Marvel Snap Clone Offline", {
      color: "#fff",
      fontSize: "24px",
    });

    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;

    const totalLanes = 3;
    const spacing = screenWidth / (totalLanes + 1);
    const laneY = screenHeight / 2;
    const cardSpacing = 120;

    for (let i = 0; i < totalLanes; i++) {
      const x = spacing * (i + 1);
      const y = laneY;

      // Cria os elementos do "mundo"
      const mundoRect = this.add
        .rectangle(0, 0, 160, 100, 0x333333)
        .setStrokeStyle(2, 0xffffff);

      const mundoText = this.add
        .text(0, 0, `Mundo ${i + 1}`, {
          fontSize: "16px",
          color: "#ffffff",
        })
        .setOrigin(0.5, 0.5);

      // Texto poder bot (topo dentro do retângulo)
      const poderBotText = this.add
        .text(0, -100 / 2 + 15, "Poder Bot: 0", {
          fontSize: "14px",
          color: "#ff4444",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0);

      // Texto poder jogador (base dentro do retângulo)
      const poderJogadorText = this.add
        .text(0, 100 / 2 - 15, "Poder Jogador: 0", {
          fontSize: "14px",
          color: "#44ff44",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 1);

      // Cria container que agrupa o retângulo e textos
      const mundoContainer = this.add.container(x, y, [
        mundoRect,
        mundoText,
        poderBotText,
        poderJogadorText,
      ]);

      const playerSlots: Slot[] = [];
      const botSlots: Slot[] = [];

      const cardWidth = 80;
      const cardHeight = 110;
      const cols = 2;
      const rowsPerSide = 2; // 2 linhas para bot, 2 para jogador
      const horizontalSpacing = 5;
      const verticalSpacing = 5;

      const totalCardsWidth = cols * cardWidth + (cols - 1) * horizontalSpacing;
      const firstCardOffsetX = -totalCardsWidth / 2 + cardWidth / 2;

      const totalRows = rowsPerSide * 2; // total linhas = 4 (2 bot + 2 jogador)
      const totalHeight =
        totalRows * cardHeight + (totalRows - 1) * verticalSpacing;

      // Distância vertical entre o centro da lane e a linha mais próxima do bot ou jogador
      // Vamos posicionar as 2 linhas do bot acima do retângulo, e as 2 linhas do jogador abaixo

      // Altura da "margem" entre retângulo e primeiras linhas (ajustável)
      const marginFromRect = 10;

      for (let side = 0; side < 2; side++) {
        // 0 = bot, 1 = jogador
        for (let row = 0; row < rowsPerSide; row++) {
          for (let col = 0; col < cols; col++) {
            const offsetX =
              firstCardOffsetX + col * (cardWidth + horizontalSpacing);

            let slotX = x + offsetX;
            let slotY: number;

            if (side === 0) {
              // bot — linhas acima do retângulo mundo
              // linha mais próxima fica em: y - 100/2 - marginFromRect - cardHeight/2
              // segunda linha fica acima dela, descontando cardHeight + verticalSpacing
              slotY =
                y -
                100 / 2 -
                marginFromRect -
                cardHeight / 2 -
                row * (cardHeight + verticalSpacing);
            } else {
              // jogador — linhas abaixo do retângulo mundo
              // linha mais próxima fica em: y + 100/2 + marginFromRect + cardHeight/2
              // segunda linha fica abaixo dela, somando cardHeight + verticalSpacing
              slotY =
                y +
                100 / 2 +
                marginFromRect +
                cardHeight / 2 +
                row * (cardHeight + verticalSpacing);
            }

            const overlay = this.add
              .rectangle(slotX, slotY, cardWidth, cardHeight, 0xffffff, 0.2)
              .setVisible(false);

            const slot: Slot = {
              x: slotX,
              y: slotY,
              ocupado: false,
              overlay,
            };

            if (side === 0) botSlots.push(slot);
            else playerSlots.push(slot);
          }
        }
      }

      this.lanes.push({
        x,
        y,
        playerSlots,
        botSlots,
        mundoText,
        poderBotText,
        poderJogadorText,
        // Armazena também o container do mundo para facilitar manipulações futuras
        mundoContainer,
      });
    }

    const energiaX = 20;
    const energiaY = 60;

    const energiaRect = this.add
      .rectangle(energiaX, energiaY, 100, 40, 0x222222)
      .setOrigin(0);
    const energiaTexto = this.add
      .text(energiaX + 50, energiaY + 20, `Energia: ${this.turnoAtual}`, {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);

    this.energiaContainer = this.add.container(0, 0, [
      energiaRect,
      energiaTexto,
    ]);
    this.energiaTexto = energiaTexto;

    this.finalizarTurnoButton = this.add
      .text(screenWidth - 20, screenHeight - 40, "Finalizar Turno", {
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#222222",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (this.turnoDoJogador) {
          this.finalizarTurno();
        }
      });

    this.energiaJogador = this.turnoAtual;
    this.energiaBot = this.turnoAtual;
    this.atualizarEnergiaTexto();

    this.renderMao();
    this.renderMaoBot();
  }

  renderMao(): void {
    // destruir cartas antigas
    this.maoJogadorContainers.forEach((c) => c.destroy());
    this.maoJogadorContainers = [];

    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;
    const totalCartas = this.jogadorMao.length;

    const cardWidth = 100;
    const cardSpacing = 30;

    const totalWidth =
      cardWidth * totalCartas + cardSpacing * (totalCartas - 1);

    const startX = (screenWidth - totalWidth) / 2;
    const maoY = screenHeight - 120;

    this.jogadorMao.forEach((carta, index) => {
      const x = startX + index * (cardWidth + cardSpacing);
      const y = maoY;

      const cardRect = this.add.rectangle(0, 0, cardWidth, 140, 0x0088ff);

      const nomeText = this.add
        .text(0, 60, carta.nome, {
          color: "#ffffff",
          fontSize: "14px",
          align: "center",
        })
        .setOrigin(0.5, 1)
        .setWordWrapWidth(cardWidth - 10);

      const poderText = this.add
        .text(cardWidth / 2 - 10, -60, String(carta.poder), {
          color: "#ffffff",
          fontSize: "14px",
          align: "right",
        })
        .setOrigin(1, 0);

      const custoText = this.add
        .text(-cardWidth / 2 + 10, -60, String(carta.custo), {
          color: "#ffff00", // cor amarela pra diferenciar do poder
          fontSize: "14px",
          fontStyle: "bold",
          align: "left",
        })
        .setOrigin(0, 0); // esquerda, topo

      const container = this.add.container(x, y, [
        cardRect,
        nomeText,
        poderText,
        custoText,
      ]) as Phaser.GameObjects.Container & {
        cartaData: CartaData;
        startX: number;
        startY: number;
      };

      container.setSize(cardWidth, 140);
      container.setInteractive({ draggable: true });
      container.cartaData = { ...carta, index };
      container.startX = x;
      container.startY = y;

      this.input.setDraggable(container);

      this.maoJogadorContainers.push(container);
    });

    // Eventos de drag (registrar uma vez)
    this.input.on(
      "dragstart",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        const container = gameObject as Phaser.GameObjects.Container & {
          cartaData: CartaData;
          startX: number;
          startY: number;
        };

        container.startX = container.x;
        container.startY = container.y;

        container.setScale(0.8);

        // Mostrar overlays disponíveis
        for (const lane of this.lanes) {
          for (const slot of lane.playerSlots) {
            if (!slot.ocupado && slot.overlay) {
              slot.overlay.setVisible(true);
            }
          }
        }
      }
    );

    this.input.on(
      "drag",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
        dragX: number,
        dragY: number
      ) => {
        const container = gameObject as Phaser.GameObjects.Container & {
          cartaData: CartaData;
          startX: number;
          startY: number;
        };
        container.x = dragX;
        container.y = dragY;
      }
    );

    this.input.on(
      "dragend",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        const container = gameObject as Phaser.GameObjects.Container & {
          cartaData: CartaData;
          startX: number;
          startY: number;
        };
        const { x, y } = container;
        const { index, nome, custo, poder } = container.cartaData;

        let cartaPosicionada = false;

        for (const lane of this.lanes) {
          if (!this.turnoDoJogador || custo > this.energiaJogador) continue;

          for (const slot of lane.playerSlots) {
            if (
              !slot.ocupado &&
              Phaser.Math.Distance.Between(x, y, slot.x, slot.y) < 60
            ) {
              // Criar carta na lane (container filho)
              const cartaContainer = this.add.container(slot.x, slot.y);

              const cardRect = this.add.rectangle(0, 0, 80, 110, 0x00ccff);
              const nomeText = this.add
                .text(0, 45, nome, {
                  color: "#ffffff",
                  fontSize: "14px",
                  align: "center",
                })
                .setOrigin(0.5, 1)
                .setWordWrapWidth(70);
              const poderText = this.add
                .text(30, -45, String(poder), {
                  color: "#ffffff",
                  fontSize: "14px",
                  align: "right",
                })
                .setOrigin(1, 0);

              const custoText = this.add
                .text(-30, -45, String(custo), {
                  // -30 para esquerda do centro, -45 topo
                  color: "#ffff00",
                  fontSize: "14px",
                  fontStyle: "bold",
                  align: "left",
                })
                .setOrigin(0, 0);

              cartaContainer.add([cardRect, nomeText, poderText, custoText]);

              // Deixa interativo para clique
              cartaContainer.setSize(80, 110);
              cartaContainer.setInteractive({ useHandCursor: true });

              cartaContainer.on("pointerdown", () => {
                this.removerCartaPosicionada(cartaContainer);
              });

              // Marca slot ocupado
              slot.ocupado = true;
              (slot as any).poder = poder;

              // Marca carta container para identificar e linkar slot e carta
              (cartaContainer as any).posicionada = true;
              (cartaContainer as any).slot = slot;
              (cartaContainer as any).cartaData = container.cartaData;

              // Adiciona o turno atual em que a carta foi jogada
              (cartaContainer as any).turnoJogado = this.turnoAtual;

              // Remover a carta da mão
              this.jogadorMao.splice(index, 1);
              container.destroy();

              this.energiaJogador -= custo;
              this.atualizarEnergiaTexto();

              cartaPosicionada = true;

              this.atualizarPoderesLanes();

              break;
            }
          }
          if (cartaPosicionada) break;
        }

        if (!cartaPosicionada) {
          container.setScale(1);
          container.x = container.startX;
          container.y = container.startY;

          container.list.forEach((child) => {
            if (child instanceof Phaser.GameObjects.Text) {
              child.setVisible(true);
            }
          });
        }

        for (const lane of this.lanes) {
          for (const slot of lane.playerSlots) {
            slot.overlay?.setVisible(false);
          }
        }

        if (cartaPosicionada) {
          this.renderMao();
        }
      }
    );
  }

  renderMaoBot(): void {
    this.maoBotContainers.forEach((c) => c.destroy());
    this.maoBotContainers = [];

    const screenWidth = this.scale.width;
    const totalCartas = this.botMao.length;

    const cardWidth = 100;
    const cardSpacing = 30;

    const totalWidth =
      cardWidth * totalCartas + cardSpacing * (totalCartas - 1);

    const startX = (screenWidth - totalWidth) / 2;
    const maoY = 100;

    this.botMao.forEach((carta, index) => {
      const x = startX + index * (cardWidth + cardSpacing);
      const y = maoY;

      const cardRect = this.add.rectangle(0, 0, cardWidth, 140, 0xff0000);

      const nomeText = this.add
        .text(0, 60, carta.nome, {
          color: "#ffffff",
          fontSize: "14px",
          align: "center",
        })
        .setOrigin(0.5, 1)
        .setWordWrapWidth(cardWidth - 10);

      const poderText = this.add
        .text(cardWidth / 2 - 10, -60, String(carta.poder), {
          color: "#ffffff",
          fontSize: "14px",
          align: "right",
        })
        .setOrigin(1, 0);

      const custoText = this.add
        .text(-cardWidth / 2 + 10, -60, String(carta.custo), {
          color: "#ffff00",
          fontSize: "14px",
          fontStyle: "bold",
          align: "left",
        })
        .setOrigin(0, 0);

      const container = this.add.container(x, y, [
        cardRect,
        nomeText,
        poderText,
        custoText,
      ]);

      this.maoBotContainers.push(container);
    });
  }

  turnoBot(): void {
    const jogavel = this.botMao.filter((c) => c.custo <= this.energiaBot);
    if (jogavel.length > 0) {
      const carta = jogavel.sort((a, b) => b.poder - a.poder)[0];
      this.energiaBot -= carta.custo;
      const index = this.botMao.indexOf(carta);

      for (const lane of this.lanes) {
        const slot = lane.botSlots.find((s) => !s.ocupado);
        if (slot) {
          // Criar carta na lane
          this.add.rectangle(slot.x, slot.y, 80, 110, 0xff0000);

          this.add
            .text(slot.x, slot.y + 45, carta.nome, {
              color: "#ffffff",
              fontSize: "14px",
              align: "center",
            })
            .setOrigin(0.5, 1)
            .setWordWrapWidth(70);

          this.add
            .text(slot.x + 30, slot.y - 45, String(carta.poder), {
              color: "#ffffff",
              fontSize: "14px",
              align: "right",
            })
            .setOrigin(1, 0);

          this.add
            .text(slot.x - 30, slot.y - 45, String(carta.custo), {
              color: "#ffff00",
              fontSize: "14px",
              fontStyle: "bold",
              align: "left",
            })
            .setOrigin(0, 0);

          slot.ocupado = true;
          (slot as any).poder = carta.poder;
          this.botMao.splice(index, 1); // Remove da mão do bot

          // Atualiza visual da mão do bot
          this.renderMaoBot();
          this.atualizarPoderesLanes();

          break;
        }
      }
    }

    this.turnoDoJogador = true;
    this.finalizarTurnoButton?.setVisible(true);
  }

  private atualizarPoderesLanes() {
    for (const lane of this.lanes) {
      let poderBotTotal = 0;
      for (const slot of lane.botSlots) {
        poderBotTotal += (slot as any).poder ?? 0;
      }

      let poderJogadorTotal = 0;
      for (const slot of lane.playerSlots) {
        poderJogadorTotal += (slot as any).poder ?? 0;
      }

      lane.poderBotText?.setText(`Poder Bot: ${poderBotTotal}`);
      lane.poderJogadorText?.setText(`Poder Jogador: ${poderJogadorTotal}`);
    }
  }

  private finalizarTurno() {
    this.turnoDoJogador = false;
    this.finalizarTurnoButton?.setVisible(false);

    this.time.delayedCall(1000, () => {
      this.turnoBot();

      // Incrementa turno e atualiza energia após bot jogar
      this.turnoAtual++;
      this.energiaJogador = this.turnoAtual;
      this.energiaBot = this.turnoAtual;
      this.atualizarEnergiaTexto();

      this.turnoDoJogador = true;
      this.finalizarTurnoButton?.setVisible(true);
    });
  }

  // Função que remove carta posicionada (do jogador) e devolve para a mão
  private removerCartaPosicionada(container: Phaser.GameObjects.Container) {
    const turnoJogado = (container as any).turnoJogado as number;

    if (turnoJogado !== this.turnoAtual) {
      // Carta jogada em turno anterior - não pode voltar
      console.log("Carta jogada em turno anterior. Não pode voltar.");
      return;
    }

    if (turnoJogado === this.turnoAtual) {
      this.energiaJogador += (container as any).cartaData.custo;
      this.atualizarEnergiaTexto();
    }

    // Continua o código para liberar slot, devolver para mão etc...
    const slot = (container as any).slot as Slot;
    if (!slot) return;

    slot.ocupado = false;
    delete (slot as any).poder;

    const cartaData = (container as any).cartaData as Carta;

    // this.jogadorMao.push({
    //   nome: cartaData.nome,
    //   custo: cartaData.custo,
    //   poder: cartaData.poder,
    // });

    const originalIndex = (container as any).cartaData.index;

    // Insere a carta na posição original (ou o máximo possível, para evitar erro)
    if (originalIndex !== undefined && originalIndex >= 0) {
      this.jogadorMao.splice(originalIndex, 0, {
        nome: cartaData.nome,
        custo: cartaData.custo,
        poder: cartaData.poder,
      });
    } else {
      this.jogadorMao.push({
        nome: cartaData.nome,
        custo: cartaData.custo,
        poder: cartaData.poder,
      });
    }

    container.destroy();

    this.atualizarPoderesLanes();
    this.renderMao();

    this.finalizarTurnoButton?.setVisible(true);
  }

  private atualizarEnergiaTexto() {
    if (!this.energiaTexto) return;

    const energiaAtual = this.turnoDoJogador
      ? this.energiaJogador
      : this.energiaBot;
    this.energiaTexto.setText(`Energia: ${energiaAtual}`);
  }
}
