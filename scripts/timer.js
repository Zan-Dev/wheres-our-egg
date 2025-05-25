export class Timer {
     constructor() {
        this.elapsedTime = 0;
        this.running = false;
    }
    start() {
        this.running = true;
        console.log("Timer started");
    }
    pause() {
        this.running = false;
        console.log("Timer paused");
    }

    reset() {
        this.elapsedTime = 0;
    }
    update(deltaTime) {
        if (this.running) {
            this.elapsedTime += deltaTime;
        }
    }

    draw(ctx) {
        const totalSeconds = Math.floor(this.elapsedTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        console.log(timeString);
        ctx.save();
        ctx.font = "25px 'Press Start 2P'";
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(timeString, 100, 50);  // Fixed position at top-left corner
        ctx.restore();
    }
}
