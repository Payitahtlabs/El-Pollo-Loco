class SmallChicken extends MovableObject {
    y = 380;
    height = 50;
    width = 50;
    animationFps = 14;
    isDefeated = false;
    defeatDuration = 0.35;
    defeatedAt = 0;

    IMAGES_WALKING = [
        'img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/3_w.png',
    ];

    IMAGE_DEAD = 'img/3_enemies_chicken/chicken_small/2_dead/dead.png';

    constructor(x = 200 + Math.random() * 800) {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages([this.IMAGE_DEAD]);
        this.x = x;
        this.setRandomSpeed();
    }

    setRandomSpeed() {
        this.speed = 70 + Math.random() * 70;
    }

    update(deltaTime, levelEndX) {
        if (this.isDefeated) return;

        this.moveLeft(deltaTime);

        if (this.x + this.width < 0) {
            this.x = levelEndX + Math.random() * 600;
            this.setRandomSpeed();
        }
    }

    animate(deltaTime) {
        if (this.isDefeated) {
            this.img = this.imageCache[this.IMAGE_DEAD];
            return;
        }

        if (this.isAnimationFrameDue(deltaTime)) {
            this.playAnimation(this.IMAGES_WALKING);
        }
    }

    stomp() {
        if (this.isDefeated) return;

        this.isDefeated = true;
        this.defeatedAt = Date.now();
        this.speed = 0;
        this.img = this.imageCache[this.IMAGE_DEAD];
    }

    shouldRemove() {
        return this.isDefeated && (Date.now() - this.defeatedAt) / 1000 >= this.defeatDuration;
    }
}
