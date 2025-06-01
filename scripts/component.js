// SKIN //
export class Skins {
    constructor(name, src, x, y, frameWidth, frameHeight, scaleWidth, scaleHeight, frameCount, frameInterval, flip = false) {
        this.name = name;
        this.image = new Image();
        this.image.src = src;
        this.x = x;
        this.y = y;
        
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.scaleWidth = scaleWidth;
        this.scaleHeight = scaleHeight;
        this.frameCount = frameCount;
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.frameInterval = frameInterval;
        this.flip = flip;
    }

    update(deltaTime) {
        this.frameTimer += deltaTime;
        if (this.frameTimer >= this.frameInterval) {
          this.frameTimer = 0;
          this.frameIndex = (this.frameIndex + 1) % this.frameCount;    
        }
    }
    
    draw(ctx) {
        if (this.flip) {
            ctx.save();            
            ctx.drawImage(
                this.image,
                this.frameIndex * this.frameWidth,
                0,
                this.frameWidth,
                this.frameHeight,
                0,
                0,
                this.scaleWidth,
                this.scaleHeight
            );
            ctx.restore();
        } else {
            ctx.drawImage(
                this.image,
                this.frameIndex * this.frameWidth,
                0,
                this.frameWidth,
                this.frameHeight,
                this.x,
                this.y,
                this.scaleWidth,
                this.scaleHeight
            );
        }
    }
}

export const playerSkin = [
    {
        name: "player 1",
        index: 0,
        animating: false,
        animationDir: null,
        animStart: 0,
        x: 300,
        skins: [
            // 1:name, 2:src, 3:x, 4:y, 5:frameWidth, 6:frameHeight, 7:scaleWidth, 8:scaleHeight 8:frame, 9:100ms/frame, 10:flip            
            new Skins("Gray", "assets/images/mono/idle.png", 200, 200, 24, 24, 200, 200, 3, 100, false),    
            new Skins("Orange", "assets/images/mono/idle.png", 200, 200, 24, 24, 200, 200, 3, 100, false),  
        ]   
    },
    {
        name: "player 2",
        index: 0,
        animating: false,
        animationDir: null,
        animStart: 0,
        x: 1000,
        skins: [
            // 1:name, 2:src, 3:x, 4:y, 5:frameWidth, 6:frameHeight, 7:scaleWidth, 8:scaleHeight 8:frame, 9:100ms/frame, 10:flip
            new Skins("Green", "assets/images/vita/idle.png", 900, 200, 24, 24, 200, 200, 3, 100, true),             
            new Skins("Red", "assets/images/vita/idle.png", 900, 200, 24, 24, 200, 200, 3, 100, true),   
        ]   
    }
]  

export class Players {
    constructor(x, y, speed, animations) {
        this.worldX = x;
        this.y = y;
        this.speed = speed;
        this.animations = animations;
        this.currentAnim = 'idle';
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.facing = 'right';
        this.width = 100;
        this.height = 100;

        this.vy = 0;
        this.gravity = 0.5;
        this.jumpStrength = -10;
        this.isJumping = false;
        this.onGround = true;
        this.jumpCount = 0;
        this.maxJump = 2;
        this.jumpPressed = false;
        this.idle = true;

        this.bite = false;
        this.biteTimer = 0;
        this.biteDuration = 200;

        this.kick = false;
        this.kickTimer = 0;
        this.kickDuration = 200;

        this.carry = false;
        this.carryPressed = false;
        this.nearEgg = false;

        this.isCrouchLocked = false;
        this.wantToStandUp = false;
    }

    checkCeilingCollision(obstacles) {
        // Dapatkan bounding box jika karakter dalam posisi normal (berdiri)
        const standingBox = {
            x: this.worldX + 30,
            y: this.y + 10,
            width: this.width - 45,
            height: this.height - 20
        };

        // Cek apakah bounding box standing akan bertabrakan dengan obstacle
        for (let obj of obstacles) {
            if (obj !== this) {
                const otherBox = obj.getBoundingBox();
                
                if (
                    standingBox.x < otherBox.x + otherBox.width &&
                    standingBox.x + standingBox.width > otherBox.x &&
                    standingBox.y < otherBox.y + otherBox.height &&
                    standingBox.y + standingBox.height > otherBox.y
                ) {
                    return true; // Ada collision di atas
                }
            }
        }
        return false; // Aman untuk berdiri
    }


