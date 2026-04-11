class MovableObject {
    x = 120;
	y = 280;
    groundY = 280;
    height = 150;
    width = 100;
    img;
    imageCache = {};
    currentImage = 0;
    animationCounter = 0;
    animationFps = 10;
    speed = 0;
    speedY = 0;
    jumpStrength = 900;
    gravity = 2200;
    otherDirection = false;

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    playAnimation(images) {
        let i = this.currentImage % images.length;
        this.img = this.imageCache[images[i]];
        this.currentImage++;
    }

    isAnimationFrameDue(deltaTime) {
        this.animationCounter += deltaTime;
        if (this.animationCounter >= 1 / this.animationFps) {
            this.animationCounter = 0;
            return true;
        }
        return false;
    }

    moveRight(deltaTime) {
        this.x += this.speed * deltaTime;
    }

    moveLeft(deltaTime) {
        this.x -= this.speed * deltaTime;
    }

    applyGravity(deltaTime) {
        if (!this.isAboveGround() && this.speedY >= 0) {
            this.y = this.groundY;
            this.speedY = 0;
            return;
        }

        this.y += this.speedY * deltaTime;
        this.speedY += this.gravity * deltaTime;

        if (this.y > this.groundY) {
            this.y = this.groundY;
            this.speedY = 0;
        }
    }

    isAboveGround() {
        return this.y < this.groundY;
    }

    jump() {
        if (this.isAboveGround()) return;
        this.speedY = -this.jumpStrength;
    }
}
