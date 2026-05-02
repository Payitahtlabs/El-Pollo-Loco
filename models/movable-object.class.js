/**
 * Extends drawable objects with movement, gravity, collision, and damage helpers.
 */
class MovableObject extends DrawableObject {
    groundY = 280;
    animationCounter = 0;
    animationFps = 10;
    speed = 0;
    speedY = 0;
    jumpStrength = 900;
    gravity = 2200;
    energy = 100;
    lastHit = 0;
    otherDirection = false;
    offset = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    };

    /**
     * Checks whether enough time has passed to advance the current animation.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {boolean} True when the next animation frame is due.
     */
    isAnimationFrameDue(deltaTime) {
        this.animationCounter += deltaTime;
        if (this.animationCounter >= 1 / this.animationFps) {
            this.animationCounter = 0;
            return true;
        }
        return false;
    }

    /**
     * Moves the object to the right.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    moveRight(deltaTime) {
        this.x += this.speed * deltaTime;
    }

    /**
     * Moves the object to the left.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    moveLeft(deltaTime) {
        this.x -= this.speed * deltaTime;
    }

    /**
     * Applies gravity and keeps the object aligned with the ground plane when needed.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    applyGravity(deltaTime) {
        if (this.shouldStayOnGround()) {
            this.landOnGround();
            return;
        }

        this.updateVerticalPosition(deltaTime);
        this.ensureGroundContact();
    }

    /**
     * Checks whether gravity should keep the object on the ground.
     *
     * @returns {boolean} True when the object should stay grounded.
     */
    shouldStayOnGround() {
        return !this.isAboveGround() && this.speedY >= 0;
    }

    /**
     * Snaps the object onto the ground plane.
     *
     * @returns {void}
     */
    landOnGround() {
        this.y = this.groundY;
        this.speedY = 0;
    }

    /**
     * Advances the vertical position using the current speed and gravity.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    updateVerticalPosition(deltaTime) {
        this.y += this.speedY * deltaTime;
        this.speedY += this.gravity * deltaTime;
    }

    /**
     * Ensures the object does not fall below its ground position.
     *
     * @returns {void}
     */
    ensureGroundContact() {
        if (this.y > this.groundY) {
            this.landOnGround();
        }
    }

    /**
     * Indicates whether the object is currently above the ground.
     *
     * @returns {boolean} True when the object is airborne.
     */
    isAboveGround() {
        return this.y < this.groundY;
    }

    /**
     * Starts a jump if the object is currently grounded.
     *
     * @returns {boolean} True when the jump was started.
     */
    jump() {
        if (this.isAboveGround()) {
            return false;
        }

        this.speedY = -this.jumpStrength;
        return true;
    }

    /**
     * Applies an upward bounce impulse.
     *
     * @param {number} [strength=600] Upward bounce strength.
     * @returns {void}
     */
    bounce(strength = 600) {
        this.speedY = -strength;
    }

    /**
     * Checks axis-aligned collision against another movable object using offsets.
     *
     * @param {MovableObject} otherObject Other object to test against.
     * @returns {boolean} True when both adjusted hitboxes overlap.
     */
    isColliding(otherObject) {
        return this.x + this.width - this.offset.right > otherObject.x + otherObject.offset.left &&
            this.y + this.height - this.offset.bottom > otherObject.y + otherObject.offset.top &&
            this.x + this.offset.left < otherObject.x + otherObject.width - otherObject.offset.right &&
            this.y + this.offset.top < otherObject.y + otherObject.height - otherObject.offset.bottom;
    }

    /**
     * Applies standard damage unless the object is still inside its hurt window.
     *
     * @returns {boolean} True when damage was applied.
     */
    hit() {
        if (this.isHurt()) return false;

        this.energy -= 20;
        if (this.energy < 0) {
            this.energy = 0;
        }

        this.lastHit = Date.now();
        return true;
    }

    /**
     * Indicates whether the object is still inside the post-hit hurt window.
     *
     * @returns {boolean} True while the hurt timer is active.
     */
    isHurt() {
        return (Date.now() - this.lastHit) / 1000 < 0.75;
    }

    /**
     * Indicates whether the object's energy is depleted.
     *
     * @returns {boolean} True when the object is dead.
     */
    isDead() {
        return this.energy <= 0;
    }
}
