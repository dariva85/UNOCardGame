import { CardMonitor } from "./cardMonitor.js";
import { UnoCard } from "./UnoCard.js";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { lstat } from "node:fs";

class UnoGame {
  constructor(Players) {
    this.cardMonitor = new CardMonitor(Players, GetUnoCards());
    this.cardMonitor.DealHands(7);
    this.cardMonitor.PlayCard(this.cardMonitor.getDeckCardAndRecycleIfNeeded());
    this.turn = Math.floor(Math.random() * Players.length);
    this.errorMessage = "";
    this.nextTurn = 1;
    this.RequireColorSelection = false;

    function GetUnoCards() {
      let cards = [];
      let colors = ["BLUE", "RED", "GREEN", "YELLOW"];
      let nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

      colors.forEach((color) => {
        for (let i = 0; i < 2; i++) {
          nums.forEach((theNum) => {
            cards.push(new UnoCard(theNum, color, theNum));
          });
        }
        for (let i = 0; i < 2; i++) {
          cards.push(new UnoCard("plus 2", color, 10));
          cards.push(new UnoCard("reverse", color, 10));
          cards.push(new UnoCard("block", color, 10));
        }
      });

      for (let i = 0; i < 2; i++) {
        cards.push(new UnoCard("plus 4", "", 10));
        cards.push(new UnoCard("NewColor", "", 10));
      }
      return cards;
    }
  }

  PrintGameStatus() {
    let currentPlayer = this.cardMonitor.GetPlayersNames()[this.turn];

    if (this.isGameEnded()) {
      let winner = "";
      this.cardMonitor.GetPlayersNames().forEach((playerName) => {
        if (
          this.cardMonitor.GetPlayerHand(playerName).GetPlayerCards().length ==
          0
        ) {
          winner = playerName;
        }
      });
      console.log("**********************************");
      console.log("**********************************");
      console.log(`The Winner is: ${winner}`);
      console.log("**********************************");
      console.log("**********************************");
    } else {
      if (this.RequireColorSelection) {
        console.log(`Turn for Player: ${currentPlayer}`);
        console.log("You must select a color");
        console.log(`0 - Red`);
        console.log(`1 - Blue`);
        console.log(`2 - Green`);
        console.log(`3 - Yellow`);
        console.log("Which color do you want to play? ");
      } else {
        let lastPlayedCard = this.cardMonitor.PeekLastPlayedCard();
        let i = 0;

        console.log(
          `Last Played Card is: \n ${lastPlayedCard.GetCardValue()} - ${lastPlayedCard.GetCardColor()}`
        );
        console.log("");
        console.log(`Turn for Player: ${currentPlayer}`);
        console.log("");
        console.log(`Your cards:`);

        this.cardMonitor
          .GetPlayerHand(currentPlayer)
          .GetPlayerCards()
          .forEach((theCard) => {
            console.log(
              `Card ${i}: ${theCard.GetCardValue()} - ${theCard.GetCardColor()}`
            );
            i++;
          });

        if (this.errorMessage != "") {
          console.log("********************************");
          console.log(this.errorMessage);
          console.log("********************************");
          this.errorMessage = "";
        }

        console.log(
          "Which Card do you want to play? (Choose a card o type D to draw)): "
        );
        console.log("");
      }
    }
  }

  isGameEnded() {
    let isGameEnded = false;

    this.cardMonitor.GetPlayersNames().forEach((playerName) => {
      if (
        this.cardMonitor.GetPlayerHand(playerName).GetPlayerCards().length == 0
      ) {
        isGameEnded = true;
      }
    });
    return isGameEnded;
  }

  NextTurn() {
    let totalPlayers = this.cardMonitor.GetPlayerCount();
    this.turn += this.nextTurn;

    if (this.turn == totalPlayers) {
      this.turn -= totalPlayers;
    }
    if (this.turn < 0) {
      this.turn += totalPlayers;
    }
    if (this.nextTurn == -2) this.nextTurn = -1;
    if (this.nextTurn == 2) this.nextTurn = 1;
  }