    update(player, keysLeft, keysRight, keysJump, keysBite, keysSkill1, keysSkill2, deltaTime, obstacles, levelWidth) {
        let nextX = this.worldX;
        let nextY = this.y + this.vy;
        let canMoveX = true;
        
        if (keysSkill2 && !this.carryPressed) {
            // Hanya aktifkan carry jika dekat dengan telur atau sedang dalam mode carry
            if (this.nearEgg || this.carry) {
                this.carry = !this.carry;
            }
            this.carryPressed = true;
        } else if (!keysSkill2) {
            this.carryPressed = false;
        }      

        const hasCeilingCollision = this.checkCeilingCollision(obstacles);

        if (keysSkill1) {
            if (player === "player1") {
                this.kickTimer = 0;
                this.kick = true;
                this.idle = false;
            } else {
                // Player 2 - Crouch logic dengan lock system
                this.wantToStandUp = false; // Reset want to stand up
                this.isCrouching = true;
                
                if (this.carry) {
                    // Tetap dalam mode carry, tidak crouch
                    if (keysRight) {
                        this.facing = 'right';
                        this.setAnimation('carry');
                        nextX += this.speed;
                    } else if (keysLeft) {
                        this.facing = 'left';
                        this.setAnimation('carry');
                        nextX -= this.speed;
                    } else {
                        this.setAnimation('idleCarry');
                    }
                } else {
                    // Normal crouch behavior
                    if (keysRight) {
                        this.facing = 'right';
                        this.setAnimation('crouch');
                        nextX += this.speed;
                    } else if (keysLeft) {
                        this.facing = 'left';
                        this.setAnimation('crouch');
                        nextX -= this.speed;
                    } else {
                        this.setAnimation('crouchIdle');
                    }
                    
                    // Set crouch lock jika ada collision di atas
                    if (hasCeilingCollision) {
                        this.isCrouchLocked = true;
                    }
                }
            }
        } else {
            // Ketika skill1 dilepas, player ingin berdiri
            if (player === "player2") {
                this.wantToStandUp = true;
                this.isCrouching = false;
                
                // Cek apakah masih ada obstacle di atas
                if (this.carry) {
                    this.isCrouchLocked = false; // Reset crouch lock karena carry
                    
                    if (keysRight) {
                        this.facing = 'right';
                        this.setAnimation('carry');
                        nextX += this.speed;
                    } else if (keysLeft) {
                        this.facing = 'left';
                        this.setAnimation('carry');
                        nextX -= this.speed;
                    } else {
                        this.setAnimation('idleCarry');
                    }
                } else {
                    // Cek apakah masih ada obstacle di atas (hanya jika tidak carry)
                    if (hasCeilingCollision) {
                        // Masih ada obstacle di atas, tetap crouch
                        this.isCrouchLocked = true;
                        if (keysRight) {
                            this.facing = 'right';
                            this.setAnimation('crouch');
                            nextX += this.speed;
                        } else if (keysLeft) {
                            this.facing = 'left';
                            this.setAnimation('crouch');
                            nextX -= this.speed;
                        } else {
                            this.setAnimation('crouchIdle');
                        }
                    } else {
                        // Tidak ada obstacle di atas, bisa berdiri
                        this.isCrouchLocked = false;
                        
                        // Normal movement
                        if (keysBite) {
                            this.biteTimer = 0;
                            this.bite = true;
                            this.idle = false;
                        } else if (keysLeft) {
                            this.facing = 'left';
                            this.setAnimation('walk');
                            nextX -= this.speed;
                        } else if (keysRight) {
                            this.facing = 'right';
                            this.setAnimation('walk');
                            nextX += this.speed;
                        } else if (this.idle) {
                            this.setAnimation('idle');
                        }
                    }
                }
            } else {
                // Player 1 - normal movement (tidak berubah)
                if (this.carry) {            
                    if (keysRight) {
                        this.facing = 'right';
                        this.setAnimation('carry');
                        nextX += this.speed;
                    } else if (keysLeft) {
                        this.facing = 'left';
                        this.setAnimation('carry');
                        nextX -= this.speed;
                    } else {
                        this.setAnimation('idleCarry');
                    }
                } else if (keysBite) {
                    this.biteTimer = 0;
                    this.bite = true;
                    this.idle = false;
                } else if (keysLeft) {
                    this.facing = 'left';
                    this.setAnimation('walk');
                    nextX -= this.speed;
                } else if (keysRight) {
                    this.facing = 'right';
                    this.setAnimation('walk');
                    nextX += this.speed;
                } else if (this.idle) {
                    this.setAnimation('idle');
                }
            }
        }        

        if (nextX < 0) nextX = 0;
        if (nextX + this.width > levelWidth) nextX = levelWidth - this.width;

        if (this.kick) {
            this.kickTimer += deltaTime;
            this.setAnimation('kick');
            if (this.kickTimer >= this.kickDuration) {
                this.kick = false;
                this.idle = true;
                this.kickTimer = 0;
            }
        }

        if (this.bite) {
            this.biteTimer += deltaTime;
            this.setAnimation('bite');
            if (this.biteTimer >= this.biteDuration) {
                this.bite = false;
                this.idle = true;
                this.biteTimer = 0;
            }
        }

        if (keysJump && this.onGround && !this.isCrouchLocked) {
            this.vy = this.jumpStrength;
            this.onGround = false;
            this.setAnimation('jump');
        }

        if (keysJump && !this.isCrouchLocked) {
            if (!this.jumpPressed && this.jumpCount < this.maxJump && player === "player1") {
                this.vy = this.jumpStrength;
                this.jumpCount++;
                this.onGround = false;
                this.setAnimation('jump');
                this.jumpPressed = true;
            }
        } else {
            this.jumpPressed = false;
        }

        // for (let obj of obstacles) {
        //     if (obj !== this) {
        //         const otherBox = obj.getBoundingBox();
        //         const nextBox = {
        //             x: nextX,
        //             y: this.y,
        //             width: this.width,
        //             height: this.height                    
        //         };
        //         if (
        //             nextBox.x < otherBox.x + otherBox.width &&
        //             nextBox.x + nextBox.width > otherBox.x &&
        //             nextBox.y < otherBox.y + otherBox.height &&
        //             nextBox.y + nextBox.height > otherBox.y
        //         ) {
        //             canMoveX = false;
        //             break;
        //         }                
        //     }
        // }

        for (let obj of obstacles) {
            if (obj !== this) {
                const otherBox = obj.getBoundingBox();
                // Gunakan bounding box yang sudah disesuaikan, bukan width/height tetap
                const currentBounds = this.getBoundingBox();
                const nextBox = {
                    x: nextX + (currentBounds.x - this.worldX), // Offset relatif dari worldX
                    y: currentBounds.y,
                    width: currentBounds.width,
                    height: currentBounds.height                   
                };
                
                if (
                    nextBox.x < otherBox.x + otherBox.width &&
                    nextBox.x + nextBox.width > otherBox.x &&
                    nextBox.y < otherBox.y + otherBox.height &&
                    nextBox.y + nextBox.height > otherBox.y
                ) {
                    canMoveX = false;
                    break;
                }                
            }
        }

        if (canMoveX) {
            this.worldX = nextX;
            this.onGround = false;
        }

        this.vy += this.gravity;
        nextY = this.y + this.vy;

        // for (let obj of obstacles) {
        //     if (obj !== this) {
        //         const otherBox = obj.getBoundingBox();
        //         const currentBox = this.getBoundingBox();
        //         const nextBoxY = {
        //             x: this.worldX,
        //             y: nextY,
        //             // y: nextY + (currentBox.y - this.y),
        //             width: this.width,
        //             height: this.height
        //         };
        //         if (
        //             nextBoxY.x < otherBox.x + otherBox.width &&
        //             nextBoxY.x + nextBoxY.width > otherBox.x &&
        //             nextBoxY.y < otherBox.y + otherBox.height &&
        //             nextBoxY.y + nextBoxY.height > otherBox.y
        //         ) {
        //             if (this.vy > 0) {
        //                 nextY = otherBox.y - this.height;                       
        //                 this.vy = 0;
        //                 this.onGround = true;
        //                 this.jumpCount = 0;
        //             } else if (this.vy < 0) {
        //                 nextY = otherBox.y + otherBox.height;
        //                 this.vy = 0;
        //             }
        //         }            
        //     }
        // }

        for (let obj of obstacles) {
            if (obj !== this) {
                const otherBox = obj.getBoundingBox();
                const currentBounds = this.getBoundingBox();
                const nextBoxY = {
                    x: currentBounds.x,
                    y: nextY + (currentBounds.y - this.y), // Offset relatif dari y
                    width: currentBounds.width,
                    height: currentBounds.height
                };
                
                if (
                    nextBoxY.x < otherBox.x + otherBox.width &&
                    nextBoxY.x + nextBoxY.width > otherBox.x &&
                    nextBoxY.y < otherBox.y + otherBox.height &&
                    nextBoxY.y + nextBoxY.height > otherBox.y
                ) {
                    if (this.vy > 0) {
                        // Landing on top - hitung posisi Y berdasarkan bounding box
                        nextY = otherBox.y - currentBounds.height - (currentBounds.y - this.y);                       
                        this.vy = 0;
                        this.onGround = true;
                        this.jumpCount = 0;
                    } else if (this.vy < 0) {
                        // Hitting ceiling - hitung posisi Y berdasarkan bounding box
                        nextY = otherBox.y + otherBox.height - (currentBounds.y - this.y);
                        this.vy = 0;
                    }
                }            
            }
        }

        this.y = nextY;

        const anim = this.animations[this.currentAnim];
        const frameInterval = 100;
        this.frameTimer += deltaTime;
        if (this.frameTimer >= frameInterval) {
            this.frameTimer = 0;
            this.frameIndex = (this.frameIndex + 1) % anim.frameCount;
        }
    }

