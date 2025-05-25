import { Player } from './player.js';
import { Ground } from './ground.js';

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

const keys = {};
const levelWidth = 3000;

const groundImage = new Image();
groundImage.src = 'longGround.png';

const player1 = new Player(100, 300, 'blue', { left: 'a', right: 'd' });
const player2 = new Player(200, 300, 'red', { left: 'ArrowLeft', right: 'ArrowRight' });

let ground;
groundImage.onload = () => {
  ground = new Ground(groundImage, canvas.width, 360);
  requestAnimationFrame(gameLoop);
};

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player1.update(keys, levelWidth);
  player2.update(keys, levelWidth);

  // Calculate center point between players
  const centerX = (player1.getCenter() + player2.getCenter()) / 2;
  let offsetX = centerX - canvas.width / 2;
  offsetX = Math.max(0, Math.min(offsetX, levelWidth - canvas.width));


  ground.update(offsetX);
  ground.draw(ctx);

  player1.draw(ctx, offsetX);
  player2.draw(ctx, offsetX);

  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);