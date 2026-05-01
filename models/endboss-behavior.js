/**
 * Updates the active endboss combat logic for the current frame.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @param {Character} character Active player character.
 * @param {boolean} bossFightStarted Whether the boss encounter is active.
 * @returns {void}
 */
Endboss.prototype.update = function (deltaTime, character, bossFightStarted) {
    if (!this.shouldUpdateBehavior(bossFightStarted)) {
        return;
    }

    this.updateCombatTimers(deltaTime);

    if (this.shouldStopBehaviorUpdate()) {
        return;
    }

    this.updateActiveCombatBehavior(deltaTime, character);
};

Endboss.prototype.shouldUpdateBehavior = function (bossFightStarted) {
    return bossFightStarted && !this.isDead();
};

Endboss.prototype.updateActiveCombatBehavior = function (deltaTime, character) {
    this.updateFacingDirectionIfNeeded(character, deltaTime);

    if (this.shouldPauseCombatAction(deltaTime)) {
        return;
    }

    this.continueCombatAfterTurn(character, deltaTime);
};

/**
 * Continues the boss combat logic after turn decisions have been resolved.
 *
 * @param {Character} character Active player character.
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
Endboss.prototype.continueCombatAfterTurn = function (character, deltaTime) {
    if (this.hasPendingTurnDecision()) {
        return;
    }

    if (this.tryStartAttack(character)) {
        return;
    }

    this.moveTowardsCharacterIfNeeded(deltaTime, character);
};

Endboss.prototype.shouldPauseCombatAction = function (deltaTime) {
    return this.handleCombatMovement(deltaTime) || this.isWindingUp();
};

Endboss.prototype.shouldStopBehaviorUpdate = function () {
    return this.isHurt();
};

Endboss.prototype.updateFacingDirectionIfNeeded = function (character, deltaTime) {
    if (this.shouldFreezeFacingDirection()) {
        this.resetTurnDecision();
        return;
    }

    this.updateFacingDirection(character, deltaTime);
};

Endboss.prototype.shouldFreezeFacingDirection = function () {
    return this.isHurt() || this.isWindingUp();
};

Endboss.prototype.handleCombatMovement = function (deltaTime) {
    if (this.isAttacking()) {
        this.moveAttack(deltaTime);
        return true;
    }

    if (this.isRetreating()) {
        this.moveRetreat(deltaTime);
        return true;
    }

    return false;
};

Endboss.prototype.moveAttack = function (deltaTime) {
    this.x += this.getFacingDirection() * this.attackSpeed * deltaTime;
};

Endboss.prototype.moveRetreat = function (deltaTime) {
    this.x -= this.getFacingDirection() * this.retreatSpeed * deltaTime;
};

Endboss.prototype.canStartAttack = function (character) {
    return !this.isInAttackCooldown() && this.getDistanceToCharacter(character) <= this.attackTriggerRange;
};

Endboss.prototype.shouldMoveTowardsCharacter = function (character) {
    return this.getDistanceToCharacter(character) > this.attackTriggerRange;
};

Endboss.prototype.tryStartAttack = function (character) {
    if (!this.canStartAttack(character)) {
        return false;
    }

    this.startWindup();
    return true;
};

Endboss.prototype.moveTowardsCharacterIfNeeded = function (deltaTime, character) {
    if (!this.shouldMoveTowardsCharacter(character)) {
        return;
    }

    this.moveTowardsCharacter(deltaTime);
};

/**
 * Advances boss combat timers and phase transitions.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
Endboss.prototype.updateCombatTimers = function (deltaTime) {
    this.updateAttackCooldown(deltaTime);

    if (!this.hasActivePhaseTimer()) {
        return;
    }

    this.updatePhaseTimer(deltaTime);

    if (this.shouldAdvanceCombatPhase()) {
        this.advanceCombatPhase();
    }
};

Endboss.prototype.updateAttackCooldown = function (deltaTime) {
    if (this.attackCooldownTimer <= 0) {
        return;
    }

    this.attackCooldownTimer = Math.max(0, this.attackCooldownTimer - deltaTime);
};

Endboss.prototype.hasActivePhaseTimer = function () {
    return this.phaseTimer > 0;
};

Endboss.prototype.updatePhaseTimer = function (deltaTime) {
    this.phaseTimer = Math.max(0, this.phaseTimer - deltaTime);
};

Endboss.prototype.shouldAdvanceCombatPhase = function () {
    return this.phaseTimer === 0;
};

Endboss.prototype.advanceCombatPhase = function () {
    if (this.isWindingUp()) {
        this.startAttackPhase();
        return;
    }

    if (this.isAttackPhase()) {
        this.startRetreatPhase();
        return;
    }

    this.finishRetreatPhaseIfNeeded();
};

Endboss.prototype.isAttackPhase = function () {
    return this.combatPhase === 'attack';
};

Endboss.prototype.finishRetreatPhaseIfNeeded = function () {
    if (!this.isRetreating()) {
        return;
    }

    this.finishCombatCycle();
};

Endboss.prototype.startAttackPhase = function () {
    this.combatPhase = 'attack';
    this.phaseTimer = this.attackDuration;
    this.currentImage = 0;
    this.animationCounter = 0;
    this.emitAudioEvent('attack');
};

Endboss.prototype.startRetreatPhase = function () {
    this.combatPhase = 'retreat';
    this.phaseTimer = this.retreatDuration;
};

Endboss.prototype.finishCombatCycle = function () {
    this.resetCombatPhase();
    this.attackCooldownTimer = this.attackCooldownDuration;
};

Endboss.prototype.getDistanceToCharacter = function (character) {
    let { characterLeft, characterRight, bossLeft, bossRight } = this.getCharacterDistanceBounds(character);

    if (characterRight < bossLeft) {
        return bossLeft - characterRight;
    }

    if (characterLeft > bossRight) {
        return characterLeft - bossRight;
    }

    return 0;
};

Endboss.prototype.getCharacterDistanceBounds = function (character) {
    return {
        characterLeft: character.x + character.offset.left,
        characterRight: character.x + character.width - character.offset.right,
        bossLeft: this.x + this.offset.left,
        bossRight: this.x + this.width - this.offset.right,
    };
};

/**
 * Resolves the current animation state and renders the next boss animation frame.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @param {boolean} bossFightStarted Whether the boss encounter is active.
 * @param {Character} character Active player character.
 * @returns {void}
 */
