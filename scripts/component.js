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
        name: "player1",
        index: 0,
        animating: false,
        animationDir: null,
        animStart: 0,
        x: 300,
        skins: [
            // 1:name, 2:src, 3:x, 4:y, 5:frameWidth, 6:frameHeight, 7:scaleWidth, 8:scaleHeight 8:frame, 9:100ms/frame, 10:flip            
            new Skins("mono", "assets/images/mono/idle.png", 200, 200, 24, 24, 200, 200, 3, 100, false),    
            new Skins("mono", "assets/images/mono/idle2.png", 200, 200, 24, 24, 200, 200, 3, 100, false),  
        ]   
    },
    {
        name: "player2",
        index: 0,
        animating: false,
        animationDir: null,
        animStart: 0,
        x: 1000,
        skins: [
            // 1:name, 2:src, 3:x, 4:y, 5:frameWidth, 6:frameHeight, 7:scaleWidth, 8:scaleHeight 8:frame, 9:100ms/frame, 10:flip
            new Skins("vita", "assets/images/vita/idle.png", 900, 200, 24, 24, 200, 200, 3, 100, true),             
            new Skins("vita", "assets/images/vita/idle2.png", 900, 200, 24, 24, 200, 200, 3, 100, true),   
        ]   
    }
]  

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
    buttonLevels: []    
};
    
export function getButtons(name) {
    return buttons[name];
}

for (let i=1; i<9; i++){   
    buttons.buttonLevels.push(        
        new Buttons(
            `assets/images/buttons/levels/${i}.png`,
            400 + ((i - 1) % 4) * 150,
            200 + Math.floor((i - 1) / 4) * 150,
            141,
            132,
            0.5,
            () => console.log("Button 1"),
            true
        )
    )
}