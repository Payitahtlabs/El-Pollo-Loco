class Cloud extends MovableObject {
    height = 250;
    width = 500;
    speed = 12;

    constructor(x = 0, y = 20, speed = 12) {
        super();
        this.loadImage('img/5_background/layers/4_clouds/1.png');
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
        }
    }
}