    setAnimation(animName) {
        if (this.currentAnim !== animName) {
            this.currentAnim = animName;
            this.frameIndex = 0;
            this.frameTimer = 0;
        }
    }

    draw(ctx, offsetX) {
        const box = this.getBoundingBox();
        const anim = this.animations[this.currentAnim];
        const frameWidth = anim.frameWidth || anim.image.width / anim.frameCount;
        const frameHeight = anim.frameHeight || 24

        ctx.save();
        ctx.imageSmoothingEnabled = false;

        let offsetY = 0;
        if (this.currentAnim === 'carry' || this.currentAnim === 'idleCarry') {
            offsetY = 20;
        }

        if (this.facing === 'left') {            
            // ctx.strokeStyle = 'red';
            // ctx.lineWidth = 2;
            // ctx.strokeRect(box.x - offsetX, box.y , box.width, box.height);
            ctx.translate(this.worldX - offsetX + this.width, this.y - offsetY);
            ctx.scale(-1, 1);
            ctx.drawImage(
                anim.image,
                this.frameIndex * frameWidth,
                0,
                frameWidth,
                frameHeight,
                0,
                0,
                this.width,
                this.height
            );            
        } else {
            ctx.drawImage(
                anim.image,
                this.frameIndex * frameWidth,
                0,
                frameWidth,
                frameHeight,
                this.worldX - offsetX,
                this.y - offsetY,
                this.width,
                this.height
            );
        
            // ctx.strokeStyle = 'red';
            // ctx.lineWidth = 2;
            // ctx.strokeRect(box.x - offsetX, box.y, box.width, box.height);
        }
        
        ctx.restore();
    }

