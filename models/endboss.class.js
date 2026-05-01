class Endboss extends MovableObject {
    x = 2500;
    y = 55;
    width = 250;
    height = 400;
    speed = 110;
    animationFps = 7;
    attackTriggerRange = 65;
    attackSpeed = 260;
    retreatSpeed = 140;
    turnThreshold = 20;
    windupDuration = 0.45;
    attackDuration = 0.65;
    retreatDuration = 0.35;
    attackCooldownDuration = 0.9;
    currentState = 'alert';
    combatPhase = 'idle';
    phaseTimer = 0;
    attackCooldownTimer = 0;
    pendingAudioEvents = [];
    deathAnimationFinished = false;
    offset = {
        top: 70,
        right: 20,
        bottom: 30,
        left: 20,
    };

    alertImages = [
        'img/endboss_chicken/2_alert/G5.png',
        'img/endboss_chicken/2_alert/G6.png',
        'img/endboss_chicken/2_alert/G7.png',
        'img/endboss_chicken/2_alert/G8.png',
        'img/endboss_chicken/2_alert/G9.png',
        'img/endboss_chicken/2_alert/G10.png',
        'img/endboss_chicken/2_alert/G11.png',
        'img/endboss_chicken/2_alert/G12.png',
    ];

    walkingImages = [
        'img/endboss_chicken/1_walk/G1.png',
        'img/endboss_chicken/1_walk/G2.png',
        'img/endboss_chicken/1_walk/G3.png',
        'img/endboss_chicken/1_walk/G4.png',
    ];

    attackImages = [
        'img/endboss_chicken/3_attack/G13.png',
        'img/endboss_chicken/3_attack/G14.png',
        'img/endboss_chicken/3_attack/G15.png',
        'img/endboss_chicken/3_attack/G16.png',
        'img/endboss_chicken/3_attack/G17.png',
        'img/endboss_chicken/3_attack/G18.png',
        'img/endboss_chicken/3_attack/G19.png',
        'img/endboss_chicken/3_attack/G20.png',
    ];

    hurtImages = [
        'img/endboss_chicken/4_hurt/G21.png',
        'img/endboss_chicken/4_hurt/G22.png',
        'img/endboss_chicken/4_hurt/G23.png',
    ];

    deadImages = [
        'img/endboss_chicken/5_dead/G24.png',
        'img/endboss_chicken/5_dead/G25.png',
        'img/endboss_chicken/5_dead/G26.png',
    ];

    constructor() {
        super();
        this.loadImage(this.alertImages[0]);
        this.loadImages(this.alertImages);
        this.loadImages(this.walkingImages);
        this.loadImages(this.attackImages);
        this.loadImages(this.hurtImages);
        this.loadImages(this.deadImages);
    }

    hit() {
        if (this.isHurt()) return false;

        super.hit();
        this.resetCombatPhase();
        this.attackCooldownTimer = this.attackCooldownDuration;
        this.currentImage = 0;
        this.emitAudioEvent(this.isDead() ? 'death' : 'hurt');
        return true;
    }

    isAttacking() {
        return this.combatPhase === 'attack';
    }

    isWindingUp() {
        return this.combatPhase === 'windup';
    }

    isRetreating() {
        return this.combatPhase === 'retreat';
    }

    isInAttackCooldown() {
        return this.attackCooldownTimer > 0;
    }

    startWindup() {
        this.combatPhase = 'windup';
        this.phaseTimer = this.windupDuration;
        this.currentImage = 0;
        this.animationCounter = 0;
    }

    resetCombatPhase() {
        this.combatPhase = 'idle';
        this.phaseTimer = 0;
    }

    emitAudioEvent(eventName) {
        this.pendingAudioEvents.push(eventName);
    }

    consumeAudioEvents() {
        let events = [...this.pendingAudioEvents];
        this.pendingAudioEvents.length = 0;
        return events;
    }

    updateFacingDirection(character) {
        let characterCenter = character.x + character.width / 2;
        let bossCenter = this.x + this.width / 2;

        if (characterCenter > bossCenter + this.turnThreshold) {
            this.otherDirection = true;
            return;
        }

        if (characterCenter < bossCenter - this.turnThreshold) {
            this.otherDirection = false;
        }
    }

    moveTowardsCharacter(deltaTime) {
        this.x += this.getFacingDirection() * this.speed * deltaTime;
    }

    getFacingDirection() {
        return this.otherDirection ? 1 : -1;
    }

    getAnimationFramesForState() {
        switch (this.currentState) {
            case 'dead':
                return this.deadImages;
            case 'hurt':
                return this.hurtImages;
            case 'attack':
                return this.attackImages;
            case 'walk':
                return this.walkingImages;
            default:
                return this.alertImages;
        }
    }
}