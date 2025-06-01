import { Player1, Player2, Obstacles, longGround, box, gate, lever, egg, buttons, bridge} from "../component.js";
import { keys, mouse, previousLevelState, setPreviousLevelState, setGameState, togglePause, isPaused, InputKey } from "../game.js";
import { gameTimer } from "../timer.js";
import { unlockNextLevel } from "../levelManager.js";

let lastTime = 0;
let levelWidth = 4000;
let time = 0;
let offsetX = 0;
const pause = buttons.buttonPause;

let gameOver = false;
let gameOverReason = null;
let finalTime = 0;

let boxAnimations = new Map();

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function startBoxAnimation(boxObject, targetX = null, targetY = null) {
    console.log(`Starting animation for box from (${boxObject.x}, ${boxObject.y}) to (${targetX}, ${targetY})`);
    
    const animationData = {
        isAnimating: true,
        currentTime: 0,
        duration: 1000,
        easeType: 'easeInOutQuad'
    };

    // Setup animasi X jika targetX diberikan
    if (targetX !== null) {
        animationData.startX = boxObject.x;
        animationData.targetX = targetX;
        animationData.animateX = true;
    } else {
        animationData.animateX = false;
    }

    // Setup animasi Y jika targetY diberikan
    if (targetY !== null) {
        animationData.startY = boxObject.y;
        animationData.targetY = targetY;
        animationData.animateY = true;
    } else {
        animationData.animateY = false;
    }

    boxAnimations.set(boxObject, animationData);
}

export function startTimer() {
    gameTimer.reset();
    gameTimer.start();
}

export function initLevel4() {

    lastTime = performance.now();
    gameTimer.reset();
    gameTimer.start();
    gameOver = false;
    gameOverReason = null;
    finalTime = 0;
    Egg.x = 2700;         
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

    Egg.x = 2700;
    Egg.y = 515;
    Egg.isCarried = false;
    Egg.scale = 5;

    Lever.isActive = false;
    Lever.setAnimationFrame(0);

    // Reset posisi box
    Box.x = 700;
    Box.y = 390;

    Box2.x = 700;
    Box2.y = 183;

    Gate.x = Gate.originalX;
    Gate.y = Gate.originalY || 20;
    Gate.animationState = 'idle';

    boxAnimations.clear();

    // Reset properti lain jika ada
    wasKicking = false;
    wasCarrying = false;

    gameOver = false;
    finalTime = 0;
    gameTimer.reset();
    gameTimer.start();
}



const Lever = new Obstacles({
    x: 1300,
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
    x: -1000,
    y: 565,
    width: 3000,
    height: 121,
    type: 'static',
    scale: 0.5,
    obstacles: longGround,   
});

const Ground2 = new Obstacles({
    x: 750,
    y: 565,
    width: 3000,
    height: 121,
    type: 'static',
    scale: 0.5,
    obstacles: longGround,   
});

const Ground3 = new Obstacles({
    x: 2000,
    y: 565,
    width: 3000,
    height: 121,
    type: 'static',
    scale: 0.5,
    obstacles: longGround,   
    originalX: 2700,
    originalY: 565,
    animationState: 'idle'
});

const Gate = new Obstacles({
    x: 1185,
    y: 70,
    width: 38,
    height: 541,
    type: 'static',
    scale: 1,
    obstacles: gate,  
    currentObstacle: "gate",
    originalX: 1185,
    originalY: 70,
    animationState: 'idle'
});

const Box = new Obstacles({
    x: 1000,
    y: 390,
    width: 184,
    height: 107,
    type: 'static',
    scale: 1,
    obstacles: box,  
    currentObstacle: "box"      
});

const Box2 = new Obstacles({
    x: 1000,
    y: 183,
    width: 184,
    height: 107,
    type: 'static',
    scale: 1,
    obstacles: box,  
    currentObstacle: "box"      
});

const Box3 = new Obstacles({
    x: 2300,
    y: 390,
    width: 184,
    height: 107,
    type: 'static',
    scale: 1,
    obstacles: box,  
    currentObstacle: "box"      
});

const Box4 = new Obstacles({
    x: 2600,
    y: 455,
    width: 184,
    height: 107,
    type: 'static',
    scale: 1,
    obstacles: box,  
    currentObstacle: "box"      
});

const Box5 = new Obstacles({
    x: 2300,
    y: 290,
    width: 184,
    height: 107,
    type: 'static',
    scale: 1,
    obstacles: box,  
    currentObstacle: "box"      
});

const Box6 = new Obstacles({
    x: 2625,
    y: 380,
    width: 184,
    height: 107,
    type: 'static',
    scale: 0.7,
    obstacles: box,  
    currentObstacle: "box"      
});

