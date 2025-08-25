import { Card } from '@/interfaces/Card';
import { Deck } from '@/interfaces/Deck';
import { userDecks } from '@/data/UserDecks';
import { GameEventManager } from './GameEventManager';
import { GameEvent } from '@/enums/GameEvent';
import { DeckMode } from '@/enums/DeckMode';

export class DeckManager {
  private currentDeckData: Card[] = [];
  private currentMode: DeckMode = DeckMode.View;
  private selectedDeckId: string = '';
  private originalDeckData: Card[] = [];

  constructor() {
    this.reset();
  }

  // Getters (sem alterações)
  public getCurrentDeckData(): Card[] {
    return [...this.currentDeckData];
  }
  public getCurrentMode(): DeckMode {
    return this.currentMode;
  }
  public getSelectedDeckId(): string {
    return this.selectedDeckId;
  }
  public getSelectedDeckName(): string {
    if (this.currentMode === DeckMode.Create) return 'Novo Deck';
    if (this.currentMode === DeckMode.Edit) {
      const deck = this.findDeckById(this.selectedDeckId);
      return deck ? `${deck.name} (Editando)` : 'Editando';
    }
    const deck = this.findDeckById(this.selectedDeckId);
    return deck ? deck.name : 'Nenhum';
  }
  public getDeckCount(): number {
    return this.currentDeckData.length;
  }
  public isMaxDeckSize(): boolean {
    return this.currentDeckData.length >= 12;
  }
  public isValidDeckSize(): boolean {
    return this.currentDeckData.length === 12;
  }
  public isCreatingOrEditing(): boolean {
    return this.currentMode === DeckMode.Create || this.currentMode === DeckMode.Edit;
  }
  public canAddCard(card: Card): boolean {
    if (!this.isCreatingOrEditing()) return false;
    if (this.isMaxDeckSize()) return false;
    return !this.hasCardInDeck(card);
  }
  public canRemoveCard(index: number): boolean {
    if (!this.isCreatingOrEditing()) return false;
    return index >= 0 && index < this.currentDeckData.length;
  }

  // Actions (com a lógica de emitir eventos globais)
  public selectDeck(deckId: string): boolean {
    const deck = this.findDeckById(deckId);
    if (!deck) return false;
    this.selectedDeckId = deckId;
    this.currentDeckData = [...deck.cards];
    this.currentMode = DeckMode.View;
    this.emitModeAndDataChange(); // Emite ambos os eventos
    return true;
  }

  public startCreatingDeck(): void {
    this.currentMode = DeckMode.Create;
    this.selectedDeckId = '';
    this.currentDeckData = [];
    this.emitModeAndDataChange(); // Emite ambos os eventos
  }

  public startEditingDeck(): boolean {
    if (!this.selectedDeckId) return false;
    const deck = this.findDeckById(this.selectedDeckId);
    if (!deck) return false;

    this.currentMode = DeckMode.Edit;
    this.originalDeckData = [...deck.cards];
    this.currentDeckData = [...deck.cards];
    this.emitModeAndDataChange(); // Emite ambos os eventos
    return true;
  }

  public cancelOperation(): void {
    if (this.currentMode === DeckMode.Edit && this.selectedDeckId) {
      this.currentDeckData = [...this.originalDeckData];
    } else {
      this.currentDeckData = [];
      this.selectedDeckId = '';
    }
    this.currentMode = DeckMode.View;
    this.originalDeckData = [];
    this.emitModeAndDataChange(); // Emite ambos os eventos
  }

  public addCard(card: Card): boolean {
    if (!this.canAddCard(card)) return false;
    this.currentDeckData.push({ ...card });
    this.emitDataChangeOnly(); // Emite APENAS o evento de dados
    return true;
  }

  public removeCard(index: number): boolean {
    if (!this.canRemoveCard(index)) return false;
    this.currentDeckData.splice(index, 1);
    this.emitDataChangeOnly(); // Emite APENAS o evento de dados
    return true;
  }

