export class Player {
  constructor(x, y, color, controls) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 60;
    this.color = color;
    this.speed = 3;
    this.controls = controls;
    this.vx = 0;
  }

  update(keys, levelWidth) {
    this.vx = 0;
    if (keys[this.controls.left]) this.vx = -this.speed;
    if (keys[this.controls.right]) this.vx = this.speed;
    this.x += this.vx;

    if (this.x < 0) this.x = 0;
    if (this.x + this.width > levelWidth) this.x = levelWidth - this.width;
  }

  draw(ctx, offsetX) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - offsetX, this.y, this.width, this.height);
  }

  getCenter() {
    return this.x + this.width / 2;
  }
}