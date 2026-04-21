class SalsaBottle extends MovableObject {
    width = 80;
    height = 100;
    groundY = 330;
    dropPopStrength = 520;
    dropGravity = 1800;
    isDropping = false;
    offset = {
        top: 10,
        right: 20,
        bottom: 10,
        left: 20,
    };

    IMAGES_GROUND = [
        'img/salsa_bottle/1_salsa_bottle_on_ground.png',
        'img/salsa_bottle/2_salsa_bottle_on_ground.png',
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

    startDropEffect() {
        this.y = this.groundY;
        this.speedY = -this.dropPopStrength;
        this.gravity = this.dropGravity;
        this.isDropping = true;
    }

    update(deltaTime) {
        if (!this.isDropping) {
            return;
        }

        this.applyGravity(deltaTime);

        if (!this.isAboveGround() && this.speedY === 0) {
            this.y = this.groundY;
            this.isDropping = false;
        }
    }
}