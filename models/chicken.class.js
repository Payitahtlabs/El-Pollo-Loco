/**
 * Represents a standard ground enemy that patrols from right to left.
 */
class Chicken extends MovableObject {
	y = 370;
	height = 60;
	width = 60;
	isDefeated = false;
	defeatDuration = 0.35;
	defeatedAt = 0;

	walkingImages = [
		'img/enemies_chicken/chicken_normal/1_walk/1_w.png',
		'img/enemies_chicken/chicken_normal/1_walk/2_w.png',
		'img/enemies_chicken/chicken_normal/1_walk/3_w.png',
	];

	deadImage = 'img/enemies_chicken/chicken_normal/2_dead/dead.png';

	animationFps = 12;

	/**
	 * Creates a chicken enemy with an optional starting x position.
	 *
	 * @param {number} [x=200 + Math.random() * 800] Horizontal spawn position.
	 */
	constructor(x = 200 + Math.random() * 800) {
		super();
		this.loadImage(this.walkingImages[0]);
		this.loadImages(this.walkingImages);
		this.loadImages([this.deadImage]);
		this.x = x;
		this.setRandomSpeed();
	}

	setRandomSpeed() {
		this.speed = 40 + Math.random() * 80;
	}

	/**
	 * Moves the chicken and respawns it beyond the level end when it leaves the screen.
	 *
	 * @param {number} deltaTime Time since the previous frame in seconds.
	 * @param {number} levelEndX Horizontal end of the level.
	 * @returns {void}
	 */
	update(deltaTime, levelEndX) {
		if (this.isDefeated) return;

		this.moveLeft(deltaTime);

		if (this.x + this.width < 0) {
			this.x = levelEndX + Math.random() * 600;
			this.setRandomSpeed();
		}
	}

	/**
	 * Updates the visible chicken sprite for the current frame.
	 *
	 * @param {number} deltaTime Time since the previous frame in seconds.
	 * @returns {void}
	 */
	animate(deltaTime) {
		if (this.isDefeated) {
			this.img = this.imageCache[this.deadImage];
			return;
		}

		if (this.isAnimationFrameDue(deltaTime)) {
			this.playAnimation(this.walkingImages);
		}
	}

	/**
	 * Marks the chicken as defeated and swaps to its dead sprite.
	 *
	 * @returns {void}
	 */
	stomp() {
		if (this.isDefeated) return;

		this.isDefeated = true;
		this.defeatedAt = Date.now();
		this.speed = 0;
		this.img = this.imageCache[this.deadImage];
	}

	/**
	 * Determines when a defeated chicken can be removed from the level.
	 *
	 * @returns {boolean} True once the defeat display duration has elapsed.
	 */
	shouldRemove() {
		return this.isDefeated && (Date.now() - this.defeatedAt) / 1000 >= this.defeatDuration;
	}
}