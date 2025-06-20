import {  tutorial,Player1, Player2, Obstacles, longGround, box, lever, egg, buttons, grass1, grass2} from "../component.js";
import { keys, mouse, previousLevelState, setPreviousLevelState, setGameState, togglePause, isPaused, InputKey } from "../game.js";
import { gameTimer } from "../timer.js";
import { unlockNextLevel } from "../levelManager.js";

let lastTime = 0;
let levelWidth = 3000;
let time = 0;
let offsetX = 0;
const pause = buttons.buttonPause;
const teksBite = tutorial.teksBite;
const teksKick = tutorial.teksKick;
const highJumpTutorial = tutorial.highJumpTutorial;
const teksHighJump = tutorial.teksHighJump;

let gameOver = false;
let finalTime = 0;

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

export function startTimer() {
    gameTimer.reset();
    gameTimer.start();
}

export function initLevel2() {
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

    Box.x = Box.originalX;
    Box.y = Box.originalY || 385;
    Box.animationState = 'idle';

    Box2.x = Box2.originalX;
    Box2.y = Box2.originalY || 295;
    Box2.animationState = 'idle';

    Box3.x = 700;
    Box3.y = 475;

    Grass1.x = 2500;
    Grass1.y = 515;
    Grass1.scale = 1;

    Grass2.x = 2450;
    Grass2.y = 515;
    Grass2.scale = 1;

    // Clear semua animasi
    boxAnimations.clear();

    wasKicking = false;
    wasCarrying = false;

    gameOver = false;
    finalTime = 0;
    gameTimer.reset();
    gameTimer.start();
}

const Grass1 = new Obstacles({
    x: 2500,
    y: 515,
    width: 72,
    height: 72,
    type: 'static',
    scale: 1,
    obstacles: grass1,  
    currentObstacle: "grass1" 
});

const Grass2 = new Obstacles({
    x: 2450,
    y: 515,
    width: 72,
    height: 72,
    type: 'static',
    scale: 1,
    obstacles: grass2,  
    currentObstacle: "grass2" 
});

