// audioController.js
class AudioController {
    constructor(musicPath) {
        this.music = new Audio(musicPath);
        this.music.loop = true;
        this.music.volume = 0.5;
        this.isPlaying = false;
    }

    play(play) {
        if (play) {
            this.music.play().catch(e => {
                console.log('Audio play failed:', e);
            });
            this.isPlaying = true;
        }
    }

    pause() {
        if (this.isPlaying) {
            this.music.pause();
            this.isPlaying = false;
        }
    }
}

// Buat instance global
export const gameAudio = new AudioController('./assets/sounds/backsound.mp3');