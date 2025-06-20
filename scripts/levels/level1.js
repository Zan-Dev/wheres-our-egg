import { Player1, Player2, Obstacles, longGround, box, egg, buttons, tutorial} from "../component.js";
import { keys, mouse, setGameState, togglePause, isPaused, InputKey } from "../game.js";
import { gameTimer } from "../timer.js";
import { unlockNextLevel } from "../levelManager.js";
import { gameAudio } from "../audio.js";

let lastTime = 0;
let levelWidth = 3000;
let time = 0;
let offsetX = 0;
const pause = buttons.buttonPause;
const jumpTutorial = tutorial.jumpTutorial;
const teksJump = tutorial.teksJump;
const teksWalk = tutorial.teksWalk;
const teksPick = tutorial.teksPick;
const teksPut = tutorial.teksPut;

let gameOver = false;
let finalTime = 0;

export function startTimer() {
    gameTimer.reset();
    gameTimer.start();
}

export function initLevel1() {
    lastTime = performance.now(); // Reset waktu
    gameTimer.reset();            // Reset timer
    gameTimer.start();            // Mulai timer
    gameOver = false;
    finalTime = 0;
    Egg.x = 2500;                 // Reset posisi egg juga
    gameAudio.play(true);
}

export function resetLevel() {
    Player1.reset({
        x: 200, y: 400,
        facing: 'right'
    });
    Player2.reset({
        x: 300, y: 400,
        facing: 'right'
    });
    gameAudio.play(true);

    Player2.carry = false;            // <- Reset state carry
    Player2.carryPressed = false;     // <- Reset tombol
    Player2.setAnimation('idle');

    Egg.x = 2500;
    Egg.y = 515;
    Egg.isCarried = false;
    Egg.scale = 5;

    // Reset posisi box
    Box.x = 2000;
    Box.y = 475;

    Box2.x = 2000;
    Box2.y = 183;

    // Reset properti lain jika ada
    wasKicking = false;
    wasCarrying = false;

    gameOver = false;
    finalTime = 0;
    gameTimer.reset();
    gameTimer.start();
}

let wasKicking = false;
let wasCarrying = false;

const Ground = new Obstacles({
    x: 0,
    y: 565,
    width: 2952,
    height: 121,
    type: 'static',
    scale: 0.5,
    obstacles: longGround,    
});

const Ground2 = new Obstacles({
    x: 1000,
    y: 565,
    width: 2952,
    height: 121,
    type: 'static',
    scale: 0.5,
    obstacles: longGround,    
});

const Ground3 = new Obstacles({
    x: 2000,
    y: 565,
    width: 2952,
    height: 121,
    type: 'static',
    scale: 0.5,
    obstacles: longGround,    
});

const Box = new Obstacles({
    x: 2000,
    y: 475,
    width: 184,
    height: 90,
    type: 'static',
    scale: 1,
    obstacles: box,  
    currentObstacle: "box"      
});

const Egg = new Obstacles({
    x: 2500,
    y: 515,
    width: 7,
    height: 10,
    type: 'static',
    scale: 5,
    obstacles: egg,  
    currentObstacle: "egg",
    isCarried: false
});

const Box2 = new Obstacles({
    x: 2000,
    y: 183,
    width: 184,
    height: 107,
    type: 'static',
    scale: 1,
    obstacles: box,  
    currentObstacle: "box"      
});

const obstacles = [Egg, Box2, Box, Ground, Ground2, Ground3, Player1, Player2];

