class Character extends MovableObject {

    x = 220;
    height = 280;
    y = 155;
    groundY = 155;
    speed = 240;
    isMoving = false;
    wasMoving = false;
    jumpKeyPressed = false;

    IMAGES_WALKING = [
        'img/2_character_pepe/2_walk/W-21.png',
        'img/2_character_pepe/2_walk/W-22.png',
        'img/2_character_pepe/2_walk/W-23.png',
        'img/2_character_pepe/2_walk/W-24.png',
        'img/2_character_pepe/2_walk/W-25.png',
        'img/2_character_pepe/2_walk/W-26.png',
    ];

    IMAGES_JUMPING = [
        'img/2_character_pepe/3_jump/J-31.png',
        'img/2_character_pepe/3_jump/J-32.png',
        'img/2_character_pepe/3_jump/J-33.png',
        'img/2_character_pepe/3_jump/J-34.png',
        'img/2_character_pepe/3_jump/J-35.png',
        'img/2_character_pepe/3_jump/J-36.png',
        'img/2_character_pepe/3_jump/J-37.png',
        'img/2_character_pepe/3_jump/J-38.png',
        'img/2_character_pepe/3_jump/J-39.png',
    ];

    constructor() {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
    }

    update(deltaTime, keyboard, level) {
        this.isMoving = keyboard.RIGHT || keyboard.LEFT;
        this.applyGravity(deltaTime);

        if (keyboard.RIGHT) {
            this.otherDirection = false;
            this.moveRight(deltaTime);
        }

        if (keyboard.LEFT) {
            this.otherDirection = true;
            this.moveLeft(deltaTime);
        }

        this.handleJumpInput(keyboard);

        if (this.x < 0) {
            this.x = 0;
        }

        if (this.x + this.width > level.levelEndX) {
            this.x = level.levelEndX - this.width;
        }
    }

    handleJumpInput(keyboard) {
        let jumpKeyActive = keyboard.UP || keyboard.SPACE;

        if (jumpKeyActive && !this.jumpKeyPressed) {
            this.jump();
        }

        this.jumpKeyPressed = jumpKeyActive;
    }

    animate(deltaTime) {
        if (this.isAboveGround()) {
            this.wasMoving = false;

            if (this.isAnimationFrameDue(deltaTime)) {
                this.playAnimation(this.IMAGES_JUMPING);
            }
            return;
        }

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