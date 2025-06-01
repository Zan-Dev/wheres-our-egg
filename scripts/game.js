import {   
            mainMenu, updateMainMenu, 
            characterSelect, updateCharacter,
            triggerNextSkin, triggerPrevSkin,
            levelSelect, updateLevel

        } from "./ui.js";

import { buttons, getButtons } from "./component.js";
import { levelStatus } from "./levelManager.js";
import { levelHandlers } from "./levels/indexLevel.js";
import { gameTimer } from "./timer.js";
import { gameAudio } from "./audio.js";
import { initLevel1, resetLevel as resetLevel1 } from "./levels/level1.js";
import { initLevel2, resetLevel as resetLevel2 } from "./levels/level2.js";
import { initLevel3, resetLevel as resetLevel3 } from "./levels/level3.js";
import { initLevel4, resetLevel as resetLevel4 } from "./levels/level4.js";
import { initLevel5, resetLevel as resetLevel5 } from "./levels/level5.js";
import { initLevel6, resetLevel as resetLevel6 } from "./levels/level6.js";
import { initLevel7, resetLevel as resetLevel7 } from "./levels/level7.js";
import { initLevel8, resetLevel as resetLevel8 } from "./levels/level8.js";


const levelInitializers = {
  1: initLevel1,
  2: initLevel2,
  3: initLevel3,
  4: initLevel4,
  5: initLevel5,
  6: initLevel6,
  7: initLevel7,
  8: initLevel8,
};

const levelResetters = {
  1: resetLevel1,
  2: resetLevel2,
  3: resetLevel3,
  4: resetLevel4,
  5: resetLevel5,
  6: resetLevel6,
  7: resetLevel7,
  8: resetLevel8,
};

let isMouseDown = true;
let canvas, ctx;
let gameState = "menu";
const resume = buttons.buttonResume;
export let isPaused = false;
export let previousLevelState = "menu";
export const keys = {};
export const mouse = {
    x: 0,
    y: 0,
    down: false,
    clicked: false
};

export function initInput(canvas) {
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
  });

  window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });

  canvas.addEventListener('mouseup', (e) => {
    mouse.down = false;
    mouse.clicked = true;
  });

  canvas.addEventListener('mousedown', (e) => {
    mouse.down = true;
  });

  canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
  });

  canvas.addEventListener('click', (e) => {
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
    handleMouseClick(mouse.x, mouse.y);
  });
}

function handleMouseClick(x, y) {
    const handler = gameStateHandlers[gameState];
    if (handler && handler.onClick) {
        handler.onClick(x, y);
    }
}

export function InputKey(code) {
    if (keys[code]) {
      keys[code] = false;
      return true;
    }
    return false;
}

const gameStateHandlers = {
    menu: {
        update: updateMainMenu,
        draw: mainMenu,    
        onClick: null,   
    },
    character: {
        update: (ctx, canvas) => updateCharacter(ctx, canvas),
        draw: (ctx, timestamp) => characterSelect(ctx, timestamp),
        onClick: handleSkinClick
    },
    level: {
        update: (ctx, canvas) => updateLevel(ctx, canvas),
        draw: levelSelect,    
        onClick: handleLevelClick        
    },  
    pause: {
        update: () => {},
        draw: drawPauseScreen,
        onClick: handlePauseClick
    }, 
    ...Object.entries(levelHandlers).reduce((acc, [name, handler]) => {
        acc[name] = {
          update: (ctx) => handler.updateLevel(ctx) || (() => {}),
          draw: (ctx, deltaTime) => handler.drawLevel(ctx, deltaTime) || (() => {}),
        };
        return acc;
      }, {}),  
};

export function handleLevelClick(mouseX, mouseY) {
    for (let i = 0; i < buttons.buttonLevels.length; i++) {        
        if (!levelStatus[i].unlocked) continue;
        const level = buttons.buttonLevels[i];
        level.update(mouseX, mouseY, true);        
        if(levelStatus[i].unlocked){
            if (level.clicked) {
                buttons.buttonLevels[i].update(mouseX, mouseY, isMouseDown);
                setGameState(`level${i + 1}`);                
                levelInitializers[i+1]();
                console.log("clicked");             
                console.log(`Level ${i + 1} clicked!`);        
            }
        }      
    }
}

export function handleSkinClick(mouseX, mouseY) {    
    getButtons("buttonA").update(mouseX, mouseY, isMouseDown);
    if (getButtons("buttonD").isMouseOver(mouseX,mouseY)){
        triggerNextSkin(0);
        console.log("ASIK");
    } 
    if (getButtons("buttonA").isMouseOver(mouseX,mouseY)) triggerPrevSkin(0);
    if (getButtons("buttonRight").isMouseOver(mouseX, mouseY)) triggerNextSkin(1);
    if (getButtons("buttonLeft").isMouseOver(mouseX,mouseY)) triggerPrevSkin(1);
    if (getButtons("buttonNext").isMouseOver(mouseX,mouseY)) setGameState("level");
}

