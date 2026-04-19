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

    IMAGES_ROTATION = [
        'img/salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        'img/salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        'img/salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        'img/salsa_bottle/bottle_rotation/4_bottle_rotation.png',
    ];

    IMAGES_SPLASH = [
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
        this.loadImage(this.IMAGES_ROTATION[0]);
        this.loadImages(this.IMAGES_ROTATION);
        this.loadImages(this.IMAGES_SPLASH);
        this.speedY = -900;
    }

    update(deltaTime) {
        if (this.isSplashing) {
            this.animateSplash(deltaTime);
            return;
        }

        if (this.throwToLeft) {
            this.moveLeft(deltaTime);
        } else {
            this.moveRight(deltaTime);
        }

        this.applyGravity(deltaTime);

        if (this.isAnimationFrameDue(deltaTime)) {
            this.playAnimation(this.IMAGES_ROTATION);
        }

        if ((!this.isAboveGround() || this.y >= this.groundY) && this.speedY >= 0) {
            this.startSplash();
        }
    }

    animateSplash(deltaTime) {
        if (this.isAnimationFrameDue(deltaTime)) {
            this.playAnimation(this.IMAGES_SPLASH);
        }
    }

    startSplash() {
        if (this.isSplashing) return;

        this.isSplashing = true;
        this.splashStartedAt = Date.now();
        this.currentImage = 0;
        this.animationCounter = 0;
        this.img = this.imageCache[this.IMAGES_SPLASH[0]];
    }

    shouldRemove() {
        if (this.isSplashing) {
            return (Date.now() - this.splashStartedAt) / 1000 >= this.splashDuration;
        }

        return this.x + this.width < -200 || this.x > 3200;
    }
}