import { Player1, Player2 } from "../component.js";
import { keys } from "../game.js";

let lastTime = 0;
let time = 0;
let cameraX = 0;

export function drawLevel(ctx, timestamp){ 
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#041423";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);    

    const opacity = 0.5 + Math.sin(time) * 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.font = "15px 'Press Start 2P'";
    ctx.fillText("press SPACE to start", ctx.canvas.width / 2, 350);
    time += 0.05;
    
    Player1.update(keys["ArrowLeft"], keys["ArrowRight"], deltaTime);
    Player2.update(keys["KeyA"], keys["KeyD"], deltaTime);       
    console.log("A:", keys["KeyA"], "D:", keys["KeyD"]);

    Player1.draw(ctx, cameraX);
    Player2.draw(ctx, cameraX); 

}

export function updateLevel(ctx, canvas){
    
}