    getCenterX() {
        return this.worldX + this.width / 2;
    }

    getBoundingBox() {        
        if (this.currentAnim === 'crouch' || this.currentAnim === 'crouchIdle') {
            return {
                x: this.worldX + 30,
                y: this.y + 30,
                width: this.width - 45,
                height: this.height - 40
            };
        } else if (this.currentAnim === 'carry' || this.currentAnim === 'idleCarry') {
            const anim = this.animations[this.currentAnim];
            return {
                x: this.worldX + 30,
                y: this.y - 15,
                width: this.width - 45,
                height: this.height
            }
        }
        else {
            return {
                x: this.worldX + 30,
                y: this.y + 10,
                width: this.width - 45,
                height: this.height- 20
            };
        }
    }

    reset({ x, y, facing }) {
        this.x = x;
        this.y = y;
        this.worldX = x;
        this.velocityX = 0;
        this.velocityY = 0;
        this.facing = facing;
        this.state = 'idle';
        this.jumpCount = 0;
        this.kick = false;
        this.carryPressed = false;
    }
}


export function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

export function createAnimations(basePath, actions) {
    const anim = {};
    for (const action of actions) {
        anim[action.name] = {
            image: loadImage(`${basePath}/${action.file}`),            
            frameCount: action.frames,
            frameInterval: action.interval || 100,
            frameWidth: action.frameWidth,
            frameHeight: action.frameHeight
        };
    }
    return anim;
}

const monoAnimations = createAnimations("./assets/images/mono", [
    { name: "idle", file: "idle.png", frames: 3 },
    { name: "walk", file: "move.png", frames: 6 },
    { name: "bite", file: "bite.png", frames: 3 },
    { name: "jump", file: "jump.png", frames: 4 },
    { name: "kick", file: "kick.png", frames: 3 },
]);

const vitaAnimations = createAnimations("./assets/images/vita", [
    { name: "idle", file: "idle.png", frames: 3 },
    { name: "walk", file: "move.png", frames: 6 },
    { name: "bite", file: "bite.png", frames: 3 },
    { name: "jump", file: "jump.png", frames: 4 },
    { name: "crouch", file: "crouch.png", frames: 6 },
    { name: "crouchIdle", file: "crouchIdle.png", frames: 1 },
    { name: "idleCarry", file: "iddleCarry.png", frames: 3, frameWidth: 24, frameHeight: 24},
    { name: "carry", file: "carryingEgg.png", frames: 6, frameWidth: 24, frameHeight: 24}
]);

