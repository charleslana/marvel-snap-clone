import { GameButton } from '@/components/GameButton';
import { UIFactory } from '@/components/UIFactory';
import { ButtonColor } from '@/enums/ButtonColor';
import { ImageEnum } from '@/enums/ImageEnum';
import { GameEventManager } from './GameEventManager';
import { GameEvent } from '@/enums/GameEvent';
import { CardDetailsPanel } from '@/components/CardDetailsPanel';
import { CardData } from '@/interfaces/Card';

export class UIManager {
  public playerEnergy = 0;
  public isPlayerTurn = true;
  public currentTurn = 0;
  public maxTurn = 7;
  public energyDisplay!: GameButton;
  public endBattleButton!: GameButton;
  public endTurnButton!: GameButton;
  public turnDisplay!: GameButton;
  public cardDetailsPanel!: CardDetailsPanel;

  private scene: Phaser.Scene;
  private playerNameText!: Phaser.GameObjects.Text;
  private opponentNameText!: Phaser.GameObjects.Text;
  private playerName = 'Você';
  private opponentName = 'Oponente';

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initialize();
  }

  public clearColorPlayersNames() {
    this.playerNameText.setColor('#ffffff');
    this.opponentNameText.setColor('#ffffff');
  }

  public updateColorPlayerName(playerHasPriority: boolean) {
    this.clearColorPlayersNames();
    const targetText = playerHasPriority ? this.playerNameText : this.opponentNameText;
    targetText.setColor('#00ff00');
  }

  private initialize() {
    this.playerEnergy = 1;
    this.currentTurn = 1;
    this.maxTurn = 7;
    this.isPlayerTurn = true;
    this.createBackground();
    this.initializePlayerNames();
    this.initializeEnergyDisplay();
    this.initializeTurnDisplay();
    this.initializeEndTurnButton();
    this.initializeEndBattleButton();
    this.initializeCardDetailsPanel();
  }

  private createBackground() {
    const bg = this.scene.add.image(0, 0, ImageEnum.Background).setOrigin(0);
    bg.setDisplaySize(this.scene.cameras.main.width, this.scene.cameras.main.height);
  }

  private initializePlayerNames(): void {
    const spacing = 25;

    const opponentDeckY = 40;
    const opponentNameY = opponentDeckY + 40 + spacing;
    this.opponentNameText = UIFactory.createText(this.scene, 20, opponentNameY, this.opponentName, {
      fontSize: '22px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    const playerDeckY = this.scene.scale.height - 40;
    const playerNameY = playerDeckY - 40 - spacing;
    this.playerNameText = UIFactory.createText(this.scene, 20, playerNameY, this.playerName, {
      fontSize: '22px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
  }

  private initializeEnergyDisplay(): void {
    const energyX = 20;
    const centerY = this.scene.scale.height / 2;

    const buttonWidth = 150;
    const buttonHeight = 50;
    const buttonCenterX = energyX + buttonWidth / 2;

    this.energyDisplay = new GameButton(
      this.scene,
      buttonCenterX,
      centerY,
      `Energia: ${this.playerEnergy}`,
      () => {},
      {
        width: buttonWidth,
        height: buttonHeight,
        fontSize: '20px',
      }
    );
  }

  private initializeTurnDisplay(): void {
    const screenWidth = this.scene.scale.width;
    const centerY = this.scene.scale.height / 2;

    const buttonWidth = 150;
    const buttonHeight = 50;
    const buttonCenterX = screenWidth - buttonWidth / 2 - 20;

    this.turnDisplay = new GameButton(
      this.scene,
      buttonCenterX,
      centerY,
      `Turno: ${this.currentTurn}/${this.maxTurn - 1}`,
      () => {},
      {
        color: ButtonColor.Black,
        width: buttonWidth,
        height: buttonHeight,
        fontSize: '20px',
      }
    );
  }

  private initializeEndTurnButton(): void {
    const screenWidth = this.scene.scale.width;
    const screenHeight = this.scene.scale.height;

    const buttonWidth = 180;
    const buttonHeight = 50;
    const buttonCenterX = screenWidth - buttonWidth / 2 - 20;
    const buttonCenterY = screenHeight - buttonHeight / 2 - 20;

    this.endTurnButton = new GameButton(
      this.scene,
      buttonCenterX,
      buttonCenterY,
      'Finalizar Turno',
      () => {
        if (this.isPlayerTurn) {
          GameEventManager.instance.emit(GameEvent.EndTurn);
        }
      },
      {
        color: ButtonColor.Purple,
        width: buttonWidth,
        height: buttonHeight,
        fontSize: '20px',
      }
    );
  }

  private initializeEndBattleButton(): void {
    const centerY = this.scene.scale.height / 2;
    const buttonWidth = 220;
    const buttonHeight = 60;
    const buttonCenterX = 20 + buttonWidth / 2;

    this.endBattleButton = new GameButton(
      this.scene,
      buttonCenterX,
      centerY,
      'Finalizar Batalha',
      () => {
        GameEventManager.instance.emit(GameEvent.EndBattle);
      },
      {
        width: buttonWidth,
        height: buttonHeight,
        fontSize: '24px',
        color: ButtonColor.Black,
      }
    );

    this.endBattleButton.setVisible(false);
  }

  private initializeCardDetailsPanel(): void {
    const width = 220;
    const x = this.scene.scale.width - width / 2 - 20;
    const y = this.scene.scale.height / 2;
    this.cardDetailsPanel = new CardDetailsPanel(this.scene);
    this.cardDetailsPanel.initialize(x, y);

    this.scene.input.on(
      'gameobjectover',
      (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
        const container = gameObject as Phaser.GameObjects.Container & { cardData?: CardData };
        if (!container.cardData) return;
        this.cardDetailsPanel.showCardDetails(container.cardData);
      }
    );

    this.scene.input.on(
      'gameobjectout',
      (_pointer: Phaser.Input.Pointer, _gameObject: Phaser.GameObjects.GameObject) => {
        this.cardDetailsPanel.hideCardDetails();
      }
    );
  }
}
