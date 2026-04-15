class Endboss extends MovableObject {
    x = 2500;
    y = 55;
    width = 250;
    height = 400;
    animationFps = 7;
    offset = {
        top: 70,
        right: 20,
        bottom: 30,
        left: 20,
    };

    IMAGES_ALERT = [
        'img/4_enemie_boss_chicken/2_alert/G5.png',
        'img/4_enemie_boss_chicken/2_alert/G6.png',
        'img/4_enemie_boss_chicken/2_alert/G7.png',
        'img/4_enemie_boss_chicken/2_alert/G8.png',
        'img/4_enemie_boss_chicken/2_alert/G9.png',
        'img/4_enemie_boss_chicken/2_alert/G10.png',
        'img/4_enemie_boss_chicken/2_alert/G11.png',
        'img/4_enemie_boss_chicken/2_alert/G12.png',
    ];

    IMAGES_HURT = [
        'img/4_enemie_boss_chicken/4_hurt/G21.png',
        'img/4_enemie_boss_chicken/4_hurt/G22.png',
        'img/4_enemie_boss_chicken/4_hurt/G23.png',
    ];

    constructor() {
        super();
        this.loadImage(this.IMAGES_ALERT[0]);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_HURT);
    }

    hit() {
        if (this.isHurt()) return;

        super.hit();
        this.currentImage = 0;
        this.animationCounter = 0;
    }

    animate(deltaTime) {
        if (this.isHurt()) {
            if (this.isAnimationFrameDue(deltaTime)) {
                this.playAnimation(this.IMAGES_HURT);
            }
            return;
        }

        if (this.isAnimationFrameDue(deltaTime)) {
            this.playAnimation(this.IMAGES_ALERT);
        }
    }
}