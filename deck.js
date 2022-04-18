import { UnoCard } from "./UnoCard.js";

export class Deck {
  constructor() {
    this.theDeck = [];
  }

  AddCard(cardToAdd) {
    cardToAdd.ResetColor();
    this.theDeck.push(cardToAdd);
  }

  GetCard() {
    return this.theDeck.pop();
  }

  Shuffle() {
    let shuffledDeck = [];
    let i = 0;

    while (this.theDeck.length > 0) {
      i = Math.floor(Math.random() * this.theDeck.length);
      shuffledDeck.push(this.theDeck[i]);
      this.theDeck.splice(i, 1);
    }
    this.theDeck = shuffledDeck;
  }

  HasCards() {
    return this.theDeck.length > 0;
  }
}