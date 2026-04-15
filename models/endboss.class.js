class Endboss extends MovableObject {
    x = 2500;
    y = 55;
    width = 250;
    height = 400;
    speed = 110;
    animationFps = 7;
    attackRange = 120;
    currentState = 'alert';
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

    IMAGES_WALKING = [
        'img/4_enemie_boss_chicken/1_walk/G1.png',
        'img/4_enemie_boss_chicken/1_walk/G2.png',
        'img/4_enemie_boss_chicken/1_walk/G3.png',
        'img/4_enemie_boss_chicken/1_walk/G4.png',
    ];

    IMAGES_ATTACK = [
        'img/4_enemie_boss_chicken/3_attack/G13.png',
        'img/4_enemie_boss_chicken/3_attack/G14.png',
        'img/4_enemie_boss_chicken/3_attack/G15.png',
        'img/4_enemie_boss_chicken/3_attack/G16.png',
        'img/4_enemie_boss_chicken/3_attack/G17.png',
        'img/4_enemie_boss_chicken/3_attack/G18.png',
        'img/4_enemie_boss_chicken/3_attack/G19.png',
        'img/4_enemie_boss_chicken/3_attack/G20.png',
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
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
    }

    hit() {
        if (this.isHurt()) return;

        super.hit();
        this.currentImage = 0;
        this.animationCounter = 0;
    }

    update(deltaTime, character, bossFightStarted) {
        if (!bossFightStarted || this.isHurt() || this.isDead()) {
            return;
        }

        if (this.isAttacking(character)) {
            return;
        }

        let distanceToCharacter = this.x - character.x;
        if (distanceToCharacter > 140) {
            this.moveLeft(deltaTime);
        }
    }

    isAttacking(character) {
        let characterFront = character.x + character.width - character.offset.right;
        return this.x - characterFront <= this.attackRange;
    }

    animate(deltaTime, bossFightStarted, character) {
        let nextState = this.resolveState(bossFightStarted, character);
        if (this.currentState !== nextState) {
            this.currentState = nextState;
            this.currentImage = 0;
            this.animationCounter = 0;
        }

        if (this.isAnimationFrameDue(deltaTime)) {
            this.playAnimation(this.getAnimationFramesForState());
        }
    }

    resolveState(bossFightStarted, character) {
        if (this.isHurt()) return 'hurt';
        if (!bossFightStarted) return 'alert';
        if (this.isAttacking(character)) return 'attack';
        return 'walk';
    }

    getAnimationFramesForState() {
        switch (this.currentState) {
            case 'hurt':
                return this.IMAGES_HURT;
            case 'attack':
                return this.IMAGES_ATTACK;
            case 'walk':
                return this.IMAGES_WALKING;
            default:
                return this.IMAGES_ALERT;
        }
    }
}