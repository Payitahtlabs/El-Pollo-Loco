class Character extends MovableObject {

    height = 280;
    y = 155;
    speed = 240;
    isMoving = false;

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

    update(deltaTime, keyboard, canvasWidth) {
        this.isMoving = keyboard.RIGHT || keyboard.LEFT;

        if (keyboard.RIGHT) {
            this.moveRight(deltaTime);
        }

        if (keyboard.LEFT) {
            this.moveLeft(deltaTime);
        }

        if (this.x < 0) {
            this.x = 0;
        }

        if (this.x + this.width > canvasWidth) {
            this.x = canvasWidth - this.width;
        }
    }

    animate(deltaTime) {
        if (!this.isMoving) {
            this.img = this.imageCache[this.IMAGES_WALKING[0]];
            return;
        }

        if (this.isAnimationFrameDue(deltaTime)) {
            this.playAnimation(this.IMAGES_WALKING);
        }
    }
}