const Lever = new Obstacles({
    x: 1200,
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

const Box = new Obstacles({
    x: 700,
    y: 385,
    width: 184,
    height: 90,
    type: 'static',
    scale: 1,
    obstacles: box,  
    currentObstacle: "box",
    originalX: 700,
    originalY: 385,
    animationState: 'idle'
    
});

const Box2 = new Obstacles({
    x: 700,
    y: 295,
    width: 184,
    height: 90,
    type: 'static',
    scale: 1,
    obstacles: box,  
    currentObstacle: "box",
    originalX: 700,
    originalY: 295,
    animationState: 'idle'      
});

const Box3 = new Obstacles({
    x: 700,
    y: 475,
    width: 184,
    height: 90,
    type: 'static',
    scale: 1,
    obstacles: box,  
    currentObstacle: "box"      
});

const Box4 = new Obstacles({
    x: 1400,
    y: 385,
    width: 184,
    height: 90,
    type: 'static',
    scale: 1,
    obstacles: box,  
    currentObstacle: "box"      
});

const Box5 = new Obstacles({
    x: 1400,
    y: 475,
    width: 184,
    height: 90,
    type: 'static',
    scale: 1,
    obstacles: box,  
    currentObstacle: "box"      
});

const obstacles = [Egg, Lever,Box5, Box4,Box3, Box2, Box, Ground, Ground2, Ground3, Player1, Player2, Grass1, Grass2];

export function drawLevel(ctx, timestamp){ 
    // console.log("Paused?", isPaused);

    if (gameOver) {
        // gameOver = false;
        gameTimer.pause();
        gameTimer.reset();

        unlockNextLevel(1);

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
    ctx.fillText("Level 2", ctx.canvas.width / 2, 70);
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
                // Lever aktif - gerakkan box ke kanan
                 startBoxAnimation(Box, Box.originalX + 200);                
                Box.animationState = 'moving_right';
                
                startBoxAnimation(Box2, Box2.originalX + 400);                
                Box2.animationState = 'moving_right';
            } else {
                // Lever nonaktif - kembalikan box ke posisi awal
                startBoxAnimation(Box, Box.originalX);
                Box.animationState = 'moving_left';
                
                startBoxAnimation(Box2, Box2.originalX);
                Box2.animationState = 'moving_left';
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

    if (Grass1 || Grass2) {
        const player1Box = Player1.getBoundingBox();
        const player2Box = Player2.getBoundingBox();
        const grass1Box = Grass1.getBoundingBox(Grass1.cameraX); 
        const grass2Box = Grass2.getBoundingBox(Grass2.cameraX); 

        if (Grass1) {
            const grass1HorizontalDistance1 = Math.max(
                grass1Box.x - (player1Box.x + player1Box.width), 
                player1Box.x - (grass1Box.x + grass1Box.width)
            );

            const grass1VerticalOverlap1 =
                player1Box.y + player1Box.height > grass1Box.y &&
                player1Box.y < grass1Box.y + grass1Box.height;

            const isNearGrass1_P1 = grass1HorizontalDistance1 <= 30 && grass1VerticalOverlap1;
            Player1.nearGrass1 = isNearGrass1_P1;

            // Player1 bite Grass1
            if (Player1.bite && isNearGrass1_P1) {
                Grass1.scale = 0;
                Grass1.y = 2000;
            }

            // Cek Player2 dengan Grass1 (jika masih ada)
            if (Grass1.scale > 0) {
                const grass1HorizontalDistance2 = Math.max(
                    grass1Box.x - (player2Box.x + player2Box.width), 
                    player2Box.x - (grass1Box.x + grass1Box.width)
                );

                const grass1VerticalOverlap2 =
                    player2Box.y + player2Box.height > grass1Box.y &&
                    player2Box.y < grass1Box.y + grass1Box.height;

                const isNearGrass1_P2 = grass1HorizontalDistance2 <= 30 && grass1VerticalOverlap2;
                Player2.nearGrass1 = isNearGrass1_P2;

                // Player2 bite Grass1
                if (Player2.bite && isNearGrass1_P2) {
                    Grass1.scale = 0;
                    Grass1.y = 2000;
                }
            }
        }

        // Cek Player1 dengan Grass2
        if (Grass2) {
            const grass2HorizontalDistance1 = Math.max(
                grass2Box.x - (player1Box.x + player1Box.width), 
                player1Box.x - (grass2Box.x + grass2Box.width)
            );

            const grass2VerticalOverlap1 =
                player1Box.y + player1Box.height > grass2Box.y &&
                player1Box.y < grass2Box.y + grass2Box.height;

            const isNearGrass2_P1 = grass2HorizontalDistance1 <= 30 && grass2VerticalOverlap1;
            Player1.nearGrass2 = isNearGrass2_P1;

            // Player1 bite Grass2
            if (Player1.bite && isNearGrass2_P1) {
                Grass2.scale = 0;
                Grass2.y = 2000;
            }

            // Cek Player2 dengan Grass2 (jika masih ada)
            if (Grass2.scale > 0) {
                const grass2HorizontalDistance2 = Math.max(
                    grass2Box.x - (player2Box.x + player2Box.width), 
                    player2Box.x - (grass2Box.x + grass2Box.width)
                );

                const grass2VerticalOverlap2 =
                    player2Box.y + player2Box.height > grass2Box.y &&
                    player2Box.y < grass2Box.y + grass2Box.height;

                const isNearGrass2_P2 = grass2HorizontalDistance2 <= 30 && grass2VerticalOverlap2;
                Player2.nearGrass2 = isNearGrass2_P2;

                // Player2 bite Grass2
                if (Player2.bite && isNearGrass2_P2) {
                    Grass2.scale = 0;
                    Grass2.y = 2000;
                }
            }
        }
    }

    updateAllBoxAnimations(deltaTime);
    const midX = (Player1.getCenterX() + Player2.getCenterX()) / 2;
    offsetX = Math.max(0, Math.min(midX - ctx.canvas.width / 2, levelWidth - ctx.canvas.width));

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

    Player1.update("player1", keys["KeyA"], keys["KeyD"], keys["KeyW"], keys["KeyQ"], keys["KeyX"], keys["KeyL"], deltaTime, obstacles, levelWidth);
    Player2.update("player2", keys["ArrowLeft"], keys["ArrowRight"], keys["ArrowUp"], keys["KeyO"], keys["ArrowDown"], keys["KeyP"], deltaTime, obstacles, levelWidth);           
    Ground.update(deltaTime, Player1, Player2, offsetX);  
    Ground2.update(deltaTime, Player1, Player2, offsetX);  
    Ground3.update(deltaTime, Player1, Player2, offsetX);  
    Box.update(deltaTime, Player1, Player2, offsetX);
    Box2.update(deltaTime, Player1, Player2, offsetX);
    Box3.update(deltaTime, Player1, Player2, offsetX);
    Box4.update(deltaTime, Player1, Player2, offsetX);
    Box5.update(deltaTime, Player1, Player2, offsetX);
    Lever.update(deltaTime, Player1, Player2, offsetX);
    Egg.update(deltaTime, Player1, Player2, offsetX);
    Grass1.update(deltaTime, Player1, Player2, offsetX);
    Grass2.update(deltaTime, Player1, Player2, offsetX);
    gameTimer.update(deltaTime);
    teksBite.update();
    teksKick.update();
    highJumpTutorial.update();
    teksHighJump.update()
    

    Player1.draw(ctx, offsetX);
    Player2.draw(ctx, offsetX);
    Ground.draw(ctx, offsetX); 
    Ground2.draw(ctx, offsetX); 
    Ground3.draw(ctx, offsetX); 
    Box.draw(ctx, offsetX);
    Box2.draw(ctx, offsetX);
    Box3.draw(ctx, offsetX);
    Box4.draw(ctx, offsetX);
    Box5.draw(ctx, offsetX);
    Lever.draw(ctx, offsetX);  
    Grass1.draw(ctx, offsetX);
    Grass2.draw(ctx, offsetX);   
    teksBite.draw(ctx, offsetX);
    teksKick.draw(ctx, offsetX);
    highJumpTutorial.draw(ctx, offsetX);
    teksHighJump.draw(ctx, offsetX);
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
        gameTimer.reset();
    }

    if (pause.isMouseOver(mouse.x, mouse.y) && mouse.clicked) {        
        togglePause();
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