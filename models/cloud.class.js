/**
 * Represents a drifting cloud that respawns ahead of the camera once it leaves the screen.
 */
class Cloud extends MovableObject {
    height = 250;
    width = 500;
    speed = 12;

    images = [
        'img/background/layers/4_clouds/1.png',
        'img/background/layers/4_clouds/2.png',
    ];

    /**
     * Creates a cloud with an optional position and movement speed.
     *
     * @param {number} [x=0] Horizontal world position.
     * @param {number} [y=20] Vertical world position.
     * @param {number} [speed=12] Horizontal drift speed.
     */
    constructor(x = 0, y = 20, speed = 12) {
        super();
        this.loadImage(this.getRandomImage());
        this.x = x;
        this.y = y;
        this.speed = speed;
    }

    /**
     * Advances the cloud and respawns it beyond the level end when it leaves the screen.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @param {number} levelEndX Horizontal end of the level.
     * @returns {void}
     */
    update(deltaTime, levelEndX) {
        this.moveLeft(deltaTime);

        if (this.x + this.width < 0) {
            this.x = levelEndX + Math.random() * 400;
            this.y = 8 + Math.random() * 40;
            this.speed = 10 + Math.random() * 10;
            this.loadImage(this.getRandomImage());
        }
    }

    /**
     * Chooses one of the available cloud sprites at random.
     *
     * @returns {string} Cloud image path.
     */
    getRandomImage() {
        let randomIndex = Math.floor(Math.random() * this.images.length);
        return this.images[randomIndex];
    }
}