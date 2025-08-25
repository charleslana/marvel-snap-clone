export enum GameEvent {
  LogRequest = 'logRequest',
  AddCardToHand = 'addCardToHand',
  PlacedCardsUI = 'placedCardsUI',
  RenderPlayerHand = 'renderPlayerHand',
  RenderOpponentHand = 'renderOpponentHand',
  PlaceCardOnSlot = 'placeCardOnSlot',
  EndTurn = 'endTurn',
  EndBattle = 'endBattle',
  RemoveCardFromPlayerHand = 'removeCardFromPlayerHand',
  UpdateEnergy = 'updateEnergy',
  GameEnded = 'GameEnded',
  UpdateDeckDisplays = 'UpdateDeckDisplays',
  DECK_MODE_CHANGED = 'deckModeChanged', // Quando o modo (view, create, edit) muda
  DECK_DATA_CHANGED = 'deckDataChanged', // Quando as cartas no deck atual mudam
  DECK_LIST_UPDATED = 'deckListUpdated', // Quando um deck é criado, salvo ou deletado
}