  Draw() {
    let currentPlayer = this.cardMonitor.GetPlayersNames()[this.turn];
    let lastPlayedCard = this.cardMonitor.PeekLastPlayedCard();
    let cardsToDraw = 1;
    if (lastPlayedCard.GetCardAccumulated() > 0) {
      cardsToDraw = lastPlayedCard.GetCardAccumulated();
      lastPlayedCard.SetCardAccumulated(0);
    }
    this.cardMonitor.GiveNCardsToPlayer(cardsToDraw, currentPlayer);

    this.NextTurn();
  }

  ProcessSelectedOption(Index) {
    if (this.RequireColorSelection) {
      this.SetChoosedColor(Index);
    } else {
      this.PlayCard(Index);
    }
  }

  SetChoosedColor(Index) {
    let lastPlayedCard = this.cardMonitor.PeekLastPlayedCard();

    if (0 > Index > 3) {
      this.errorMessage = `Invalid Color`;
    } else {
      switch (Index) {
        case "0":
          lastPlayedCard.SetColor("RED");
          break;
        case "1":
          lastPlayedCard.SetColor("BLUE");
          break;
        case "2":
          lastPlayedCard.SetColor("GREEN");
          break;
        case "3":
          lastPlayedCard.SetColor("YELLOW");
          break;
      }
      this.RequireColorSelection = false;
      this.NextTurn();
    }
  }

  PlayCard(Index) {
    try {
      let lastPlayedCard = this.cardMonitor.PeekLastPlayedCard();
      let currentPlayer = this.cardMonitor.GetPlayersNames()[this.turn];
      let theCard = this.cardMonitor
        .GetPlayerHand(currentPlayer)
        .PeekHandCard(Index);

      if (this.isPlayableCard(Index)) {
        theCard = this.cardMonitor
          .GetPlayerHand(currentPlayer)
          .GetHandCard(Index);

        this.cardMonitor.PlayCard(theCard);

        this.ApplyActionIfNeeded(lastPlayedCard.GetCardAccumulated());

        if (!theCard.IsColored()) {
          this.RequireColorSelection = true;
        } else {
          this.NextTurn();
        }
      } else {
        this.errorMessage = `Invalid selected card`;
      }
    } catch (error) {
      this.errorMessage = `Invalid selected card`;
    }
  }

  ApplyActionIfNeeded(OldAccumulated) {
    let lastPlayedCard = this.cardMonitor.PeekLastPlayedCard();
    switch (lastPlayedCard.GetCardValue()) {
      case "reverse":
        this.nextTurn = this.nextTurn * -1;
        break;
      case "block":
        if (Math.abs(this.nextTurn) !== 1) this.nextTurn = this.nextTurn * 2;
        break;
      case "plus 2":
        lastPlayedCard.SetCardAccumulated(2 + OldAccumulated);
        break;
      case "plus 4":
        lastPlayedCard.SetCardAccumulated(4 + OldAccumulated);
        break;
    }
  }

  isPlayableCard(Index) {
    let currentPlayer = this.cardMonitor.GetPlayersNames()[this.turn];
    let lastPlayedCard = this.cardMonitor.PeekLastPlayedCard();
    let theCard = this.cardMonitor
      .GetPlayerHand(currentPlayer)
      .PeekHandCard(Index);

    if (lastPlayedCard.GetCardAccumulated() !== 0) {
      return lastPlayedCard.GetCardValue() === theCard.GetCardValue();
    }

    if (!lastPlayedCard.IsAccumulativeCard() && theCard.IsColored()) {
      if (
        lastPlayedCard.GetCardColor() === theCard.GetCardColor() ||
        lastPlayedCard.GetCardValue() === theCard.GetCardValue()
      ) {
        return true;
      }
    } else {
      if (!theCard.IsColored()) {
        return true;
      } else {
        return lastPlayedCard.GetCardValue() === theCard.GetCardValue();
      }
    }
    return false;
  }
}

const thegame = new UnoGame(["Ramon", "Carles", "David", "Pau"]);
let rl;
let choosenOption;

while (!thegame.isGameEnded()) {
  thegame.PrintGameStatus();

  rl = readline.createInterface({ input, output });
  choosenOption = await rl.question("Choose your option: ");
  rl.close();
  if (isNaN(choosenOption)) {
    if (choosenOption === "D") {
      thegame.Draw();
    }
  } else {
    thegame.ProcessSelectedOption(choosenOption);
  }
}
thegame.PrintGameStatus();
