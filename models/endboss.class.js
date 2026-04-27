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
        if (this.isHurt()) return false;

        super.hit();
        this.resetCombatPhase();
        this.attackCooldownTimer = this.attackCooldownDuration;
        this.currentImage = 0;
        return true;
    }

    update(deltaTime, character, bossFightStarted) {
        if (!bossFightStarted || this.isDead()) {
            return;
        }

        this.updateCombatTimers(deltaTime);

        if (this.isHurt()) {
            return;
        }

        if (this.isAttacking()) {
            this.x += this.getFacingDirection() * this.attackSpeed * deltaTime;
            return;
        }

        this.updateFacingDirection(character);

        if (this.isRetreating()) {
            this.x -= this.getFacingDirection() * this.retreatSpeed * deltaTime;
            return;
        }

        if (this.isWindingUp()) {
            return;
        }

        if (this.canStartAttack(character)) {
            this.startWindup();
            return;
        }

        if (this.shouldMoveTowardsCharacter(character)) {
            this.moveTowardsCharacter(deltaTime);
        }
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

    canStartAttack(character) {
        return !this.isInAttackCooldown() && this.getDistanceToCharacter(character) <= this.attackTriggerRange;
    }

    shouldMoveTowardsCharacter(character) {
        return this.getDistanceToCharacter(character) > this.attackTriggerRange;
    }

    startWindup() {
        this.combatPhase = 'windup';
        this.phaseTimer = this.windupDuration;
        this.currentImage = 0;
        this.animationCounter = 0;
    }

    updateCombatTimers(deltaTime) {
        if (this.attackCooldownTimer > 0) {
            this.attackCooldownTimer = Math.max(0, this.attackCooldownTimer - deltaTime);
        }

        if (this.phaseTimer <= 0) {
            return;
        }

        this.phaseTimer = Math.max(0, this.phaseTimer - deltaTime);

        if (this.phaseTimer === 0) {
            this.advanceCombatPhase();
        }
    }

    advanceCombatPhase() {
        if (this.isWindingUp()) {
            this.combatPhase = 'attack';
            this.phaseTimer = this.attackDuration;
            this.currentImage = 0;
            this.animationCounter = 0;
            return;
        }

        if (this.combatPhase === 'attack') {
            this.combatPhase = 'retreat';
            this.phaseTimer = this.retreatDuration;
            return;
        }

        if (this.isRetreating()) {
            this.resetCombatPhase();
            this.attackCooldownTimer = this.attackCooldownDuration;
        }
    }

    resetCombatPhase() {
        this.combatPhase = 'idle';
        this.phaseTimer = 0;
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

    getDistanceToCharacter(character) {
        let characterLeft = character.x + character.offset.left;
        let characterRight = character.x + character.width - character.offset.right;
        let bossLeft = this.x + this.offset.left;
        let bossRight = this.x + this.width - this.offset.right;

        if (characterRight < bossLeft) {
            return bossLeft - characterRight;
        }

        if (characterLeft > bossRight) {
            return characterLeft - bossRight;
        }

        return 0;
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
        if (this.isAttacking()) return 'attack';
        if (this.isRetreating()) return 'walk';
        if (this.isWindingUp() || this.isInAttackCooldown()) return 'alert';
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