class Character extends MovableObject {

    x = 220;
    height = 280;
    y = 155;
    speed = 240;
    isMoving = false;
    wasMoving = false;

    IMAGES_WALKING = [
        'img/2_character_pepe/2_walk/W-21.png',
        'img/2_character_pepe/2_walk/W-22.png',
        'img/2_character_pepe/2_walk/W-23.png',
        'img/2_character_pepe/2_walk/W-24.png',
        'img/2_character_pepe/2_walk/W-25.png',
        'img/2_character_pepe/2_walk/W-26.png',
    ];

    constructor() {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
    }

    jump() {

    }

    update(deltaTime, keyboard, level) {
        this.isMoving = keyboard.RIGHT || keyboard.LEFT;

        if (keyboard.RIGHT) {
            this.otherDirection = false;
            this.moveRight(deltaTime);
        }

        if (keyboard.LEFT) {
            this.otherDirection = true;
            this.moveLeft(deltaTime);
        }

        if (this.x < 0) {
            this.x = 0;
        }

        if (this.x + this.width > level.levelEndX) {
            this.x = level.levelEndX - this.width;
        }
    }

    animate(deltaTime) {
        if (!this.isMoving) {
            this.img = this.imageCache[this.IMAGES_WALKING[0]];
            this.currentImage = 0;
            this.animationCounter = 0;
            this.wasMoving = false;
            return;
        }

        if (!this.wasMoving) {
            this.currentImage = 1;
            this.playAnimation(this.IMAGES_WALKING);
            this.animationCounter = 0;
            this.wasMoving = true;
            return;
        }

        if (this.isAnimationFrameDue(deltaTime)) {
            this.playAnimation(this.IMAGES_WALKING);
        }
    }
}