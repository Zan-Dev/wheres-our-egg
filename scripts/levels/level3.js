import { Player1, Player2, Obstacles, longGround, box, lever, egg, buttons, tutorial, bridge} from "../component.js";
import { keys, mouse, setGameState, togglePause, toggleRestart } from "../game.js";
import { gameTimer } from "../timer.js";
import { unlockNextLevel } from "../levelManager.js";

let lastTime = 0;
let levelWidth = 3000;
let time = 0;
let offsetX = 0;
const pause = buttons.buttonPause;

export let gameOver = false;
let finalTime = 0;
const crouchTutorial = tutorial.crouchTutorial;
const teksCrouch = tutorial.teksCrouch;

// Animation Lever
let boxAnimations = new Map();

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function startBoxAnimation(boxObject, targetX) {
    console.log(`Starting animation for box at ${boxObject.x} to ${targetX}`);
    
    boxAnimations.set(boxObject, {
        isAnimating: true,
        startX: boxObject.x,
        targetX: targetX,
        currentTime: 0,
        duration: 1000,
        easeType: 'easeInOutQuad'
    });
}
/////

export function startTimer() {
    gameTimer.reset();
    gameTimer.start();
}

export function initLevel3() {
    lastTime = performance.now(); // Reset waktu
    gameTimer.reset();            // Reset timer
    gameTimer.start();            // Mulai timer
    gameOver = false;
    finalTime = 0;
    Egg.x = 2500;                 // Reset posisi egg juga
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

    Player2.carry = false;            // <- Reset state carry
    Player2.carryPressed = false;     // <- Reset tombol
    Player2.setAnimation('idle');

    Egg.x = 2500;
    Egg.y = 515;
    Egg.isCarried = false;
    Egg.scale = 5;        

    Lever.isActive = false;
    Lever.setAnimationFrame(0);

    // Reset posisi box
    Box.x = Box.originalX;
    Box.y = Box.originalY || 390;
    Box.animationState = 'idle';

    Box2.x = Box2.originalX;
    Box2.y = Box2.originalY || 283;
    Box.animationState = 'idle';
    
    Bridge.x = Bridge.originalX;
    Bridge.y = Bridge.originalY || 565;
    Bridge.animationState = 'idle';

    boxAnimations.clear();
    // Reset properti lain jika ada
    wasKicking = false;
    wasCarrying = false;

    gameOver = false;
    finalTime = 0;
    gameTimer.reset();
    gameTimer.start();
}

const Bridge = new Obstacles({
    x: 1500,
    y: 565,
    width: 541,
    height: 38,
    type: 'static',
    scale: 0.5,
    obstacles: bridge,
    currentObstacle: "bridge",
    originalX: 1500,
    originalY: 565,
    animationState: 'idle'
});

const Lever = new Obstacles({
    x: 1600,
    y: 525,
    width: 184,
    height: 107,
    type: 'sprite',
    scale: 0.4,
    obstacles: lever,  
    currentObstacle: "lever",
    frameCount: 2,
    frameInterval: 3000,
    isActive: false, 
});

let wasKicking = false;
let wasCarrying = false;

const Ground = new Obstacles({
    x: 0,
    y: 565,
    width: 2500,
    height: 121,
    type: 'static',
    scale: 0.5,
    obstacles: longGround,
    // repeatX: true,
    // repeatWidth: 1000
});

const Ground2 = new Obstacles({
    x: 1500,
    y: 565,
    width: 3000,
    height: 121,
    type: 'static',
    scale: 0.5,
    obstacles: longGround,
    // repeatX: true,
    // repeatWidth: 1000
});

const Box = new Obstacles({
    x: 700,
    y: 390,
    width: 184,
    height: 107,
    type: 'static',
    scale: 1,
    obstacles: box,  
    currentObstacle: "box",   
    originalX: 700,
    originalY: 390,
    animationState: 'idle'  
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
    x: 700,
    y: 283,
    width: 184,
    height: 107,
    type: 'static',
    scale: 1,
    obstacles: box,  
    currentObstacle: "box",
    originalX: 700,
    originalY: 283,
    animationState: 'idle'      
});



const obstacles = [Egg, Lever, Bridge, Box, Ground, Ground2, Player1, Player2];