export function drawLevel(ctx, timestamp){ 

    if (gameOver) {
        // gameOver = false;
        gameTimer.pause();
        gameTimer.reset();

        unlockNextLevel(0);

        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", ctx.canvas.width / 2, ctx.canvas.height / 2 - 60);


        const totalSeconds = Math.floor(finalTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeString = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;

        ctx.font = "30px 'Press Start 2P'";
        ctx.fillText(`Your Time ${timeString}`, ctx.canvas.width / 2, ctx.canvas.height / 2);


        const buttonX = ctx.canvas.width / 2 - 100;
        const buttonY = ctx.canvas.height / 2 + 50;
        const buttonWidth = 200;
        const buttonHeight = 50;


        ctx.fillStyle = mouse.x >= buttonX && mouse.x <= buttonX + buttonWidth &&
                        mouse.y >= buttonY && mouse.y <= buttonY + buttonHeight
                        ? "#555" : "#333";
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

        ctx.fillStyle = "white";
        ctx.font = "20px 'Press Start 2P'";
        ctx.fillText("Next", ctx.canvas.width / 2, buttonY + 32);
        
        if (mouse.clicked &&
            mouse.x >= buttonX && mouse.x <= buttonX + buttonWidth &&
            mouse.y >= buttonY && mouse.y <= buttonY + buttonHeight) {           
            mouse.clicked = false;
            resetLevel();
            setGameState("level");
        }

        return;
    }

    if (isPaused) {
        lastTime = timestamp;
    }
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#041423";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);    

    ctx.fillStyle = "white";
    ctx.font = "25px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText("Level 1", ctx.canvas.width / 2, 70);
    pause.draw(ctx);        
    teksJump.draw(ctx);

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
    
    if (Egg) {
        const playerBox = Player2.getBoundingBox();
        const eggBox = Egg.getBoundingBox(Egg.cameraX); 

        const horizontalDistance = Math.max(
            eggBox.x - (playerBox.x + playerBox.width), 
            playerBox.x - (eggBox.x + eggBox.width)
        );

        const verticalOverlap =
            playerBox.y + playerBox.height > eggBox.y &&
            playerBox.y < eggBox.y + eggBox.height;

        const isNearEgg = horizontalDistance <= 30 && verticalOverlap;
        Player2.nearEgg = isNearEgg;  

 
        if (Player2.carryPressed && !wasCarrying) {
            if (!Egg.isCarried && isNearEgg) {
   
                Egg.isCarried = true;
                Egg.scale = 0;     
                Egg.y = 2000;     
            } else if (Egg.isCarried) {
              
                Egg.isCarried = false;                
                const eggOffsetX = Player2.facing === 'right' ? 87 : -30;
                Egg.x = Player2.worldX + eggOffsetX;
                Egg.y = Player2.y - Egg.height + 50;                
                Egg.scale = 5;  
            }
        }
        wasCarrying = Player2.carryPressed;
    }

    const midX = (Player1.getCenterX() + Player2.getCenterX()) / 2;
    offsetX = Math.max(0, Math.min(midX - ctx.canvas.width / 2, levelWidth - ctx.canvas.width));
    
    teksWalk.update();
    jumpTutorial.update();
    teksJump.update();
    teksPick.update();
    teksPut.update();
    Player1.update("player1", keys["KeyA"], keys["KeyD"], keys["KeyW"], keys["KeyQ"], keys["KeyX"], keys["KeyL"], deltaTime, obstacles, levelWidth);
    Player2.update("player2", keys["ArrowLeft"], keys["ArrowRight"], keys["ArrowUp"], keys["KeyO"], keys["ArrowDown"], keys["KeyP"], deltaTime, obstacles, levelWidth);           

    // Check if player falls below longGround bottom
    const longGrounds = [Ground, Ground2, Ground3];
    for (const ground of longGrounds) {
        const groundBox = ground.getBoundingBox();
        const groundBottom = groundBox.y + groundBox.height;

        const player1Box = Player1.getBoundingBox();
        const player1Bottom = player1Box.y + player1Box.height;

        const player2Box = Player2.getBoundingBox();
        const player2Bottom = player2Box.y + player2Box.height;

        if (player1Bottom > groundBottom || player2Bottom > groundBottom) {
            setGameState("gameOver");  
            console.log("Game over");
            gameOver = true;
            finalTime = gameTimer.elapsedTime;
            gameTimer.pause();
            resetLevel();
            break;
        }
    }

    Ground.update(deltaTime, Player1, Player2, offsetX);  
    Ground2.update(deltaTime, Player1, Player2, offsetX);  
    Ground3.update(deltaTime, Player1, Player2, offsetX); 
    Box.update(deltaTime, Player1, Player2, offsetX);
    Box2.update(deltaTime, Player1, Player2, offsetX);
    Egg.update(deltaTime, Player1, Player2, offsetX);        
    if (!isPaused) {
        gameTimer.update(deltaTime);
    }
    
    teksPick.draw(ctx, offsetX);
    teksWalk.draw(ctx, offsetX);
    jumpTutorial.draw(ctx, offsetX);
    teksJump.draw(ctx, offsetX);
    teksPut.draw(ctx, offsetX);

    Player1.draw(ctx, offsetX);
    Player2.draw(ctx, offsetX);
    Ground.draw(ctx, offsetX); 
    Ground2.draw(ctx, offsetX); 
    Ground3.draw(ctx, offsetX); 
    Box.draw(ctx, offsetX);
    Box2.draw(ctx, offsetX);
    if (!Egg.isCarried) {
        Egg.draw(ctx, offsetX);  
    }

    gameTimer.draw(ctx, offsetX);    

    if (Egg.x >= 0 && Egg.x <= 400) {
        gameOver = true;
        finalTime = gameTimer.elapsedTime;
        gameTimer.pause();
        console.log("Game Over! Your Time:", finalTime);
        Egg.x = 2500;
        gameTimer.reset();
    }

    if (pause.isMouseOver(mouse.x, mouse.y) && mouse.clicked) {
        mouse.clicked = false;        
        gameTimer.running = false;
        console.log(isPaused);
        togglePause();
        return;
    }    
   
}

export function updateLevel(ctx){    
}
