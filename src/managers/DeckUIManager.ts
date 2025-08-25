import Phaser from 'phaser';
import { GameButton } from '@/components/GameButton';
import { ButtonColor } from '@/enums/ButtonColor';
import { Select } from '@/components/Select';
import { TextInput } from '@/components/TextInput';
import { UIFactory } from '@/components/UIFactory';
import { FontEnum } from '@/enums/FontEnum';
import { DeckManager } from './DeckManager';
import { GameEventManager } from './GameEventManager';
import { GameEvent } from '@/enums/GameEvent';
import { DeckMode } from '@/enums/DeckMode';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { AlertModal } from '@/components/AlertModal';

export class DeckUIManager {
  private scene: Phaser.Scene;
  private deckManager: DeckManager;

  private deckSelect!: Select;
  private deckNameInput!: TextInput;
  private createButton!: GameButton;
  private editButton!: GameButton;
  private deleteButton!: GameButton;
  private saveButton!: GameButton;
  private cancelButton!: GameButton;
  private deckTitleText!: Phaser.GameObjects.Text;

  public onDeckSelected?: (deckId: string) => void;
  public onDeckSaved?: () => void;

  constructor(scene: Phaser.Scene, deckManager: DeckManager) {
    this.scene = scene;
    this.deckManager = deckManager;
  }

  public initialize(): void {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    console.log('UI Manager configurando listeners globais');
    const events = GameEventManager.instance;

    events.on(
      GameEvent.DeckModeChanged,
      (mode: DeckMode) => {
        this.updateButtonVisibility();
        this.updateDeckTitle();
        this.updateInputs(mode);

        if (mode === DeckMode.Create) {
          this.deckSelect.setValue('');
        }
      },
      this
    );

    events.on(
      GameEvent.DeckDataChanged,
      () => {
        this.updateDeckTitle();
        this.updateSaveButton();
      },
      this
    );

    events.on(
      GameEvent.DeckListUpdated,
      (deckToSelectId?: string) => {
        this.refreshDeckSelect(deckToSelectId);
      },
      this
    );

    // É crucial limpar os listeners quando a cena for destruída
    this.scene.events.on('shutdown', () => {
      console.log('🧹 Limpando eventos do DeckUIManager');
      events.off(GameEvent.DeckModeChanged);
      events.off(GameEvent.DeckDataChanged);
      events.off(GameEvent.DeckListUpdated);
    });
  }

  public createDeckColumn(startX: number, width: number): void {
    const centerX = startX + width / 2;
    let currentY = 50;
    this.scene.add
      .text(centerX, currentY, 'Decks', {
        fontSize: '24px',
        fontStyle: 'bold',
        fontFamily: FontEnum.RedHatDisplay500,
      })
      .setOrigin(0.5);
    currentY += 50;
    UIFactory.createText(this.scene, centerX, currentY, 'Selecionar Deck', {
      fontSize: '18px',
    }).setOrigin(0.5);
    currentY += 40;
    this.createDeckSelect(centerX, currentY);
    currentY += 80;
    this.deckNameInput = new TextInput(this.scene, centerX, currentY, {
      width: 200,
      height: 38,
      placeholder: 'Nome do Deck...',
      maxLength: 50, //TODO diminuir para 50
    });
    this.deckNameInput.setVisible(false);
    currentY += 60;
    this.createButtons(centerX, currentY);
    this.updateButtonVisibility();
  }

  public createDeckTitle(x: number, y: number): void {
    this.deckTitleText = UIFactory.createText(this.scene, x, y, '', {
      fontSize: '20px',
      fontFamily: FontEnum.RedHatDisplay400,
    });
    this.updateDeckTitle();
  }

  public updateDeckTitle(): void {
    if (!this.deckTitleText) return;
    const deckName = this.deckManager.getSelectedDeckName();
    const count = this.deckManager.getDeckCount();
    this.deckTitleText.setText(`Deck: ${deckName} (${count}/12)`);
  }

  private createDeckSelect(x: number, y: number): void {
    const options = this.deckManager.getDeckSelectOptions();
    this.deckSelect = new Select(this.scene, x, y, {
      width: 220,
      options: options,
      defaultValue: 'Selecione um Deck...',
    });
    this.deckSelect.on('change', (event: Event) => {
      const selectElement = event.target as HTMLSelectElement;
      const selectedDeckId = selectElement.value;
      if (selectedDeckId) {
        this.deckManager.selectDeck(selectedDeckId);
        this.onDeckSelected?.(selectedDeckId);
      }
    });
  }

