import { UnoCard } from "./UnoCard.js";

export class PlayerHand {
  constructor() {
    this.playerCards = [];
    this.dicartedCards = [];
  }

  AddHandCard(cardToAdd) {
    this.playerCards.push(cardToAdd);
  }

  GetHandCard(index) {
    let card = this.playerCards[index];
    this.playerCards.splice(index, 1);
    return card;
  }

  PeekHandCard(index) {
    return this.playerCards[index];
  }

  MakeCardVisible(index) {
    this.playerCards[index].ShowCard();
  }

  HideCard(index) {
    this.playerCards[index].HideCard();
  }

  AddDiscartedCard(cardToAdd) {
    this.dicartedCards.push(cardToAdd);
  }

  GetPlayerCards() {
    return this.playerCards;
  }

  GetDiscartedCards() {
    return this.dicartedCards;
  }
}
