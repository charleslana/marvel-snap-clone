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
  DeckModeChanged = 'deckModeChanged', // Quando o modo (view, create, edit) muda
  DeckDataChanged = 'deckDataChanged', // Quando as cartas no deck atual mudam
  DeckListUpdated = 'deckListUpdated',
}
