// === level.js ===

import { Player, Ground } from './component.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;

const keys = {};
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

const player1 = new Player(100, "red", "a", "d");
const player2 = new Player(300, "blue", "ArrowLeft", "ArrowRight");

const groundImg = new Image();
groundImg.src = "ground.png"; // gunakan gambar ground sederhana
const ground = new Ground(groundImg, 1600);

let cameraX = 0;
const maxDistance = 400;

function update() {
    player1.update(keys);
    player2.update(keys);

    // Batas jarak antar player
    let dist = Math.abs(player1.worldX - player2.worldX);
    if (dist > maxDistance) {
        if (player1.worldX < player2.worldX) player2.worldX = player1.worldX + maxDistance;
        else player1.worldX = player2.worldX + maxDistance;
    }

    // Update camera agar mengikuti tengah antara dua player
    const midpoint = (player1.worldX + player2.worldX) / 2;
    cameraX = midpoint - canvas.width / 2;

    // Clamp kamera
    cameraX = Math.max(0, Math.min(cameraX, ground.repeatWidth - canvas.width));

    // Hitung posisi player di layar
    player1.screenX = player1.worldX - cameraX;
    player2.screenX = player2.worldX - cameraX;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ground.draw(ctx, cameraX, canvas.width);
    player1.draw(ctx);
    player2.draw(ctx);
}

export { update, draw };
