class SmallChicken extends MovableObject {
    y = 380;
    height = 50;
    width = 50;
    animationFps = 14;
    isDefeated = false;
    defeatDuration = 0.35;
    defeatedAt = 0;

    walkingImages = [
        'img/enemies_chicken/chicken_small/1_walk/1_w.png',
        'img/enemies_chicken/chicken_small/1_walk/2_w.png',
        'img/enemies_chicken/chicken_small/1_walk/3_w.png',
    ];

    deadImage = 'img/enemies_chicken/chicken_small/2_dead/dead.png';

    constructor(x = 200 + Math.random() * 800) {
        super();
        this.loadImage(this.walkingImages[0]);
        this.loadImages(this.walkingImages);
        this.loadImages([this.deadImage]);
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
            this.img = this.imageCache[this.deadImage];
            return;
        }

        if (this.isAnimationFrameDue(deltaTime)) {
            this.playAnimation(this.walkingImages);
        }
    }

    stomp() {
        if (this.isDefeated) return;

        this.isDefeated = true;
        this.defeatedAt = Date.now();
        this.speed = 0;
        this.img = this.imageCache[this.deadImage];
    }

    shouldRemove() {
        return this.isDefeated && (Date.now() - this.defeatedAt) / 1000 >= this.defeatDuration;
    }
}
