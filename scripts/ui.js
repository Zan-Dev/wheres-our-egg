import { setGameState } from "./game.js";
import { getButtons, players } from "./component.js";

let activeSkinIndex = 0;
let isMouseDown = false;
let lastTime = 0;
let time = 0;
const skins = players; 
const buttonNext = getButtons("buttonNext");
const buttonA = getButtons("buttonA");
const buttonD = getButtons("buttonD");
const buttonRight = getButtons("buttonRight");
const buttonLeft = getButtons("buttonLeft");

export function mainMenu(ctx){
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#041423";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "30px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText("WHERE'S OUR EGGS ?", ctx.canvas.width / 2, 300);

    const opacity = 0.5 + Math.sin(time) * 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.font = "15px 'Press Start 2P'";
    ctx.fillText("press SPACE to start", ctx.canvas.width / 2, 350);
    time += 0.05;
}

let menuHandled = false;
export function updateMainMenu() {
    if (!menuHandled) {
        document.addEventListener("keydown", function(e){
          if (e.code === "Space") {
            setGameState("character");            
          }
        }, { once: true });
        menuHandled = true;
      }
}

function loadSkins(ctx, deltaTime) {
  players.forEach(player => {
      const skin = player.skins[player.index];
      ctx.imageSmoothingEnabled = false;
      skin.update(deltaTime);
      skin.draw(ctx);      
      ctx.fillText(skin.name, skin.x + 100, skin.y + 10);
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

    loadSkins(ctx, deltaTime);        

    buttonA.draw(ctx);
    buttonD.draw(ctx);
    buttonRight.draw(ctx);
    buttonLeft.draw(ctx);    
    buttonNext.draw(ctx);  
}

function nextSkin(index) {    
    players[index].index = (players[index].index + 1) % players[index].skins.length;
}
  
function previousSkin(index) {
    players[index].index = (players[index].index - 1 + players[index].skins.length) % players[index].skins.length;
}

let charHandled = false;
export function updateCharacter(ctx, canvas){
    if (!charHandled) {
        document.addEventListener("keydown", function(e){
          if (e.code === "Space") {
            // setGameState("character");
            console.log(1%2);
            const deltaTime = 16.67;
            skins.forEach(char => char.update(deltaTime));
          }

          if (e.code === "KeyD") nextSkin(0);
          if (e.code === "KeyA") previousSkin(0);
          if (e.code === "ArrowRight") nextSkin(1);
          if (e.code === "ArrowLeft") previousSkin(1);
        });
        charHandled = true;
    }

    canvas.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (buttonD.isMouseOver(mouseX,mouseY)) nextSkin(0);
      if (buttonA.isMouseOver(mouseX,mouseY)) previousSkin(0);
      if (buttonRight.isMouseOver(mouseX, mouseY)) nextSkin(1);
      if (buttonLeft.isMouseOver(mouseX,mouseY)) previousSkin(1);
      if (buttonNext.isMouseOver(mouseX,mouseY)) console.log("Play");               
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
  
      // if (buttonNext.isMouseOver(mouseX, mouseY)) {
      //     console.log("Mouse di atas tombol kiri");
      // }
    });
}