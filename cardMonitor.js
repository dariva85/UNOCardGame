import { UnoCard } from "./UnoCard.js";
import { Deck } from "./deck.js";
import { PlayerHand } from "./hand.js";

export class CardMonitor {
  constructor(Players, Cards) {
    this.deck = new Deck();
    this.playedCards = [];
    this.playerHands = new Map();
    let newPlayer;
    let icard;

    Cards.forEach((card) => {
      this.deck.AddCard(card);
    });
    Players.forEach((playerName) => {
      this.playerHands.set(playerName, new PlayerHand());
    });
  }

  DealHands(numCardsPerPlayer) {
    this.deck.Shuffle();

    this.playerHands.forEach((player) => {
      let i = 0;
      while (i < numCardsPerPlayer) {
        player.AddHandCard(this.getDeckCardAndRecycleIfNeeded());
        i++;
      }
    });
  }

  GiveNCardsToPlayer(numCards, playerName) {
    let i = 0;
    while (i < numCards) {
      this.playerHands
        .get(playerName)
        .AddHandCard(this.getDeckCardAndRecycleIfNeeded());
      i++;
    }
  }

  GetPlayersNames() {
    return Array.from(this.playerHands.keys());
  }

  GetPlayerCount() {
    return this.playerHands.size;
  }

  GetPlayerHand(playerName) {
    return this.playerHands.get(playerName);
  }

  PlayCard(playedCard) {
    this.playedCards.push(playedCard);
  }

  PeekLastPlayedCard() {
    return this.playedCards[this.playedCards.length - 1];
  }

  RecyclePlayedCards() {
    let lastPlayedCard = this.playedCards.pop();
    this.playedCards.forEach((card) => {
      this.deck.AddCard(card);
    });
    this.playedCards = [];
    this.playedCards.AddCard(lastPlayedCard);
    this.deck.Shuffle();
  }

  getDeckCardAndRecycleIfNeeded() {
    if (!this.deck.HasCards()) {
      this.RecyclePlayedCards();
    }
    return this.deck.GetCard();
  }
}