  public saveDeck(deckName: string): boolean {
    if (!this.isValidDeckSize()) {
      alert('O deck precisa ter exatamente 12 cartas para ser salvo.');
      return false;
    }
    const trimmedName = deckName.trim();
    if (!trimmedName) {
      alert('O nome do deck não pode estar vazio.');
      return false;
    }
    const isNameDuplicate = userDecks.some(
      (deck) =>
        deck.name.toLowerCase() === trimmedName.toLowerCase() && deck.id !== this.selectedDeckId
    );
    if (isNameDuplicate) {
      alert(`Já existe um deck com o nome "${trimmedName}". Por favor, escolha outro nome.`);
      return false;
    }

    if (this.currentMode === DeckMode.Create) {
      return this.saveNewDeck(trimmedName);
    } else if (this.currentMode === DeckMode.Edit) {
      return this.saveEditedDeck(trimmedName);
    }
    return false;
  }

  public deleteDeck(deckId: string): boolean {
    const deckIndex = userDecks.findIndex((deck) => deck.id === deckId);
    if (deckIndex === -1) return false;

    userDecks.splice(deckIndex, 1);
    // Notifica que a lista de decks no <select> precisa ser atualizada.
    GameEventManager.instance.emit(GameEvent.DECK_LIST_UPDATED);

    // Se o deck removido era o que estava selecionado...
    if (this.selectedDeckId === deckId) {
      this.reset(); // Reseta o estado interno (selectedDeckId fica vazio)

      // --- A CORREÇÃO ESTÁ AQUI ---
      // Agora, notifica a UI sobre a mudança de estado (modo e dados).
      // O UIManager vai ouvir isso e esconder os botões "Editar" e "Remover".
      this.emitModeAndDataChange();
    }

    return true;
  }

  public reset(): void {
    this.currentDeckData = [];
    this.currentMode = DeckMode.View;
    this.selectedDeckId = '';
    this.originalDeckData = [];
  }

  // Private methods
  private findDeckById(deckId: string): Deck | undefined {
    return userDecks.find((deck) => deck.id === deckId);
  }

  private hasCardInDeck(card: Card): boolean {
    return this.currentDeckData.some(
      (deckCard) =>
        deckCard.name === card.name && deckCard.cost === card.cost && deckCard.power === card.power
    );
  }

  private saveNewDeck(deckName: string): boolean {
    const newDeckId = 'deck_' + Date.now();
    const newDeck: Deck = { id: newDeckId, name: deckName, cards: [...this.currentDeckData] };
    userDecks.push(newDeck);
    GameEventManager.instance.emit(GameEvent.DECK_LIST_UPDATED, newDeckId);

    this.selectedDeckId = newDeckId;
    this.currentMode = DeckMode.View; // O modo mudou de Create para View
    this.emitModeAndDataChange(); // Emite ambos os eventos para a UI se resetar
    return true;
  }

  private saveEditedDeck(deckName: string): boolean {
    const deck = this.findDeckById(this.selectedDeckId);
    if (!deck) return false;

    deck.name = deckName;
    deck.cards = [...this.currentDeckData];
    GameEventManager.instance.emit(GameEvent.DECK_LIST_UPDATED, deck.id);

    this.currentMode = DeckMode.View; // O modo mudou de Edit para View
    this.originalDeckData = [];
    this.emitModeAndDataChange(); // Emite ambos os eventos para a UI se resetar
    return true;
  }

  private triggerCallbacks(): void {
    GameEventManager.instance.emit(
      GameEvent.DECK_DATA_CHANGED,
      this.getCurrentDeckData(),
      this.currentMode
    );
  }

  // Utility methods
  public getAllDecks(): Deck[] {
    return [...userDecks];
  }
  public getDeckSelectOptions(): Array<{ value: string; text: string }> {
    return userDecks.map((deck) => ({ value: deck.id, text: deck.name }));
  }

  private emitDataChangeOnly(): void {
    GameEventManager.instance.emit(
      GameEvent.DECK_DATA_CHANGED,
      this.getCurrentDeckData(),
      this.currentMode
    );
  }

  private emitModeAndDataChange(): void {
    // É importante emitir a mudança de dados primeiro, caso algum listener dependa dela
    this.emitDataChangeOnly();
    // Em seguida, emite a mudança de modo, que geralmente redesenha a UI.
    GameEventManager.instance.emit(GameEvent.DECK_MODE_CHANGED, this.currentMode);
  }
}