export const Player1 = new Players(200, 400, 5, monoAnimations);
export const Player2 = new Players(300, 400, 5, vitaAnimations);

// OBSTACLES
// export class Obstacles{
//     constructor(options) {
//         // Posisi dan ukuran
//         this.x = options.x;
//         this.y = options.y;
//         this.originalX = options.originalX;
//         this.originalY = options.originalY;
//         this.initialX = options.x;
//         this.initialY = options.y;
//         this.width = options.width;
//         this.height = options.height;
//         this.scale = options.scale;
//         this.repeatX = options.repeatX || false;
//         this.repeatWidth = options.repeatWidth || this.width;
        
//         this.obstacles = options.obstacles;
//         this.currentObstacle = options.currentObstacle || 'longGround';

//         // Tipe: 'sprite' atau 'static'
//         this.type = options.type; // 'sprite' | 'static'

//         // Gambar (baik spritesheet atau gambar biasa)
//         this.image = options.image;

//         // Animasi jika type === 'sprite'
//         this.frameCount = options.frameCount || 1;
//         this.frameIndex = 0;
//         this.frameTimer = 0;
//         this.frameInterval = options.frameInterval || 100;
   
//         this.axis = options.axis || null;
//         this.distance = options.distance || 0;
//         this.speed = options.speed || 0;
//         this.direction = 1;
//         this.offset = 0;

//         this.cameraX = 0;  // posisi scroll platform (offset)
//         this.canvasWidth = options.canvasWidth || 3000;    
        
//         this.isCarried = options.isCarried || false;
//     }

//     update(deltaTime, player1, player2, cameraX) {

//         if (this.axis === 'x') {
//             this.offset += this.speed * deltaTime * this.direction;
//             if (Math.abs(this.offset) >= this.distance) {
//                 this.direction *= -1; // balik arah
//             }
//             this.x = this.initialX + this.offset;
//         }
        
//         const worldWidth = this.canvasWidth;
//         const playerWidth = player1.width || 50;
//         // const canvasMid = this.canvasWidth / 2;        
       
//         player1.worldX = Math.max(0, Math.min(worldWidth - playerWidth, player1.worldX)); // posisi player 1
//         player2.worldX = Math.max(0, Math.min(worldWidth - playerWidth, player2.worldX)); // posisi player 2  membandingkan nilai parameter 1 dan nilai parameter 2

//     //    const midPoint = (player1.x + player2.x) / 2; // titik tengah dua player                        

//         // const maxCameraX = this.repeatWidth - this.canvasWidth;
//         // const desiredCameraX = midPoint - canvasMid;          
//         this.cameraX = cameraX;
//         // const offset = this.cameraX;   
                
//         if (!this.animationStopped) {
//             this.frameTimer += deltaTime;
//             if (this.frameTimer >= this.frameInterval) {
//                 this.frameTimer = 0;
//                 this.frameIndex = (this.frameIndex + 1) % this.frameCount;
//             }
//         }
//     }

//     draw(ctx, cameraX) {
//         const obst = this.obstacles[this.currentObstacle];        
//         ctx.save();
//         ctx.imageSmoothingEnabled = false;

//         const drawY = this.y;

//         if (this.repeatX) {
//             const imgWidth = obst.image.width * this.scale;
//             const imgHeight = obst.image.height * this.scale;
            
//             let startX = this.x -(cameraX % imgWidth);
//             const endX = this.canvasWidth + imgWidth;            

//             for (let x = startX; x < endX; x += imgWidth) {
//                 ctx.drawImage(
//                     obst.image,
//                     x,
//                     drawY,
//                     obst.image.width * this.scale,
//                     obst.image.height * this.scale
//                 );
//             }
//             const box = this.getBoundingBox(cameraX);
//             // ctx.strokeStyle = 'red';
//             // ctx.lineWidth = 2;
//             // ctx.strokeRect(box.x, box.y, box.width, box.height);

//         } else {
//             const frameWidth = obst.image.width / this.frameCount;                        
//             ctx.drawImage(
//                 obst.image,
//                 this.frameIndex * frameWidth, 
//                 0,                            
//                 frameWidth,                    
//                 obst.image.height,            
//                 this.x - this.cameraX,        
//                 drawY,                        
//                 this.width * this.scale,       
//                 this.height * this.scale       
//             );
//             const box = this.getBoundingBox(cameraX);
//             ctx.strokeStyle = 'red';
//             ctx.lineWidth = 2;
//             ctx.strokeRect(this.x - this.cameraX, drawY, this.width * this.scale, this.height * this.scale);

