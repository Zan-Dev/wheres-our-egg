import { setGameState, keys, InputKey } from "./game.js";
import { Buttons, buttons, getButtons, playerSkin } from "./component.js";

let lastTime = 0;
let time = 0;
const animDuration = 300;
let isMouseDown;
let canvas = document.getElementById("board");
const buttonNext = buttons.buttonNext;
const buttonA = buttons.buttonA;
const buttonD = buttons.buttonD;
const buttonRight = buttons.buttonRight;
const buttonLeft = buttons.buttonLeft;
let backgroundLoaded = false;
const background = new Image();
background.src = 'assets/images/world-1.png';
background.onload = () => {
  backgroundLoaded = true;
};


export function mainMenu(ctx){
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#041423";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "30px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText("WHERE'S OUR EGG ?", ctx.canvas.width / 2, 300);

    const opacity = 0.5 + Math.sin(time) * 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.font = "15px 'Press Start 2P'";
    ctx.fillText("press SPACE to start", ctx.canvas.width / 2, 350);
    time += 0.05;
}
export function updateMainMenu() { 
  if (InputKey("Space")) {
    setGameState("character");            
  }        
}

function loadSkins(ctx, deltaTime, timestamp) {
  playerSkin.forEach((player, idx) => {
    const centerX = player.x;
    const centerY = 300;
    const offsetX = 180;

    const prevIndex = (player.index - 1 + player.skins.length) % player.skins.length;
    const nextIndex = (player.index + 1) % player.skins.length;

    const progress = updateSkinAnimation(player, timestamp);

    const lerp = (a, b) => a + (b - a) * progress;

    let prevX = centerX - offsetX,
        currX = centerX,
        nextX = centerX + offsetX;
    let prevS = 0.6, currS = 1, nextS = 0.6;
    let prevO = 0.3, currO = 1, nextO = 0.3;

    if (player.animating) {
      if (player.animationDir === "left") {
        prevX = lerp(centerX - offsetX, centerX);
        currX = lerp(centerX, centerX + offsetX);
        nextX = lerp(centerX + offsetX, centerX - 1 * offsetX + 300);
        prevS = lerp(0.6, 1);
        currS = lerp(1, 0.6);
        prevO = lerp(0.3, 1);
        currO = lerp(1, 0.3);
      } else {
        nextX = lerp(centerX + offsetX, centerX);
        currX = lerp(centerX, centerX - offsetX);
        prevX = lerp(centerX - offsetX, centerX + 1 * offsetX - 300);
        nextS = lerp(0.6, 1);
        currS = lerp(1, 0.6);
        nextO = lerp(0.3, 1);
        currO = lerp(1, 0.3);
      }
    }

    function drawSkin(skin, x, y, scale, opacity) {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.imageSmoothingEnabled = false;
      skin.update(deltaTime);
      const w = skin.scaleWidth * scale;
      const h = skin.scaleHeight * scale;
      const drawX = x - w / 2;
      const drawY = y - h / 2;
      ctx.drawImage(
        skin.image,
        skin.frameIndex * skin.frameWidth,
        0,
        skin.frameWidth, skin.frameHeight,
        drawX, drawY,
        w, h
      );
      ctx.restore();
    }

    drawSkin(player.skins[prevIndex], prevX, centerY, prevS, prevO);
    drawSkin(player.skins[player.index], currX, centerY, currS, currO);
    drawSkin(player.skins[nextIndex], nextX, centerY, nextS, nextO);

    ctx.fillStyle = "#fff";
    ctx.font = "30px 'Press Start 2P'";
    ctx.fillText(player.skins[player.index].name, centerX, centerY - 120);
  });
}

export function characterSelect(ctx, timestamp){
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#041423";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "25px 'Press Start 2P'";
    ctx.fillText("CHOOSE YOUR SKIN", ctx.canvas.width / 2, 100);   

    loadSkins(ctx, deltaTime, timestamp);         

    buttonA.draw(ctx);
    buttonD.draw(ctx);
    buttonRight.draw(ctx);
    buttonLeft.draw(ctx);    
    buttonNext.draw(ctx);      
}

export function triggerNextSkin(playerIndex) {
  const player = playerSkin[playerIndex];
  if (!player.animating) {
    player.animating = true;
    player.animationDir = "left";
    player.animStart = performance.now();
  }
}

export function triggerPrevSkin(playerIndex) {
  const player = playerSkin[playerIndex];
  if (!player.animating) {
    player.animating = true;
    player.animationDir = "right";
    player.animStart = performance.now();
  }
}

function updateSkinAnimation(player, timestamp) {
  const skinCount = player.skins.length;

  let progress = 0;
  if (player.animating) {
    const elapsed = timestamp - player.animStart;
    progress = Math.min(elapsed / animDuration, 1);

    if (progress === 1) {
      player.animating = false;
      if (player.animationDir === "left") {
        player.index = (player.index + 1) % skinCount;
      } else if (player.animationDir === "right") {
        player.index = (player.index - 1 + skinCount) % skinCount;
      }
    }
  }

  return progress;
}

export function updateCharacter(ctx, canvas){   
  if (InputKey("Space")) {
    setGameState("level");               
  }
  if (InputKey("KeyD")){
    triggerNextSkin(0);    
  }
  if (InputKey("KeyA")) triggerPrevSkin(0);
  if (InputKey("ArrowRight")) triggerNextSkin(1);
  if (InputKey("ArrowLeft")) triggerPrevSkin(1);  
}

export function levelSelect(ctx){    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);    
    if (backgroundLoaded) {
      ctx.drawImage(background, 0, 0, ctx.canvas.width, ctx.canvas.height);
    } else {
      // Fallback jika gambar belum dimuat
      ctx.fillStyle = "#000"; // warna default sementara
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "25px 'Press Start 2P'";
    ctx.fillText("CHOOSE LEVEL", ctx.canvas.width / 2, 100);   

    for (let i=0; i<8; i++){
      let level = buttons.buttonLevels[i];
      level.draw(ctx);
    }    
}

export function updateLevel(){
  // Untuk Animasi
}
