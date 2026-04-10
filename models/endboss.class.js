class Endboss extends MovableObject {
    x = 2500;
    y = 55;
    width = 250;
    height = 400;
    animationFps = 7;

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

    constructor() {
        super();
        this.loadImage(this.IMAGES_ALERT[0]);
        this.loadImages(this.IMAGES_ALERT);
    }

    animate(deltaTime) {
        if (this.isAnimationFrameDue(deltaTime)) {
            this.playAnimation(this.IMAGES_ALERT);
        }
    }
}