export function drawLevel(ctx, timestamp){ 
    // console.log("Paused?", isPaused);

    if (gameOver) {
        // gameOver = false;
        gameTimer.pause();
        gameTimer.reset();

        unlockNextLevel(2);

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

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#041423";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);    

    ctx.fillStyle = "white";
    ctx.font = "25px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText("Level 3", ctx.canvas.width / 2, 70);
    pause.draw(ctx);

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
    
    const leverObstacle = obstacles.find(o => o.currentObstacle === 'lever');    

    if (leverObstacle) {
        const playerBox = Player1.getBoundingBox();
        const leverBox = leverObstacle.getBoundingBox(leverObstacle.cameraX); 

        const horizontalDistance = Math.max(
            leverBox.x - (playerBox.x + playerBox.width), // Player kiri → Lever kanan
            playerBox.x - (leverBox.x + leverBox.width)   // Player kanan → Lever kiri
        );

        const verticalOverlap =
            playerBox.y + playerBox.height > leverBox.y &&
            playerBox.y < leverBox.y + leverBox.height;

        const isNearLever = horizontalDistance <= 15 && verticalOverlap;
        
        if (Player1.kick && isNearLever && !wasKicking) {
            leverObstacle.isActive = !leverObstacle.isActive;
        
            // Mulai animasi box
            if (leverObstacle.isActive) {                
                // startBoxAnimation(Box2, Box2.originalX + 200);                
                // Box2.animationState = 'moving_right';
                startBoxAnimation(Bridge, Bridge.originalX - 250);                
                Bridge.animationState = 'moving_left';
            } else {                
                // startBoxAnimation(Box2, Box2.originalX);
                // Box2.animationState = 'moving_left';    
                startBoxAnimation(Bridge, Bridge.originalX);
                Bridge.animationState = 'moving_right';                         
            }
        }
        wasKicking = Player1.kick;        
        
        if (leverObstacle.isActive) {
            leverObstacle.setAnimationFrame(1); // Frame ke-2, lever aktif            
        } else {
            leverObstacle.setAnimationFrame(0); // Frame ke-1, lever nonaktif
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

    updateAllBoxAnimations(deltaTime);
    const midX = (Player1.getCenterX() + Player2.getCenterX()) / 2;
    offsetX = Math.max(0, Math.min(midX - ctx.canvas.width / 2, levelWidth - ctx.canvas.width));

    const longGrounds = [Ground, Ground2];
    for (const ground of longGrounds) {
        const groundBox = ground.getBoundingBox();
        const groundBottom = groundBox.y + groundBox.height;

        const player1Box = Player1.getBoundingBox();
        const player1Bottom = player1Box.y + player1Box.height;

        const player2Box = Player2.getBoundingBox();
        const player2Bottom = player2Box.y + player2Box.height;

        if (player1Bottom > groundBottom || player2Bottom > groundBottom) {
            toggleRestart();
            setGameState("gameOver");  
            console.log("Game over");
            gameOver = true;
            // finalTime = gameTimer.elapsedTime;
            // gameTimer.pause();
            resetLevel();
            break;
        }
    }

    Player1.update("player1", keys["KeyA"], keys["KeyD"], keys["KeyW"], keys["KeyQ"], keys["KeyX"], keys["KeyL"], deltaTime, obstacles, levelWidth);
    Player2.update("player2", keys["ArrowLeft"], keys["ArrowRight"], keys["ArrowUp"], keys["KeyO"], keys["ArrowDown"], keys["KeyP"], deltaTime, obstacles, levelWidth);           
    Bridge.update(deltaTime, Player1, Player2, offsetX);
    Ground.update(deltaTime, Player1, Player2, offsetX);  
    Ground2.update(deltaTime, Player1, Player2, offsetX);
    Box.update(deltaTime, Player1, Player2, offsetX);
    // Box2.update(deltaTime, Player1, Player2, offsetX);
    Lever.update(deltaTime, Player1, Player2, offsetX);
    Egg.update(deltaTime, Player1, Player2, offsetX);
    crouchTutorial.update();
    teksCrouch.update();
    gameTimer.update(deltaTime);
    

    Player1.draw(ctx, offsetX);
    Player2.draw(ctx, offsetX);
    Bridge.draw(ctx, offsetX);
    Ground.draw(ctx, offsetX); 
    Ground2.draw(ctx, offsetX);
    Box.draw(ctx, offsetX);   
    crouchTutorial.draw(ctx, offsetX);
    teksCrouch.draw(ctx, offsetX);
    // Box2.draw(ctx, offsetX);
    Lever.draw(ctx, offsetX);  
    if (!Egg.isCarried) {
        Egg.draw(ctx, offsetX);  
    }

    gameTimer.draw(ctx, offsetX);    

    if (Egg.x >= 0 && Egg.x <= 400) {
        gameOver = true;
        finalTime = gameTimer.elapsedTime;
        gameTimer.pause();
        console.log("Game selesai! Waktu:", finalTime);
        Egg.x = 2500;
        Egg.isCarried = false;
        gameTimer.reset();
    }

    if (pause.isMouseOver(mouse.x, mouse.y) && mouse.clicked) {        
        togglePause();
        // Remove timer start/pause logic here to let togglePause handle it
        // console.log("toggle pause");
        mouse.clicked = false;  
        return;          
    }   
}

export function updateLevel(ctx){    
}

function updateAllBoxAnimations(deltaTime) {
    for (let [boxObject, animation] of boxAnimations) {
        if (animation.isAnimating) {
            animation.currentTime += deltaTime;
            
            const progress = Math.min(animation.currentTime / animation.duration, 1);
            

            const easedProgress = easeInOutQuad(progress);

            const distance = animation.targetX - animation.startX;
            boxObject.x = animation.startX + (distance * easedProgress);
            

            if (progress >= 1) {
                boxObject.x = animation.targetX;
                animation.isAnimating = false;
                boxObject.animationState = 'idle';
                
            }
        }
    }
}
