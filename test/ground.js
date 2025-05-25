export class Ground {
  constructor(image, canvasWidth, height) {
    this.image = image;
    this.x = 0;
    this.y = height;
    this.tileWidth = image.width;
    this.canvasWidth = canvasWidth;
  }

  update(offsetX) {
    this.x = offsetX;
  }

  draw(ctx) {
    for (let i = -1; i < this.canvasWidth / this.tileWidth + 2; i++) {
      ctx.drawImage(this.image, i * this.tileWidth - this.x % this.tileWidth, this.y);
    }
  }
}