//         }

                
//         ctx.restore();
//     }

//     getBoundingBox(cameraX) {                
//         if (this.repeatX){
//             return {
//                 x: this.x,
//                 y: this.y + 15,
//                 width: this.width,
//                 height: this.height * this.scale - 21
//             };
//         } else {
//             const frameWidth = this.width * this.scale;
//             const frameHeight = this.height * this.scale;

//             return {
//                 x: this.x + 15,
//                 y: this.y + 15,
//                 width: frameWidth - 30,
//                 height: frameHeight - 30
//             };
//         }   
//     }

//     setAnimationFrame(frameIndex) {
//         this.frameIndex = frameIndex;
//         this.frameTimer = 0;
//         this.animationStopped = true; // stop automatic animation update
//     }

// }

export class Obstacles{
    constructor(options) {
        // Posisi dan ukuran
        this.x = options.x;
        this.y = options.y;
        this.originalX = options.originalX;
        this.originalY = options.originalY;
        this.initialX = options.x;
        this.initialY = options.y;
        this.width = options.width;
        this.height = options.height;
        this.scale = options.scale;
        this.repeatX = options.repeatX || false;
        this.repeatWidth = options.repeatWidth || this.width;
        
        this.obstacles = options.obstacles;
        this.currentObstacle = options.currentObstacle || 'longGround';

        // Tipe: 'sprite' atau 'static'
        this.type = options.type; // 'sprite' | 'static'

        // Gambar (baik spritesheet atau gambar biasa)
        this.image = options.image;

        // Animasi jika type === 'sprite'
        this.frameCount = options.frameCount || 1;
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.frameInterval = options.frameInterval || 100;
   
        this.axis = options.axis || null;
        this.distance = options.distance || 0;
        this.speed = options.speed || 0;
        this.direction = 1;
        this.offset = 0;

        this.cameraX = 0;  // posisi scroll platform (offset)
        this.canvasWidth = options.canvasWidth || 3000;    
        
        this.isCarried = options.isCarried || false;
    }

    update(deltaTime, player1, player2, cameraX) {
        // Update posisi untuk moving platforms
        if (this.axis === 'x') {
            this.offset += this.speed * deltaTime * this.direction;
            if (Math.abs(this.offset) >= this.distance) {
                this.direction *= -1; // balik arah
            }
            this.x = this.initialX + this.offset;
        }
        
        const worldWidth = this.canvasWidth;
        const playerWidth = player1.width || 50;
        const canvasMid = this.canvasWidth / 2;        
       
        player1.worldX = Math.max(0, Math.min(worldWidth - playerWidth, player1.worldX)); // posisi player 1
        player2.worldX = Math.max(0, Math.min(worldWidth - playerWidth, player2.worldX)); // posisi player 2  membandingkan nilai parameter 1 dan nilai parameter 2

        const midPoint = (player1.x + player2.x) / 2; // titik tengah dua player                        

        const maxCameraX = this.repeatWidth - this.canvasWidth;
        const desiredCameraX = midPoint - canvasMid;          
        this.cameraX = cameraX;
        const offset = this.cameraX;   
                
        if (!this.animationStopped) {
            this.frameTimer += deltaTime;
            if (this.frameTimer >= this.frameInterval) {
                this.frameTimer = 0;
                this.frameIndex = (this.frameIndex + 1) % this.frameCount;
            }
        }
    }

    draw(ctx, cameraX) {
        const obst = this.obstacles[this.currentObstacle];        
        ctx.save();
        ctx.imageSmoothingEnabled = false;

        const drawY = this.y;

        if (this.repeatX) {
            const imgWidth = obst.image.width * this.scale;
            const imgHeight = obst.image.height * this.scale;
            
            let startX = this.x - (cameraX % imgWidth);
            const endX = this.canvasWidth + imgWidth;            

            for (let x = startX; x < endX; x += imgWidth) {
                ctx.drawImage(
                    obst.image,
                    x,
                    drawY,
                    obst.image.width * this.scale,
                    obst.image.height * this.scale
                );
            }
            
            // Debug bounding box untuk repeatX
            // const box = this.getBoundingBox();
            // ctx.strokeStyle = 'red';
            // ctx.lineWidth = 2;
            // ctx.strokeRect(box.x - cameraX, box.y, box.width, box.height);

        } else {
            const frameWidth = obst.image.width / this.frameCount;                        
            ctx.drawImage(
                obst.image,
                this.frameIndex * frameWidth, 
                0,                            
                frameWidth,                    
                obst.image.height,            
                this.x - cameraX,        // PERBAIKAN: Konsisten dengan getBoundingBox
                drawY,                        
                this.width * this.scale,       
                this.height * this.scale       
            );
            
            // Debug bounding box
            const box = this.getBoundingBox();
            // ctx.strokeStyle = 'red';
            // ctx.lineWidth = 2;
            // ctx.strokeRect(box.x - cameraX, box.y, box.width, box.height);
        }
        
        ctx.restore();
    }

