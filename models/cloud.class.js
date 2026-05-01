class Cloud extends MovableObject {
    height = 250;
    width = 500;
    speed = 12;

    images = [
        'img/background/layers/4_clouds/1.png',
        'img/background/layers/4_clouds/2.png',
    ];

    constructor(x = 0, y = 20, speed = 12) {
        super();
        this.loadImage(this.getRandomImage());
        this.x = x;
        this.y = y;
        this.speed = speed;
    }

    update(deltaTime, levelEndX) {
        this.moveLeft(deltaTime);

        if (this.x + this.width < 0) {
            this.x = levelEndX + Math.random() * 400;
            this.y = 8 + Math.random() * 40;
            this.speed = 10 + Math.random() * 10;
            this.loadImage(this.getRandomImage());
        }
    }

    getRandomImage() {
        let randomIndex = Math.floor(Math.random() * this.images.length);
        return this.images[randomIndex];
    }
}