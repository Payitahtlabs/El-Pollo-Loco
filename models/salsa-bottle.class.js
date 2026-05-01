/**
 * Represents a collectible salsa bottle lying on the ground or popping into place after a drop.
 */
class SalsaBottle extends MovableObject {
    width = 80;
    height = 100;
    groundY = 330;
    dropPopStrength = 520;
    dropGravity = 1800;
    isDropping = false;
    offset = {
        top: 10,
        right: 20,
        bottom: 10,
        left: 20,
    };

    groundImages = [
        'img/salsa_bottle/1_salsa_bottle_on_ground.png',
        'img/salsa_bottle/2_salsa_bottle_on_ground.png',
    ];

    /**
     * Creates a ground bottle at the given world position.
     *
     * @param {number} x Horizontal world position.
     * @param {number} [y=330] Vertical world position.
     */
    constructor(x, y = 330) {
        super();
        this.x = x;
        this.y = y;
        this.loadImage(this.getRandomGroundImage());
    }

    getRandomGroundImage() {
        let randomIndex = Math.floor(Math.random() * this.groundImages.length);
        return this.groundImages[randomIndex];
    }

    /**
     * Starts the short pop-in motion used when a bottle drops from a defeated enemy.
     *
     * @returns {void}
     */
    startDropEffect() {
        this.y = this.groundY;
        this.speedY = -this.dropPopStrength;
        this.gravity = this.dropGravity;
        this.isDropping = true;
    }

    /**
     * Updates the temporary drop motion until the bottle settles on the ground again.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    update(deltaTime) {
        if (!this.isDropping) {
            return;
        }

        this.applyGravity(deltaTime);

        if (!this.isAboveGround() && this.speedY === 0) {
            this.y = this.groundY;
            this.isDropping = false;
        }
    }
}