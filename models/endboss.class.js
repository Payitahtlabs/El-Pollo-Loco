class Endboss extends MovableObject {
    x = 2500;
    y = 55;
    width = 250;
    height = 400;
    speed = 110;
    animationFps = 7;
    attackRange = 40;
    currentState = 'alert';
    deathAnimationFinished = false;
    offset = {
        top: 70,
        right: 20,
        bottom: 30,
        left: 20,
    };

    IMAGES_ALERT = [
        'img/endboss_chicken/2_alert/G5.png',
        'img/endboss_chicken/2_alert/G6.png',
        'img/endboss_chicken/2_alert/G7.png',
        'img/endboss_chicken/2_alert/G8.png',
        'img/endboss_chicken/2_alert/G9.png',
        'img/endboss_chicken/2_alert/G10.png',
        'img/endboss_chicken/2_alert/G11.png',
        'img/endboss_chicken/2_alert/G12.png',
    ];

    IMAGES_WALKING = [
        'img/endboss_chicken/1_walk/G1.png',
        'img/endboss_chicken/1_walk/G2.png',
        'img/endboss_chicken/1_walk/G3.png',
        'img/endboss_chicken/1_walk/G4.png',
    ];

    IMAGES_ATTACK = [
        'img/endboss_chicken/3_attack/G13.png',
        'img/endboss_chicken/3_attack/G14.png',
        'img/endboss_chicken/3_attack/G15.png',
        'img/endboss_chicken/3_attack/G16.png',
        'img/endboss_chicken/3_attack/G17.png',
        'img/endboss_chicken/3_attack/G18.png',
        'img/endboss_chicken/3_attack/G19.png',
        'img/endboss_chicken/3_attack/G20.png',
    ];

    IMAGES_HURT = [
        'img/endboss_chicken/4_hurt/G21.png',
        'img/endboss_chicken/4_hurt/G22.png',
        'img/endboss_chicken/4_hurt/G23.png',
    ];

    IMAGES_DEAD = [
        'img/endboss_chicken/5_dead/G24.png',
        'img/endboss_chicken/5_dead/G25.png',
        'img/endboss_chicken/5_dead/G26.png',
    ];

    constructor() {
        super();
        this.loadImage(this.IMAGES_ALERT[0]);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
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

        if (this.getHorizontalGapToCharacter(character) > 0) {
            this.moveLeft(deltaTime);
        }
    }

    isAttacking(character) {
        return this.getHorizontalGapToCharacter(character) <= this.attackRange;
    }

    getHorizontalGapToCharacter(character) {
        let characterFront = character.x + character.width - character.offset.right;
        let bossFront = this.x + this.offset.left;
        return bossFront - characterFront;
    }

    animate(deltaTime, bossFightStarted, character) {
        let nextState = this.resolveState(bossFightStarted, character);
        if (this.currentState !== nextState) {
            this.currentState = nextState;
            this.currentImage = 0;
            this.animationCounter = 0;
        }

        if (this.currentState === 'dead') {
            this.animateDeath(deltaTime);
            return;
        }

        if (this.isAnimationFrameDue(deltaTime)) {
            this.playAnimation(this.getAnimationFramesForState());
        }
    }

    resolveState(bossFightStarted, character) {
        if (this.isDead()) return 'dead';
        if (this.isHurt()) return 'hurt';
        if (!bossFightStarted) return 'alert';
        if (this.isAttacking(character)) return 'attack';
        return 'walk';
    }

    animateDeath(deltaTime) {
        if (this.deathAnimationFinished) {
            this.img = this.imageCache[this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]];
            return;
        }

        if (!this.isAnimationFrameDue(deltaTime)) {
            return;
        }

        if (this.currentImage < this.IMAGES_DEAD.length) {
            this.img = this.imageCache[this.IMAGES_DEAD[this.currentImage]];
            this.currentImage++;
            return;
        }

        this.deathAnimationFinished = true;
        this.img = this.imageCache[this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]];
    }

    getAnimationFramesForState() {
        switch (this.currentState) {
            case 'dead':
                return this.IMAGES_DEAD;
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