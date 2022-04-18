export class UnoCard {
  constructor(value, color, points) {
    this.value = value;
    this.color = color;
    this.points = points;
    this.hasColor = color !== "";
    this.accumulated = 0;
  }

  IsSpecialCard() {
    return isNaN(this.value);
  }

  IsAccumulativeCard() {
    return this.accumulated != 0;
  }

  GetCardValue() {
    return this.value;
  }

  GetCardColor() {
    return this.color;
  }

  GetCardAccumulated() {
    return this.accumulated;
  }

  SetCardAccumulated(newAccumulated) {
    this.accumulated = newAccumulated;
  }

  ResetCardAccumulated() {
    this.accumulated = 0;
  }

  IsColored() {
    return this.hasColor;
  }

  SetColor(newColor) {
    this.color = newColor;
  }

  ResetColor() {
    if (!this.hasColor) {
      this.color = "";
    }
  }
}
