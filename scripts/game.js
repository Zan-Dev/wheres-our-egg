import {   
            mainMenu, updateMainMenu, 
            characterSelect, updateCharacter,
            triggerNextSkin, triggerPrevSkin,
            levelSelect, updateLevel

        } from "./ui.js";

import { buttons, getButtons } from "./component.js";
import { levelStatus } from "./levelManager.js";
import { levelHandlers } from "./levels/indexLevel.js";

let isMouseDown = true;
let canvas, ctx;
let gameState = "menu";
export const keys = {};
export const mouse = {
  x: 0,
  y: 0,
  down: false
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
    ...Object.entries(levelHandlers).reduce((acc, [name, handler]) => {
        acc[name] = {
          update: handler.updateLevel || (() => {}),
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
}

export function gameLoop(timestamp) {
    update();
    draw(timestamp);
    requestAnimationFrame(gameLoop);
}