const Egg = new Obstacles({
    x: 2850,
    y: 324,
    width: 7,
    height: 10,
    type: 'static',
    scale: 5,
    obstacles: egg,  
    currentObstacle: "egg",
    isCarried: false
});

const obstacles = [Egg, Lever, Box2, Box, Box3, Box4, Box5, Box6, Gate, Ground, Ground2, Ground3, Player1, Player2];

export function drawLevel(ctx, timestamp){ 
    // console.log("Paused?", isPaused);

    if (gameOver) {
        // gameOver = false;
        gameTimer.pause();
        gameTimer.reset();

        unlockNextLevel(3);

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
    ctx.fillText("Level 4", ctx.canvas.width / 2, 70);
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
                startBoxAnimation(Gate, null, Gate.originalY + 500);              
                Gate.animationState = 'moving_down';
                                
            } else {
                // Lever nonaktif - kembalikan box ke posisi awal
                startBoxAnimation(Gate, Gate.originalX, Gate.originalY);
                Gate.animationState = 'moving_up';
                               
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
                Egg.y = 3000;     
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


    Player1.update("player1", keys["KeyA"], keys["KeyD"], keys["KeyW"], keys["KeyQ"], keys["KeyX"], keys["KeyL"], deltaTime, obstacles, levelWidth);
    Player2.update("player2", keys["ArrowLeft"], keys["ArrowRight"], keys["ArrowUp"], keys["KeyO"], keys["ArrowDown"], keys["KeyP"], deltaTime, obstacles, levelWidth);           
    Gate.update(deltaTime, Player1, Player2, offsetX);          
    Ground.update(deltaTime, Player1, Player2, offsetX);  
    Ground2.update(deltaTime, Player1, Player2, offsetX);  
    Ground3.update(deltaTime, Player1, Player2, offsetX);  
    Box.update(deltaTime, Player1, Player2, offsetX);
    Box2.update(deltaTime, Player1, Player2, offsetX);
    Box3.update(deltaTime, Player1, Player2, offsetX);
    Box4.update(deltaTime, Player1, Player2, offsetX);
    Box5.update(deltaTime, Player1, Player2, offsetX);
    Box6.update(deltaTime, Player1, Player2, offsetX);
    Lever.update(deltaTime, Player1, Player2, offsetX);
    // Bridge.update(deltaTime, Player1, Player2, offsetX);
    // Bridge2.update(deltaTime, Player1, Player2, offsetX);
    Egg.update(deltaTime, Player1, Player2, offsetX);
    gameTimer.update(deltaTime);
    

    Player1.draw(ctx, offsetX);
    Player2.draw(ctx, offsetX);
    Gate.draw(ctx, offsetX);            
    Ground.draw(ctx, offsetX); 
    Ground2.draw(ctx, offsetX); 
    Ground3.draw(ctx, offsetX); 
    Box.draw(ctx, offsetX);
    Box2.draw(ctx, offsetX);
    Box3.draw(ctx, offsetX);
    Box4.draw(ctx, offsetX);
    Box5.draw(ctx, offsetX);
    Box6.draw(ctx, offsetX);
    Lever.draw(ctx, offsetX);  
    // Bridge.draw(ctx, offsetX);  
    // Bridge2.draw(ctx, offsetX);  
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
        // Remove timer start/pause logic here to let togglePause handle it
        // console.log("toggle pause");
        mouse.clicked = false;  
        return;          
    }
    // if (InputKey("Space")) {
    //     togglePause();
    //     return;
    // }
}

export function updateLevel(ctx){    
}

function updateAllBoxAnimations(deltaTime) {
    for (let [boxObject, animation] of boxAnimations) {
        if (animation.isAnimating) {
            animation.currentTime += deltaTime;
            
            const progress = Math.min(animation.currentTime / animation.duration, 1);
            const easedProgress = easeInOutQuad(progress);

            // Update posisi X jika animasi X aktif
            if (animation.animateX) {
                const distanceX = animation.targetX - animation.startX;
                boxObject.x = animation.startX + (distanceX * easedProgress);
            }

            // Update posisi Y jika animasi Y aktif
            if (animation.animateY) {
                const distanceY = animation.targetY - animation.startY;
                boxObject.y = animation.startY + (distanceY * easedProgress);
            }

            // Selesaikan animasi
            if (progress >= 1) {
                if (animation.animateX) {
                    boxObject.x = animation.targetX;
                }
                if (animation.animateY) {
                    boxObject.y = animation.targetY;
                }
                animation.isAnimating = false;
                boxObject.animationState = 'idle';
            }
        }
    }
}