    // PERBAIKAN UTAMA: getBoundingBox() yang konsisten
    getBoundingBox() {                
        if (this.repeatX) {
            // Untuk background/ground yang repeat, gunakan area yang luas
            return {
                x: this.x,
                y: this.y + 15,
                width: this.repeatWidth, // Gunakan full repeat width
                height: this.height * this.scale - 21
            };
        } else {
            // Untuk obstacle biasa, posisi dunia yang sebenarnya (tanpa camera offset)
            const frameWidth = this.width * this.scale;
            const frameHeight = this.height * this.scale;

            return {
                x: this.x, // Posisi dunia sebenarnya
                y: this.y,
                width: frameWidth,
                height: frameHeight
            };
        }   
    }

    // Method tambahan untuk mendapatkan bounding box dengan camera offset (untuk rendering)
    getScreenBoundingBox(cameraX) {
        const worldBox = this.getBoundingBox();
        return {
            x: worldBox.x - cameraX,
            y: worldBox.y,
            width: worldBox.width,
            height: worldBox.height
        };
    }

    setAnimationFrame(frameIndex) {
        this.frameIndex = frameIndex;
        this.frameTimer = 0;
        this.animationStopped = true; // stop automatic animation update
    }
}

export const longGround = createAnimations("./assets/images", [
    { name: "longGround", file: "longGround.png", frames: 1 }]);
export const box = createAnimations("./assets/images", [
    { name: "box", file: "box.png", frames: 1 }]);
export const lever = createAnimations("./assets/images", [
    { name: "lever", file: "lever.png", frames: 2}]);
export const egg = createAnimations("./assets/images/vita", [
    { name: "egg", file: "egg-1.png", frames: 1}]);
export const grass1 = createAnimations("./assets/images", [
    { name: "grass1", file: "grass-1.png", frames: 1}]);
export const grass2 = createAnimations("./assets/images", [
    { name: "grass2", file: "grass-2.png", frames: 1}]);
export const bridge = createAnimations("./assets/images", [
    { name: "bridge", file: "bridge.png", frames: 1}]);
export const gate = createAnimations("./assets/images", [
    { name: "gate", file: "gate.png", frames: 1}]);


// BUTTONS //

import { isLevelUnlocked, levelStatus } from "./levelManager.js";

export class Buttons{
    constructor(imageSrc, x, y, width, height, scale, onClick=null, active = null){
        this.image = new Image();
        this.image.src = imageSrc;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.scale = scale;

        this.hovered = false;
        this.clicked = false;
        this.active = active;

        this.onClick = onClick;    
        
        if (!imageSrc) {
            console.error("imageSrc tidak didefinisikan untuk Button!");
        }
    }

    isMouseOver(mouseX, mouseY) {
        return (
            mouseX >= this.x &&
            mouseX <= this.x + this.width * this.scale &&
            mouseY >= this.y &&
            mouseY <= this.y + this.height * this.scale
        );
    }

    update(mouseX, mouseY, isMouseDown) {
        if (!this.active) {
            this.hovered = false;
            this.clicked = false;
            return;
        }

        this.hovered = this.isMouseOver(mouseX, mouseY);
        this.clicked = this.hovered && isMouseDown;

        if (this.clicked && this.onClick) {
            // console.log("Clicked");
        }
    }

    draw(ctx) {
        ctx.save();

        let scaleFactor = this.hovered ? this.scale * 1.2 : this.scale;
        
        if (this.hovered) {
            ctx.globalAlpha = 0.9;
            ctx.shadowColor = 'yellow';
            ctx.shadowBlur = 15;            
        }
     

        ctx.drawImage(
            this.image,
            this.x - (this.width * (scaleFactor - this.scale)) / 2,
            this.y - (this.height * (scaleFactor - this.scale)) / 2,
            this.width * scaleFactor,
            this.height * scaleFactor
        );

        ctx.restore();
    }
}

