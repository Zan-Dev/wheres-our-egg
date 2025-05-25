// === game.js ===

import { update, draw } from './level.js';

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
