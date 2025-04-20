import {   
            mainMenu, updateMainMenu, 
            characterSelect, updateCharacter,
            levelSelect, updateLevel

        } from "./ui.js";

let canvas, ctx;
let gameState = "menu";

export function initGame() {
    canvas = document.getElementById("board");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

export function setGameState(state) {
    gameState = state;
}

function update() {
    switch (gameState) {
      case "menu": updateMainMenu(); break;   
      case "character": updateCharacter(ctx, canvas); break;
      case "level": updateLevel(); break;
    }
}
  
function draw(timestamp) {    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    switch (gameState) {
      case "menu": mainMenu(ctx); break;   
      case "character": characterSelect(ctx, timestamp); break;
      case "level": levelSelect(ctx); break;
    }
}
  
export function gameLoop(timestamp) {
    update();
    draw(timestamp);
    requestAnimationFrame(gameLoop);
}