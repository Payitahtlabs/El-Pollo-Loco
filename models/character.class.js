class Character extends MovableObject {

    x = 220;
    height = 280;
    y = 155;
    groundY = 155;
    speed = 240;
    isMoving = false;
    wasMoving = false;
    jumpKeyPressed = false;
    didJumpThisFrame = false;
    idleTime = 0;
    longIdleDelay = 10;
    currentAnimationState = 'walk';
    animationSpeeds = {
        walk: 10,
        idle: 5,
        'long-idle': 3,
        jump: 12,
        hurt: 8,
        dead: 7,
    };
    collectedCoins = 0;
    collectedBottles = 0;
    deathAnimationFinished = false;
    offset = {
        top: 100,
        right: 20,
        bottom: 10,
        left: 20,
    };

    IMAGES_WALKING = [
        'img/character_pepe/2_walk/W-21.png',
        'img/character_pepe/2_walk/W-22.png',
        'img/character_pepe/2_walk/W-23.png',
        'img/character_pepe/2_walk/W-24.png',
        'img/character_pepe/2_walk/W-25.png',
        'img/character_pepe/2_walk/W-26.png',
    ];

    IMAGES_IDLE = [
        'img/character_pepe/1_idle/idle/I-1.png',
        'img/character_pepe/1_idle/idle/I-2.png',
        'img/character_pepe/1_idle/idle/I-3.png',
        'img/character_pepe/1_idle/idle/I-4.png',
        'img/character_pepe/1_idle/idle/I-5.png',
        'img/character_pepe/1_idle/idle/I-6.png',
        'img/character_pepe/1_idle/idle/I-7.png',
        'img/character_pepe/1_idle/idle/I-8.png',
        'img/character_pepe/1_idle/idle/I-9.png',
        'img/character_pepe/1_idle/idle/I-10.png',
    ];

    IMAGES_LONG_IDLE = [
        'img/character_pepe/1_idle/long_idle/I-11.png',
        'img/character_pepe/1_idle/long_idle/I-12.png',
        'img/character_pepe/1_idle/long_idle/I-13.png',
        'img/character_pepe/1_idle/long_idle/I-14.png',
        'img/character_pepe/1_idle/long_idle/I-15.png',
        'img/character_pepe/1_idle/long_idle/I-16.png',
        'img/character_pepe/1_idle/long_idle/I-17.png',
        'img/character_pepe/1_idle/long_idle/I-18.png',
        'img/character_pepe/1_idle/long_idle/I-19.png',
        'img/character_pepe/1_idle/long_idle/I-20.png',
    ];

    IMAGES_JUMPING = [
        'img/character_pepe/3_jump/J-31.png',
        'img/character_pepe/3_jump/J-32.png',
        'img/character_pepe/3_jump/J-33.png',
        'img/character_pepe/3_jump/J-34.png',
        'img/character_pepe/3_jump/J-35.png',
        'img/character_pepe/3_jump/J-36.png',
        'img/character_pepe/3_jump/J-37.png',
        'img/character_pepe/3_jump/J-38.png',
        'img/character_pepe/3_jump/J-39.png',
    ];

    IMAGES_HURT = [
        'img/character_pepe/4_hurt/H-41.png',
        'img/character_pepe/4_hurt/H-42.png',
        'img/character_pepe/4_hurt/H-43.png',
    ];

    IMAGES_DEAD = [
        'img/character_pepe/5_dead/D-51.png',
        'img/character_pepe/5_dead/D-52.png',
        'img/character_pepe/5_dead/D-53.png',
        'img/character_pepe/5_dead/D-54.png',
        'img/character_pepe/5_dead/D-55.png',
        'img/character_pepe/5_dead/D-56.png',
        'img/character_pepe/5_dead/D-57.png',
    ];

    constructor() {
        super();
        this.loadImage(this.IMAGES_IDLE[0]);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
    }

    update(deltaTime, keyboard, level) {
        this.isMoving = keyboard.RIGHT || keyboard.LEFT;
        this.didJumpThisFrame = false;
        this.applyGravity(deltaTime);
        this.updateIdleTime(deltaTime);
        let minX = level.playerMinX ?? 0;

        if (this.isDead()) {
            this.isMoving = false;
            this.jumpKeyPressed = false;
            return;
        }

        if (keyboard.RIGHT) {
            this.otherDirection = false;
            this.moveRight(deltaTime);
        }

        if (keyboard.LEFT) {
            this.otherDirection = true;
            this.moveLeft(deltaTime);
        }

        this.handleJumpInput(keyboard);

        if (this.x < minX) {
            this.x = minX;
        }

        if (this.x + this.width > level.levelEndX) {
            this.x = level.levelEndX - this.width;
        }
    }

    handleJumpInput(keyboard) {
        let jumpKeyActive = keyboard.UP || keyboard.SPACE;

        if (jumpKeyActive && !this.jumpKeyPressed && this.jump()) {
            this.didJumpThisFrame = true;
        }

        this.jumpKeyPressed = jumpKeyActive;
    }

    updateIdleTime(deltaTime) {
        if (this.isMoving || this.isAboveGround() || this.isHurt() || this.isDead()) {
            this.idleTime = 0;
            return;
        }

        this.idleTime += deltaTime;
    }

    collectCoin() {
        this.collectedCoins++;
    }

    collectBottle() {
        this.collectedBottles++;
    }

    hasBottle() {
        return this.collectedBottles > 0;
    }

    throwBottle() {
        if (!this.hasBottle()) return false;

        this.collectedBottles--;
        return true;
    }

    hit() {
        let wasDead = this.isDead();
        let wasHit = super.hit();

        if (!wasHit) {
            return false;
        }

        if (!wasDead && this.isDead()) {
            this.currentImage = 0;
            this.animationCounter = 0;
            this.deathAnimationFinished = false;
        }

        return true;
    }

    animate(deltaTime) {
        if (this.isDead()) {
            this.wasMoving = false;
            this.setAnimationState('dead');
            this.animateDeath(deltaTime);
            return;
        }

        if (this.isHurt()) {
            this.wasMoving = false;
            this.setAnimationState('hurt');

            if (this.isAnimationFrameDue(deltaTime)) {
                this.playAnimation(this.IMAGES_HURT);
            }
            return;
        }

        if (this.isAboveGround()) {
            this.wasMoving = false;
            this.setAnimationState('jump');

            if (this.isAnimationFrameDue(deltaTime)) {
                this.playAnimation(this.IMAGES_JUMPING);
            }
            return;
        }

        if (!this.isMoving) {
            this.wasMoving = false;

            if (this.idleTime >= this.longIdleDelay) {
                this.setAnimationState('long-idle');

                if (this.isAnimationFrameDue(deltaTime)) {
                    this.playAnimation(this.IMAGES_LONG_IDLE);
                }
                return;
            }

            this.setAnimationState('idle');

            if (this.isAnimationFrameDue(deltaTime)) {
                this.playAnimation(this.IMAGES_IDLE);
            }
            return;
        }

        this.setAnimationState('walk');
        this.wasMoving = true;

        if (this.isAnimationFrameDue(deltaTime)) {
            this.playAnimation(this.IMAGES_WALKING);
        }
    }

    setAnimationState(state) {
        if (this.currentAnimationState === state) {
            return;
        }

        this.currentAnimationState = state;
        this.animationFps = this.animationSpeeds[state] || 10;
        this.currentImage = 0;
        this.animationCounter = 0;
    }

    animateDeath(deltaTime) {
        if (this.deathAnimationFinished) {
            this.img = this.imageCache[this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]];
            return;
        }

        if (!this.isAnimationFrameDue(deltaTime)) {
            return;
        }

        if (this.currentImage < this.IMAGES_DEAD.length) {
            this.img = this.imageCache[this.IMAGES_DEAD[this.currentImage]];
            this.currentImage++;
            return;
        }

        this.deathAnimationFinished = true;
        this.img = this.imageCache[this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]];
    }
}