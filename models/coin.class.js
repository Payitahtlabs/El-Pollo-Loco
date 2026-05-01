/**
 * Represents an animated collectible coin.
 */
class Coin extends MovableObject {
    width = 120;
    height = 120;
    animationFps = 4;
    offset = {
        top: 35,
        right: 35,
        bottom: 35,
        left: 35,
    };

    images = [
        'img/coin/coin_1.png',
        'img/coin/coin_2.png',
    ];

    /**
     * Creates a coin at the given world position.
     *
     * @param {number} x Horizontal world position.
     * @param {number} y Vertical world position.
     */
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.loadImage(this.images[0]);
        this.loadImages(this.images);
    }

    /**
     * Advances the coin animation for the current frame.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    animate(deltaTime) {
        if (this.isAnimationFrameDue(deltaTime)) {
            this.playAnimation(this.images);
        }
    }
}
