class Chicken extends MovableObject {
	y = 370;
	height = 60;
	width = 60;

	IMAGES_WALKING = [
		'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
		'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
		'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png',
	];

	animationFps = 12;

	constructor() {
		super();
		this.loadImage(this.IMAGES_WALKING[0]);
		this.loadImages(this.IMAGES_WALKING);
		this.x = 200 + Math.random() * 800;
		this.setRandomSpeed();
	}

	setRandomSpeed() {
		this.speed = 40 + Math.random() * 80;
	}

	update(deltaTime, canvasWidth) {
		this.moveLeft(deltaTime);

		if (this.x + this.width < 0) {
			this.x = canvasWidth + Math.random() * 600;
			this.setRandomSpeed();
		}
	}

	animate(deltaTime) {
		if (this.isAnimationFrameDue(deltaTime)) {
			this.playAnimation(this.IMAGES_WALKING);
		}
	}
}