export class obstacles {
    constructor(options) {
        // Posisi dan ukuran
        this.x = options.x;
        this.y = options.y;
        this.initialX = options.x;
        this.initialY = options.y;
        this.width = options.width;
        this.height = options.height;
        this.scale = options.scale;
        this.repeatX = options.repeatX || false;
        this.repeatWidth = options.repeatWidth || this.width;

        this.obstacles = options.obstacles;
        this.currentObstacle = options.currentObstacle || 'longGround';

        // Tipe: 'sprite' atau 'static'
        this.type = options.type; // 'sprite' | 'static'

        // Gambar (baik spritesheet atau gambar biasa)
        this.image = options.image;

        // Animasi jika type === 'sprite'
        this.frameCount = options.frameCount || 1;
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.frameInterval = options.frameInterval || 100;

        this.animationStopped = false; // Flag to control animation stop

        this.axis = options.axis || null;
        this.distance = options.distance || 0;
        this.speed = options.speed || 0;
        this.direction = 1;
        this.offset = 0;

        this.cameraX = 0; // posisi scroll platform (offset)
        this.canvasWidth = options.canvasWidth || 3000;
    }

    update(deltaTime, player1, player2, cameraX) {
        if (this.axis === 'x') {
            this.offset += this.speed * deltaTime * this.direction;
            if (Math.abs(this.offset) >= this.distance) {
                this.direction *= -1; // balik arah
            }
            this.x = this.initialX + this.offset;
        }

        const worldWidth = this.canvasWidth;
        const playerWidth = player1.width || 50; // default jika tidak didefinisikan
        const canvasMid = this.canvasWidth / 2;

        player1.worldX = Math.max(0, Math.min(worldWidth - playerWidth, player1.worldX)); // posisi player 1
        player2.worldX = Math.max(0, Math.min(worldWidth - playerWidth, player2.worldX)); // posisi player 2

        const midPoint = (player1.x + player2.x) / 2; // titik tengah dua player

        const maxCameraX = this.repeatWidth - this.canvasWidth;
        const desiredCameraX = midPoint - canvasMid;
        this.cameraX = cameraX;
    }

    draw(ctx, cameraX) {
        const obst = this.obstacles[this.currentObstacle];
        ctx.save();

        const drawY = this.y;

        if (this.repeatX) {
            const imgWidth = obst.image.width * this.scale;
            const imgHeight = obst.image.height * this.scale;

            let startX = this.x - (cameraX % imgWidth);
            const endX = this.canvasWidth + imgWidth;

            for (let x = startX; x < endX; x += imgWidth) {
                ctx.drawImage(
                    obst.image,
                    x,
                    drawY,
                    obst.image.width * this.scale,
                    obst.image.height * this.scale
                );
            }
            const box = this.getBoundingBox(cameraX);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
        } else {
            const frameWidth = obst.image.width / this.frameCount;
            if (!this.animationStopped) {
                this.frameTimer += 16.67; // assuming 60fps, you can pass deltaTime if available
                if (this.frameTimer >= this.frameInterval) {
                    this.frameTimer = 0;
                    this.frameIndex = (this.frameIndex + 1) % this.frameCount;
                }
            }
            ctx.drawImage(
                obst.image,
                this.frameIndex * frameWidth,
                0,
                frameWidth,
                obst.image.height,
                this.x - this.cameraX,
                drawY,
                this.width * this.scale,
                this.height * this.scale
            );
            const box = this.getBoundingBox(cameraX);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x - this.cameraX, box.y, box.width, box.height);
        }

        ctx.restore();
    }

    getBoundingBox(cameraX) {
        if (this.repeatX) {
            return {
                x: this.x,
                y: this.y + 15,
                width: this.width,
                height: this.height * this.scale - 21
            };
        } else {
            return {
                x: this.x,
                y: this.y + 15,
                width: this.width,
                height: this.height * this.scale - 21
            };
        }
    }

    setAnimationFrame(frameIndex) {
        this.frameIndex = frameIndex;
        this.frameTimer = 0;
        this.animationStopped = true; // stop automatic animation update
    }
}