Endboss.prototype.animate = function (deltaTime, bossFightStarted, character) {
    this.updateAnimationState(bossFightStarted, character);

    if (this.currentState === 'dead') {
        this.animateDeath(deltaTime);
        return;
    }

    this.animateCurrentState(deltaTime);
};

Endboss.prototype.updateAnimationState = function (bossFightStarted, character) {
    let nextState = this.resolveState(bossFightStarted, character);

    if (this.currentState === nextState) {
        return;
    }

    this.currentState = nextState;
    this.currentImage = 0;
    this.animationCounter = 0;
};

Endboss.prototype.animateCurrentState = function (deltaTime) {
    if (!this.isAnimationFrameDue(deltaTime)) {
        return;
    }

    this.playAnimation(this.getAnimationFramesForState());
};

/**
 * Resolves the visible boss state from combat flags and encounter progress.
 *
 * @param {boolean} bossFightStarted Whether the boss encounter is active.
 * @param {Character} character Active player character.
 * @returns {string} Animation state name to display.
 */
Endboss.prototype.resolveState = function (bossFightStarted, character) {
    if (this.isDead()) return 'dead';
    if (this.isHurt()) return 'hurt';
    if (!bossFightStarted) return 'alert';
    if (this.isAttacking()) return 'attack';
    if (this.isRetreating()) return 'walk';
    if (this.hasPendingTurnDecision()) return 'alert';
    if (this.isWindingUp() || this.isInAttackCooldown()) return 'alert';
    return 'walk';
};

/**
 * Plays the boss death animation until the final frame is reached.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
Endboss.prototype.animateDeath = function (deltaTime) {
    if (this.isDeathAnimationFinished()) {
        this.showFinalDeathFrame();
        return;
    }

    if (this.tryAnimateDeathFrame(deltaTime)) {
        return;
    }

    this.finishDeathAnimation();
};

Endboss.prototype.tryAnimateDeathFrame = function (deltaTime) {
    if (!this.isAnimationFrameDue(deltaTime) || !this.hasRemainingDeathFrames()) {
        return false;
    }

    this.showNextDeathFrame();
    return true;
};

Endboss.prototype.isDeathAnimationFinished = function () {
    return this.deathAnimationFinished;
};

Endboss.prototype.hasRemainingDeathFrames = function () {
    return this.currentImage < this.deadImages.length;
};

Endboss.prototype.showNextDeathFrame = function () {
    this.img = this.imageCache[this.deadImages[this.currentImage]];
    this.currentImage++;
};

Endboss.prototype.finishDeathAnimation = function () {
    this.deathAnimationFinished = true;
    this.showFinalDeathFrame();
};

Endboss.prototype.showFinalDeathFrame = function () {
    this.img = this.imageCache[this.deadImages[this.deadImages.length - 1]];
};