class SalsaBottle extends MovableObject {
    width = 80;
    height = 100;

    IMAGES_GROUND = [
        'img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
        'img/6_salsa_bottle/2_salsa_bottle_on_ground.png',
    ];

    constructor(x, y = 330) {
        super();
        this.x = x;
        this.y = y;
        this.loadImage(this.getRandomGroundImage());
    }

    getRandomGroundImage() {
        let randomIndex = Math.floor(Math.random() * this.IMAGES_GROUND.length);
        return this.IMAGES_GROUND[randomIndex];
    }
}