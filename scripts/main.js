import { initGame, gameLoop, setGameState} from "./game.js";

window.addEventListener('DOMContentLoaded', () => {
    initGame();
    setGameState("menu");
    requestAnimationFrame(gameLoop);
});