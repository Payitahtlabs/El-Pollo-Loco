/**
 * Represents a thrown bottle that flies, splashes on impact, and removes itself afterwards.
 */
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

    /**
     * Creates a new thrown bottle instance.
     *
     * @param {number} x Horizontal spawn position.
     * @param {number} y Vertical spawn position.
     * @param {boolean} [throwToLeft=false] Whether the bottle travels to the left.
     */
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

    /**
     * Updates flight or splash behavior for the current frame.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
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

    /**
     * Starts the splash animation after an impact.
     *
     * @returns {boolean} True when the splash state was started.
     */
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

    /**
     * Determines when the thrown bottle can be removed from the world.
     *
     * @returns {boolean} True once the splash finished or the bottle left the valid bounds.
     */
    shouldRemove() {
        if (this.isSplashing) {
            return (Date.now() - this.splashStartedAt) / 1000 >= this.splashDuration;
        }

        return this.x + this.width < -200 || this.x > 3200;
    }
}