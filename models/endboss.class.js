/**
 * Represents the endboss with combat state, facing decisions, and queued audio events.
 */
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
    frontalTurnDelay = 0.12;
    overtakeTurnDelay = 0.3;
    turnOvertakeDistance = 140;
    turnDecisionTimer = 0;
    pendingDirection = null;
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

    /**
     * Preloads all animation assets required by the endboss.
     */
    constructor() {
        super();
        this.loadImage(this.alertImages[0]);
        this.loadImages(this.alertImages);
        this.loadImages(this.walkingImages);
        this.loadImages(this.attackImages);
        this.loadImages(this.hurtImages);
        this.loadImages(this.deadImages);
    }

    /**
     * Applies damage, resets the current combat phase, and queues the matching boss audio event.
     *
     * @returns {boolean} True when the hit was applied.
     */
    hit() {
        if (this.isHurt()) return false;

        super.hit();
        this.resetCombatPhase();
        this.attackCooldownTimer = this.attackCooldownDuration;
        this.currentImage = 0;
        this.emitAudioEvent(this.isDead() ? 'death' : 'hurt');
        return true;
    }

    /**
     * Checks whether the boss is currently in the attack phase.
     *
     * @returns {boolean} True when the boss is attacking.
     */
    isAttacking() {
        return this.combatPhase === 'attack';
    }

    /**
     * Checks whether the boss is currently winding up an attack.
     *
     * @returns {boolean} True when the boss is in windup.
     */
    isWindingUp() {
        return this.combatPhase === 'windup';
    }

    /**
     * Checks whether the boss is currently retreating after an attack.
     *
     * @returns {boolean} True when the boss is retreating.
     */
    isRetreating() {
        return this.combatPhase === 'retreat';
    }

    /**
     * Checks whether the attack cooldown timer is still active.
     *
     * @returns {boolean} True while the attack cooldown is active.
     */
    isInAttackCooldown() {
        return this.attackCooldownTimer > 0;
    }

    /**
     * Starts the boss attack windup phase.
     *
     * @returns {void}
     */
    startWindup() {
        this.combatPhase = 'windup';
        this.phaseTimer = this.windupDuration;
        this.currentImage = 0;
        this.animationCounter = 0;
    }

    /**
     * Resets the active combat phase and its timer.
     *
     * @returns {void}
     */
    resetCombatPhase() {
        this.combatPhase = 'idle';
        this.phaseTimer = 0;
    }

    /**
     * Queues an endboss audio event for later playback.
     *
     * @param {string} eventName Boss audio event name.
     * @returns {void}
     */
    emitAudioEvent(eventName) {
        this.pendingAudioEvents.push(eventName);
    }

    /**
     * Returns and clears all queued boss audio events for the current frame.
     *
     * @returns {string[]} Pending audio event names.
     */
    consumeAudioEvents() {
        let events = [...this.pendingAudioEvents];
        this.pendingAudioEvents.length = 0;
        return events;
    }

    /**
     * Updates the boss facing direction with a small delayed turn decision.
     *
     * @param {Character} character Active player character.
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    updateFacingDirection(character, deltaTime) {
        let targetDirection = this.getTargetFacingDirection(character);

        if (this.shouldResetTurnDecision(targetDirection)) {
            this.resetTurnDecision();
            return;
        }

        this.progressTurnDecision(targetDirection, character, deltaTime);
    }

    /**
     * Checks whether a pending turn decision should be discarded.
     *
     * @param {?boolean} targetDirection Desired facing direction.
     * @returns {boolean} True when no turn is needed.
     */
    shouldResetTurnDecision(targetDirection) {
        return targetDirection === null || targetDirection === this.otherDirection;
    }

    /**
     * Resolves the desired facing direction relative to the character.
     *
     * @param {Character} character Active player character.
     * @returns {?boolean} Target direction or null when no turn is needed.
     */
    getTargetFacingDirection(character) {
        let characterCenter = character.x + character.width / 2;
        let bossCenter = this.x + this.width / 2;

        if (characterCenter > bossCenter + this.turnThreshold) {
            return true;
        }

        if (characterCenter < bossCenter - this.turnThreshold) {
            return false;
        }

        return null;
    }

    /**
     * Advances the delayed turn decision timer and applies it when ready.
     *
     * @param {boolean} targetDirection Desired facing direction.
     * @param {Character} character Active player character.
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    progressTurnDecision(targetDirection, character, deltaTime) {
        this.startTurnDecision(targetDirection);
        this.turnDecisionTimer += deltaTime;

        if (this.turnDecisionTimer < this.getTurnDelay(character)) {
            return;
        }

        this.applyTurnDecision(targetDirection);
    }

    /**
     * Starts or refreshes a pending turn decision.
     *
     * @param {boolean} targetDirection Desired facing direction.
     * @returns {void}
     */
    startTurnDecision(targetDirection) {
        if (this.pendingDirection === targetDirection) {
            return;
        }

        this.pendingDirection = targetDirection;
        this.turnDecisionTimer = 0;
    }

    /**
     * Resolves the turn delay for the current character approach.
     *
     * @param {Character} character Active player character.
     * @returns {number} Delay in seconds before the boss turns.
     */
    getTurnDelay(character) {
        if (this.isCharacterOvertaking(character)) {
            return this.overtakeTurnDelay;
        }

        return this.frontalTurnDelay;
    }

    /**
     * Checks whether the character is close enough to count as overtaking.
     *
     * @param {Character} character Active player character.
     * @returns {boolean} True when the character is overtaking the boss.
     */
    isCharacterOvertaking(character) {
        return this.getDistanceToCharacter(character) <= this.turnOvertakeDistance;
    }

    /**
     * Applies the resolved facing direction and clears pending turn state.
     *
     * @param {boolean} targetDirection Desired facing direction.
     * @returns {void}
     */
    applyTurnDecision(targetDirection) {
        this.otherDirection = targetDirection;
        this.resetTurnDecision();
    }

    /**
     * Clears the pending turn decision state.
     *
     * @returns {void}
     */
    resetTurnDecision() {
        this.pendingDirection = null;
        this.turnDecisionTimer = 0;
    }

    /**
     * Checks whether a delayed turn decision is currently pending.
     *
     * @returns {boolean} True when a turn decision is pending.
     */
    hasPendingTurnDecision() {
        return this.pendingDirection !== null;
    }

    /**
     * Moves the boss toward the character using its current facing direction.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    moveTowardsCharacter(deltaTime) {
        this.x += this.getFacingDirection() * this.speed * deltaTime;
    }

    /**
     * Resolves the signed horizontal direction the boss is facing.
     *
     * @returns {number} `1` for right-facing, `-1` for left-facing.
     */
    getFacingDirection() {
        return this.otherDirection ? 1 : -1;
    }

    /**
     * Resolves the image list for the current boss animation state.
     *
     * @returns {string[]} Animation frame paths for the active state.
     */
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