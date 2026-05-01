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

    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.loadImage(this.images[0]);
        this.loadImages(this.images);
    }

    animate(deltaTime) {
        if (this.isAnimationFrameDue(deltaTime)) {
            this.playAnimation(this.images);
        }
    }
}
