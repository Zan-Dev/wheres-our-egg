import { setGameState } from "./game.js";
import { getSkins } from "./component.js";

let time = 0;
let buttonNext = new Image();
const skins = getSkins();
buttonNext.src = "assets/images/button-next.png"
const buttonNextRect = {
    x: 0,
    y: 0,
    width: 100,
    height: 40
  };

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
            console.log("Character Select");
          }
        }, { once: true });
        menuHandled = true;
      }
}

export function characterSelect(ctx){
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#041423";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "25px 'Press Start 2P'";
    ctx.fillText("CHOOSE YOUR SKIN", ctx.canvas.width / 2, 100);
   
    skins.forEach((skin, index) => {
        ctx.drawImage(skin.image, 100 + index * 300, 150, 100, 100);
        ctx.fillText(skin.name, 100 + index * 300, 270);
    });

    buttonNextRect.x = ctx.canvas.width / 2 - 50;
    buttonNextRect.y = 540;

    ctx.drawImage(buttonNext, buttonNextRect.x, buttonNextRect.y, buttonNextRect.width, buttonNextRect.height);
}

let isHover = false;
let charHandled = false;
export function updateCharacter(ctx, canvas){
    if (!charHandled) {
        document.addEventListener("keydown", function(e){
          if (e.code === "Space") {
            // setGameState("character");
            console.log("Select Level");
          }
        }, { once: true });
        charHandled = true;
    }

    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
      
        isHover =
          mouseX >= buttonNextRect.x &&
          mouseX <= buttonNextRect.x + buttonNextRect.width &&
          mouseY >= buttonNextRect.y &&
          mouseY <= buttonNextRect.y + buttonNextRect.height;
    });
}