export function handlePauseClick(x, y) {    
    if (resume.isMouseOver(x, y)) {
        isPaused = false;
        setGameState(previousLevelState);        
        gameTimer.start(); // Pastikan timer dilanjutkan
        return;
    }
    
    // Tombol Kembali ke Pilihan Level
    const backButtonX = ctx.canvas.width / 2 - 150;
    const backButtonY = ctx.canvas.height / 2 + 60;
    const backButtonWidth = 120;
    const backButtonHeight = 40;
    
    if (x >= backButtonX && x <= backButtonX + backButtonWidth &&
        y >= backButtonY && y <= backButtonY + backButtonHeight) {
        isPaused = false;
        
        // Reset level yang sedang aktif sebelum kembali ke menu
        if (previousLevelState.startsWith('level')) {
            const levelNumber = parseInt(previousLevelState.replace('level', ''));
            if (levelResetters[levelNumber]) {
                levelResetters[levelNumber](); // Reset posisi dan objek
            }
        }
        
        gameTimer.reset(); // Reset timer
        setGameState("level");
        return;
    }
    
    // Tombol Restart
    const restartButtonX = ctx.canvas.width / 2 + 30;
    const restartButtonY = ctx.canvas.height / 2 + 60;
    const restartButtonWidth = 120;
    const restartButtonHeight = 40;
    
    if (x >= restartButtonX && x <= restartButtonX + restartButtonWidth &&
        y >= restartButtonY && y <= restartButtonY + restartButtonHeight) {
        isPaused = false;
        
        // Restart level yang sedang aktif
        if (previousLevelState.startsWith('level')) {
            const levelNumber = parseInt(previousLevelState.replace('level', ''));
            if (levelResetters[levelNumber]) {
                levelResetters[levelNumber](); // Panggil fungsi reset khusus
            }
        }
        
        setGameState(previousLevelState);
        return;
    }        
}

export function togglePause() {
     if (!isPaused) {
        setPreviousLevelState(gameState);
        setGameState("pause");
        gameTimer.pause();
        console.log("Pause ON, isPaused:", isPaused);
        gameAudio.pause();
        isPaused = true;
    } else {
        console.log("Pause OFF, isPaused:", isPaused);
        isPaused = false;
        setGameState(previousLevelState);
         gameAudio.play(true);
        gameTimer.start();
    }
}

export function setPreviousLevelState(state) {
    previousLevelState = state;
}

function drawPauseScreen(ctx) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Title
    ctx.fillStyle = "white";
    ctx.font = "30px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText("Game Paused", ctx.canvas.width / 2, ctx.canvas.height / 2 - 80);

    // Tombol Resume
    resume.draw(ctx);

    if (resume.isMouseOver(mouse.x, mouse.y) && mouse.clicked) {        
        isPaused = false;
        setGameState(previousLevelState);
        gameTimer.start(); // Pastikan timer dilanjutkan
        gameAudio.play(true);
        mouse.clicked = false;  
        return;          
    }

    // Tombol Kembali ke Pilihan Level
    const backButtonX = ctx.canvas.width / 2 - 150;
    const backButtonY = ctx.canvas.height / 2 + 60;
    const backButtonWidth = 160;
    const backButtonHeight = 40;
    
    ctx.fillStyle = mouse.x >= backButtonX && mouse.x <= backButtonX + backButtonWidth &&
                    mouse.y >= backButtonY && mouse.y <= backButtonY + backButtonHeight
                    ? "#555" : "#333";
    ctx.fillRect(backButtonX, backButtonY, backButtonWidth, backButtonHeight);
    
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(backButtonX, backButtonY, backButtonWidth, backButtonHeight);
    
    ctx.fillStyle = "white";
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillText("Select Level", backButtonX + backButtonWidth / 2, backButtonY + 25);

    // Tombol Restart
    const restartButtonX = ctx.canvas.width / 2 + 30;
    const restartButtonY = ctx.canvas.height / 2 + 60;
    const restartButtonWidth = 120;
    const restartButtonHeight = 40;
    
    ctx.fillStyle = mouse.x >= restartButtonX && mouse.x <= restartButtonX + restartButtonWidth &&
                    mouse.y >= restartButtonY && mouse.y <= restartButtonY + restartButtonHeight
                    ? "#555" : "#333";
    ctx.fillRect(restartButtonX, restartButtonY, restartButtonWidth, restartButtonHeight);
    
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(restartButtonX, restartButtonY, restartButtonWidth, restartButtonHeight);
    
    ctx.fillStyle = "white";
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillText("Restart", restartButtonX + restartButtonWidth / 2, restartButtonY + 25);

    // Handle mouse clicks
    if (mouse.clicked) {
        handlePauseClick(mouse.x, mouse.y);
        mouse.clicked = false;
    }
}

export function initGame() {
    canvas = document.getElementById("board");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    initInput(canvas);
}

export function setGameState(state) {
    gameState = state;
}

function update() {
    const handler = gameStateHandlers[gameState];
    if (handler && handler.update) {
        handler.update(ctx, canvas);
    }
}

function draw(timestamp) {    
    const handler = gameStateHandlers[gameState];    
    if (handler && handler.draw) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        handler.draw(ctx, timestamp);
    }
    mouse.clicked = false;
}

export function gameLoop(timestamp) {
    update();
    draw(timestamp);
    requestAnimationFrame(gameLoop);
}