export const buttons = {
    // 1:src, 2:x, 3:y, 4:scale, 5:onClick 6:active
    buttonNext: new Buttons("assets/images/buttons/button-next.png", 627, 540, 100, 40, 1, true, true),
    buttonA: new Buttons("assets/images/buttons/arrow-a.png", 190, 400, 125, 164, 0.5, true, true),
    buttonD: new Buttons("assets/images/buttons/arrow-d.png", 350, 400, 125, 164, 0.5, true, true),    
    buttonLeft: new Buttons("assets/images/buttons/arrow-left.png", 890, 400, 125, 164, 0.5, true, true),    
    buttonRight: new Buttons("assets/images/buttons/arrow-right.png", 1050, 400, 125, 164, 0.5, true, true),    
    buttonPause: new Buttons("assets/images/buttons/pause.png", 1250, 50, 69, 70, 0.5, true, true),
    buttonResume: new Buttons("assets/images/buttons/resume.png", 627, 500, 69, 70, 0.5, true, true),
    buttonLevels: []    
};
    
export function getButtons(name) {
    return buttons[name];
}

for (let i=1; i<9; i++){   
    const isUnlocked = isLevelUnlocked(i - 1);

    buttons.buttonLevels.push(        
        new Buttons(
            isUnlocked
                ? `assets/images/buttons/levels/${i}-active.png`
                : `assets/images/buttons/levels/${i}.png`,
            400 + ((i - 1) % 4) * 150,
            200 + Math.floor((i - 1) / 4) * 150,
            141,
            132,
            0.5,
            isUnlocked ? () => console.log(`Level ${i} clicked`) : null,
            isUnlocked
        )
    )
}

export function refreshLevelButtons() {
  buttons.buttonLevels = [];

  for (let i = 1; i < 9; i++) {
    const isUnlocked = levelStatus[i - 1].unlocked;  // ← gunakan levelStatus

    const imageSrc = isUnlocked
      ? `assets/images/buttons/levels/${i}-active.png`
      : `assets/images/buttons/levels/${i}.png`;

    buttons.buttonLevels.push(
      new Buttons(
        imageSrc,
        400 + ((i - 1) % 4) * 150,
        200 + Math.floor((i - 1) / 4) * 150,
        141,
        132,
        0.5,
        isUnlocked ? () => console.log("Level " + i + " clicked") : null,
        isUnlocked
      )
    );
  }
}

export class Tutorials{
    constructor(imageSrc, x, y, width, height, scale, shouldBlink = false){
        this.image = new Image();
        this.image.src = imageSrc;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.scale = scale;

        this.shouldBlink = shouldBlink;
        this.blinkTimer = 0;
        this.blinkSpeed = 60; // Durasi satu siklus
        this.opacity = 1;

    }

    update() {
        if (this.shouldBlink) {
            this.blinkTimer++;            
            const fadeValue = (Math.sin(this.blinkTimer * Math.PI / this.blinkSpeed) + 1) / 2;
            this.opacity = 0.3 + (fadeValue * 0.7); // Range 0.3 - 1.0
        }
    }

    draw(ctx, offsetX) {
        ctx.save();
        
        if (this.shouldBlink) {
            ctx.globalAlpha = this.opacity;
        }
        
        ctx.drawImage(
            this.image,
            0,
            0,
            this.width,
            this.height,
            this.x - offsetX,
            this.y,
            this.width * this.scale,
            this.height * this.scale
        );

        ctx.restore();
    }
}

export const tutorial = {
    // 1:src, 2:x, 3:y, 4:scale
    teksWalk: new Tutorials("assets/images/tutorial/teks-walk.png", 400, 300, 1035, 100, 0.5, true),
    jumpTutorial: new Tutorials("assets/images/tutorial/jump-tutorial.png", 1800, 370, 479, 391, 0.5, true),
    highJumpTutorial: new Tutorials("assets/images/tutorial/highJump-tutorial.png", 640, 185, 224, 781, 0.5, true),
    crouchTutorial: new Tutorials("assets/images/tutorial/crouch-tutorial.png", 640, 480, 508, 200, 0.5, true),
    teksJump: new Tutorials("assets/images/tutorial/teks-jump.png", 1600, 300, 886, 100, 0.5, true),
    teksPick: new Tutorials("assets/images/tutorial/teks-pick.png", 2300, 400, 1199, 50, 0.5, true),
    teksPut: new Tutorials("assets/images/tutorial/teks-put.png", 100, 460, 517, 103, 0.5, true),
    teksBite: new Tutorials("assets/images/tutorial/teks-bite.png", 2200, 400, 1171, 34, 0.5, true),
    teksKick: new Tutorials("assets/images/tutorial/teks-kick.png", 1000, 480, 858, 34, 0.5, true),
    teksHighJump: new Tutorials("assets/images/tutorial/teks-highJump.png", 200, 400, 855, 38, 0.5, true),
    teksCrouch: new Tutorials("assets/images/tutorial/teks-crouch.png", 390, 420, 602, 38, 0.5, true)
};