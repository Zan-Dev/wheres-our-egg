// === component.js ===

class Player {
    constructor(x, color, leftKey, rightKey) {
        this.worldX = x;
        this.screenX = x;
        this.y = 300;
        this.width = 50;
        this.height = 100;
        this.speed = 3;
        this.color = color;
        this.leftKey = leftKey;
        this.rightKey = rightKey;
    }

    update(keys) {
        if (keys[this.leftKey]) this.worldX -= this.speed;
        if (keys[this.rightKey]) this.worldX += this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.screenX, this.y, this.width, this.height);
    }

    getCenterX() {
        return this.worldX + this.width / 2;
    }
}

class Ground {
    constructor(image, repeatWidth) {
        this.image = image;
        this.repeatWidth = repeatWidth;
        this.height = 50;
    }

    draw(ctx, cameraX, canvasWidth) {
        const patternWidth = this.image.width;
        const startX = -cameraX % patternWidth;

        for (let x = startX; x < canvasWidth; x += patternWidth) {
            ctx.drawImage(this.image, x, 400, patternWidth, this.height);
        }
    }
}

export { Player, Ground };
