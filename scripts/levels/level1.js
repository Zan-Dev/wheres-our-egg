import { Player1, Player2, Ground, Box} from "../component.js";
import { keys } from "../game.js";

let lastTime = 0;
let levelWidth = 3000;
let time = 0;
let offsetX = 0;
const obstacles = [Box, Ground, Player1, Player2];


export function drawLevel(ctx, timestamp){ 
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#041423";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);    

    const opacity = 0.5 + Math.sin(time) * 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.font = "15px 'Press Start 2P'";    
    time += 0.05;    

    const distance = Math.abs(Player1.getCenterX() - Player2.getCenterX());
    const maxDistance = 500;
    if (distance > maxDistance) {
        if (Player1.getCenterX() < Player2.getCenterX()) {
            if (keys["ArrowRight"]) keys["ArrowRight"] = false;
            if (keys["KeyA"]) keys["KeyA"] = false;
        } else {
            if (keys["ArrowLeft"]) keys["ArrowLeft"] = false;
            if (keys["KeyD"]) keys["KeyD"] = false;
        }
    }
    
    // Calculate cameraX based on the selected player to follow
    // const cameraX = (Player1.getCenterX() + Player2.getCenterX()) / 2;
    // let offsetX = cameraX - ctx.canvas.width / 2;
    // offsetX = Math.max(0, Math.min(offsetX, levelWidth - ctx.canvas.width));    

    const midX = (Player1.getCenterX() + Player2.getCenterX()) / 2;
    offsetX = Math.max(0, Math.min(midX - ctx.canvas.width / 2, levelWidth - ctx.canvas.width));
    // console.log("offsetX", offsetX, "ground.cameraX", Ground.cameraX);
    console.log("offsetX:", offsetX, "Ground.x:", Ground.x, "Draw Pos:", Ground.x - offsetX);


    Player1.update("player1", keys["KeyA"], keys["KeyD"], keys["KeyW"], keys["KeyQ"], keys["KeyX"], keys["KeyL"], deltaTime, obstacles, levelWidth);
    Player2.update("player2", keys["ArrowLeft"], keys["ArrowRight"], keys["ArrowUp"], keys["KeyO"], keys["ArrowDown"], keys["KeyP"], deltaTime, obstacles, levelWidth);           
    Ground.update(deltaTime, Player1, Player2, offsetX);  
    Box.update(deltaTime, Player1, Player2, offsetX);
    
    Player1.draw(ctx, offsetX);
    Player2.draw(ctx, offsetX);
    Ground.draw(ctx, offsetX); 
    Box.draw(ctx, offsetX);
    ctx.fillText("press SPACE to start", offsetX, 501);

}

export function updateLevel(ctx){    
}
