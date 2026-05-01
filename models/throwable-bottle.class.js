class ThrowableBottle extends MovableObject {
    width = 80;
    height = 80;
    groundY = 350;
    animationFps = 14;
    speed = 420;
    splashDuration = 0.35;
    isSplashing = false;
    splashStartedAt = 0;
    offset = {
        top: 12,
        right: 18,
        bottom: 12,
        left: 18,
    };

    rotationImages = [
        'img/salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        'img/salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        'img/salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        'img/salsa_bottle/bottle_rotation/4_bottle_rotation.png',
    ];

    splashImages = [
        'img/salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        'img/salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        'img/salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        'img/salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        'img/salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        'img/salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png',
    ];

    constructor(x, y, throwToLeft = false) {
        super();
        this.x = x;
        this.y = y;
        this.throwToLeft = throwToLeft;
        this.loadImage(this.rotationImages[0]);
        this.loadImages(this.rotationImages);
        this.loadImages(this.splashImages);
        this.speedY = -900;
    }

    update(deltaTime) {
        if (this.isSplashing) {
            this.animateSplash(deltaTime);
            return;
        }

        this.updateFlightMovement(deltaTime);
        this.updateFlightAnimation(deltaTime);
        this.checkGroundImpact();
    }

    updateFlightMovement(deltaTime) {
        if (this.throwToLeft) {
            this.moveLeft(deltaTime);
        } else {
            this.moveRight(deltaTime);
        }

        this.applyGravity(deltaTime);
    }

    updateFlightAnimation(deltaTime) {
        if (this.isAnimationFrameDue(deltaTime)) {
            this.playAnimation(this.rotationImages);
        }
    }

    checkGroundImpact() {
        if ((!this.isAboveGround() || this.y >= this.groundY) && this.speedY >= 0) {
            this.startSplash();
        }
    }

    animateSplash(deltaTime) {
        if (this.isAnimationFrameDue(deltaTime)) {
            this.playAnimation(this.splashImages);
        }
    }

    startSplash() {
        if (this.isSplashing) {
            return false;
        }

        this.isSplashing = true;
        this.splashStartedAt = Date.now();
        this.currentImage = 0;
        this.animationCounter = 0;
        this.img = this.imageCache[this.splashImages[0]];
        return true;
    }

    shouldRemove() {
        if (this.isSplashing) {
            return (Date.now() - this.splashStartedAt) / 1000 >= this.splashDuration;
        }

        return this.x + this.width < -200 || this.x > 3200;
    }
}