  private createButtons(centerX: number, startY: number): void {
    let currentY = startY;
    this.createButton = new GameButton(
      this.scene,
      centerX,
      currentY,
      'Criar Novo Deck',
      () => this.deckManager.startCreatingDeck(),
      { color: ButtonColor.Blue, width: 200, height: 50, fontSize: '18px' }
    );
    currentY += 60;
    this.editButton = new GameButton(
      this.scene,
      centerX,
      currentY,
      'Editar Deck',
      () => this.deckManager.startEditingDeck(),
      { color: ButtonColor.Purple, width: 200, height: 50, fontSize: '18px' }
    );
    currentY += 60;
    this.deleteButton = new GameButton(
      this.scene,
      centerX,
      currentY,
      'Remover Deck',
      () => {
        const deckId = this.deckManager.getSelectedDeckId();
        const deckName = this.deckManager.getSelectedDeckName();
        if (deckId) {
          const modal = new ConfirmationModal(this.scene, {
            message: `Remover o deck "${deckName}"?\n\nEsta ação não pode ser desfeita.`,
            confirmText: 'Remover',
            onConfirm: () => {
              this.deckManager.deleteDeck(deckId);
            },
          });
          modal.show();
        }
      },
      { color: ButtonColor.Red, width: 200, height: 50, fontSize: '18px' }
    );
    currentY += 60;
    this.saveButton = new GameButton(
      this.scene,
      centerX,
      currentY,
      'Salvar Deck',
      () => {
        const loading = new LoadingOverlay(this.scene);
        loading.show('Salvando Deck...');

        // Adiciona um pequeno atraso para o loading ser visível
        this.scene.time.delayedCall(500, () => {
          const deckName = this.deckNameInput.getValue();
          const success = this.deckManager.saveDeck(deckName);

          // Esconde o loading independentemente do resultado
          loading.hide();

          if (success) {
            // Opcional: Mostrar um alerta de sucesso
            new AlertModal(this.scene, { message: 'Deck salvo com sucesso!' }).show();
            this.onDeckSaved?.();
          }
          // Se não houve sucesso, o DeckManager já mostrou o alerta de erro.
        });
      },
      { color: ButtonColor.Purple, width: 200, height: 50, fontSize: '18px' }
    );
    currentY += 60;
    this.cancelButton = new GameButton(
      this.scene,
      centerX,
      currentY,
      'Cancelar',
      () => this.deckManager.cancelOperation(),
      { color: ButtonColor.Black, width: 200, height: 50, fontSize: '18px' }
    );
  }

  private updateButtonVisibility(): void {
    const mode = this.deckManager.getCurrentMode();
    const hasSelectedDeck = this.deckManager.getSelectedDeckId() !== '';
    if (
      !this.createButton ||
      !this.editButton ||
      !this.deleteButton ||
      !this.saveButton ||
      !this.cancelButton ||
      !this.deckNameInput
    )
      return;

    switch (mode) {
      case DeckMode.View:
        this.createButton.setVisible(true);
        this.editButton.setVisible(hasSelectedDeck);
        this.deleteButton.setVisible(hasSelectedDeck);
        this.saveButton.setVisible(false);
        this.cancelButton.setVisible(false);
        this.deckNameInput.setVisible(false);
        break;
      case DeckMode.Create:
      case DeckMode.Edit:
        this.createButton.setVisible(false);
        this.editButton.setVisible(false);
        this.deleteButton.setVisible(false);
        this.saveButton.setVisible(true);
        this.cancelButton.setVisible(true);
        this.deckNameInput.setVisible(true);
        break;
    }
    this.updateSaveButton();
  }

  private updateInputs(mode: DeckMode): void {
    if (!this.deckNameInput) return;
    if (mode === DeckMode.Create) {
      this.deckNameInput.setValue('');
    } else if (mode === DeckMode.Edit) {
      const deck = this.deckManager
        .getAllDecks()
        .find((d) => d.id === this.deckManager.getSelectedDeckId());
      this.deckNameInput.setValue(deck?.name || '');
    }
  }

  private updateSaveButton(): void {
    if (!this.saveButton || !this.saveButton.visible) return;
    const canSave = this.deckManager.isValidDeckSize();
    this.saveButton.setAlpha(canSave ? 1 : 0.5);
  }

  private refreshDeckSelect(deckToSelectId?: string): void {
    if (!this.deckSelect) return;

    // Guarda a posição do select para recriá-lo no mesmo lugar
    const selectX = this.deckSelect.x;
    const selectY = this.deckSelect.y;

    // Destroi o select antigo
    this.deckSelect.destroy();

    // Recria o select com as novas opções
    this.createDeckSelect(selectX, selectY);

    // Se um ID foi passado, seleciona esse deck.
    // Caso contrário, o select ficará no placeholder padrão.
    if (deckToSelectId) {
      this.deckSelect.setValue(deckToSelectId);
    }
  }

  public getDeckNameInput(): string {
    return this.deckNameInput?.getValue() || '';
  }
  public getCurrentMode(): DeckMode {
    return this.deckManager.getCurrentMode();
  }
}
