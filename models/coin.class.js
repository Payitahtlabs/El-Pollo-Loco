class Coin extends MovableObject {
    width = 120;
    height = 120;
    animationFps = 4;

    IMAGES = [
        'img/8_coin/coin_1.png',
        'img/8_coin/coin_2.png',
    ];

    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.loadImage(this.IMAGES[0]);
        this.loadImages(this.IMAGES);
    }

    animate(deltaTime) {
        if (this.isAnimationFrameDue(deltaTime)) {
            this.playAnimation(this.IMAGES);
        }
    }
}
