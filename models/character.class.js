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
    hurtAnimationDuration = 0.24;
    hurtMovementLockDuration = 0.18;
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

    walkingImages = [
        'img/character_pepe/2_walk/W-21.png',
        'img/character_pepe/2_walk/W-22.png',
        'img/character_pepe/2_walk/W-23.png',
        'img/character_pepe/2_walk/W-24.png',
        'img/character_pepe/2_walk/W-25.png',
        'img/character_pepe/2_walk/W-26.png',
    ];

    idleImages = [
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

    longIdleImages = [
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

    jumpingImages = [
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

    hurtImages = [
        'img/character_pepe/4_hurt/H-41.png',
        'img/character_pepe/4_hurt/H-42.png',
        'img/character_pepe/4_hurt/H-43.png',
    ];

    deadImages = [
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
        this.loadImage(this.idleImages[0]);
        this.loadImages(this.idleImages);
        this.loadImages(this.longIdleImages);
        this.loadImages(this.walkingImages);
        this.loadImages(this.jumpingImages);
        this.loadImages(this.hurtImages);
        this.loadImages(this.deadImages);
    }

    update(deltaTime, keyboard, level) {
        this.prepareFrameState(deltaTime, keyboard);

        if (this.shouldStopMovementUpdate()) {
            return;
        }

        this.updateHorizontalMovement(deltaTime, keyboard);
        this.handleJumpInput(keyboard);
        this.clampHorizontalPosition(level);
    }

    prepareFrameState(deltaTime, keyboard) {
        this.isMoving = keyboard.right || keyboard.left;
        this.didJumpThisFrame = false;
        this.applyGravity(deltaTime);
        this.updateIdleTime(deltaTime);
    }

    shouldStopMovementUpdate() {
        if (!this.isMovementBlocked()) {
            return false;
        }

        this.stopActiveMovementInputs();
        return true;
    }

    isMovementBlocked() {
        return this.isDead() || this.isHurtMovementLocked();
    }

    isHurtMovementLocked() {
        return this.isHurtAnimationActive();
    }

    getTimeSinceLastHit() {
        return (Date.now() - this.lastHit) / 1000;
    }

    stopActiveMovementInputs() {
        this.isMoving = false;
        this.jumpKeyPressed = false;
    }

    updateHorizontalMovement(deltaTime, keyboard) {
        if (keyboard.right) {
            this.moveRightWithFacing(deltaTime);
        }

        if (keyboard.left) {
            this.moveLeftWithFacing(deltaTime);
        }
    }

    moveRightWithFacing(deltaTime) {
        this.otherDirection = false;
        this.moveRight(deltaTime);
    }

    moveLeftWithFacing(deltaTime) {
        this.otherDirection = true;
        this.moveLeft(deltaTime);
    }

    clampHorizontalPosition(level) {
        let minX = level.playerMinX ?? 0;

        if (this.x < minX) {
            this.x = minX;
        }

        if (this.x + this.width > level.levelEndX) {
            this.x = level.levelEndX - this.width;
        }
    }

    handleJumpInput(keyboard) {
        let jumpKeyActive = keyboard.up || keyboard.space;

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

        if (!super.hit()) {
            return false;
        }

        this.resetDeathAnimationIfNeeded(wasDead);

        return true;
    }

    resetDeathAnimationIfNeeded(wasDead) {
        if (wasDead || !this.isDead()) {
            return;
        }

        this.currentImage = 0;
        this.animationCounter = 0;
        this.deathAnimationFinished = false;
    }

    animate(deltaTime) {
        if (this.animatePriorityStates(deltaTime)) {
            return;
        }

        this.animateWalkState(deltaTime);
    }

    animatePriorityStates(deltaTime) {
        return this.animateDeathState(deltaTime)
            || this.animateHurtState(deltaTime)
            || this.animateJumpState(deltaTime)
            || this.animateIdleState(deltaTime);
    }

    animateDeathState(deltaTime) {
        if (!this.isDead()) {
            return false;
        }

        this.wasMoving = false;
        this.setAnimationState('dead', this.deadImages);
        this.animateDeath(deltaTime);
        return true;
    }

    animateHurtState(deltaTime) {
        if (!this.isHurtAnimationActive()) {
            return false;
        }

        this.wasMoving = false;
        this.setAnimationState('hurt', this.hurtImages);
        this.playStateAnimation(deltaTime, this.hurtImages);
        return true;
    }

    isHurtAnimationActive() {
        if (!this.isHurt()) {
            return false;
        }

        return this.getTimeSinceLastHit() < this.hurtAnimationDuration;
    }

    animateJumpState(deltaTime) {
        if (!this.isAboveGround()) {
            return false;
        }

        this.wasMoving = false;
        this.setAnimationState('jump', this.jumpingImages);
        this.playStateAnimation(deltaTime, this.jumpingImages);
        return true;
    }

    animateIdleState(deltaTime) {
        if (this.isMoving) {
            return false;
        }

        this.wasMoving = false;
        this.animateIdleVariant(deltaTime);
        return true;
    }

    animateIdleVariant(deltaTime) {
        if (this.isLongIdleReady()) {
            this.playIdleAnimationVariant(deltaTime, 'long-idle', this.longIdleImages);
            return;
        }

        this.playIdleAnimationVariant(deltaTime, 'idle', this.idleImages);
    }

    isLongIdleReady() {
        return this.idleTime >= this.longIdleDelay;
    }

    isLongIdleActive() {
        return this.currentAnimationState === 'long-idle';
    }

    playIdleAnimationVariant(deltaTime, state, frames) {
        this.setAnimationState(state, frames);
        this.playStateAnimation(deltaTime, frames);
    }

    animateWalkState(deltaTime) {
        this.setAnimationState('walk', this.walkingImages);
        this.wasMoving = true;

        this.playStateAnimation(deltaTime, this.walkingImages);
    }

    playStateAnimation(deltaTime, frames) {
        if (!this.isAnimationFrameDue(deltaTime)) {
            return;
        }

        this.playAnimation(frames);
    }

    setAnimationState(state, frames = null) {
        if (this.currentAnimationState === state) {
            return;
        }

        this.currentAnimationState = state;
        this.animationFps = this.animationSpeeds[state] || 10;
        this.currentImage = 0;
        this.animationCounter = 0;

        if (frames) {
            this.img = this.imageCache[frames[0]];
            this.currentImage = 1;
        }
    }

    animateDeath(deltaTime) {
        if (this.isDeathAnimationComplete()) {
            this.showFinalDeathFrame();
            return;
        }

        if (this.tryAnimateDeathFrame(deltaTime)) {
            return;
        }

        this.finishDeathAnimation();
    }

    isDeathAnimationComplete() {
        return this.deathAnimationFinished;
    }

    tryAnimateDeathFrame(deltaTime) {
        if (!this.isAnimationFrameDue(deltaTime) || !this.hasRemainingDeathFrames()) {
            return false;
        }

        this.showNextDeathFrame();
        return true;
    }

    hasRemainingDeathFrames() {
        return this.currentImage < this.deadImages.length;
    }

    showNextDeathFrame() {
        this.img = this.imageCache[this.deadImages[this.currentImage]];
        this.currentImage++;
    }

    finishDeathAnimation() {
        this.deathAnimationFinished = true;
        this.showFinalDeathFrame();
    }

    showFinalDeathFrame() {
        this.img = this.imageCache[this.deadImages[this.deadImages.length - 1]];
    }
}