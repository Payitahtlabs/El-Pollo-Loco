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

/**
 * Checks whether combat behavior should update this frame.
 *
 * @param {boolean} bossFightStarted Whether the boss encounter is active.
 * @returns {boolean} True when behavior updates should run.
 */
Endboss.prototype.shouldUpdateBehavior = function (bossFightStarted) {
    return bossFightStarted && !this.isDead();
};

/**
 * Updates active combat movement and attack decisions.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @param {Character} character Active player character.
 * @returns {void}
 */
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

/**
 * Checks whether the current combat action should pause further decisions.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {boolean} True when movement or windup already handled the frame.
 */
Endboss.prototype.shouldPauseCombatAction = function (deltaTime) {
    return this.handleCombatMovement(deltaTime) || this.isWindingUp();
};

/**
 * Checks whether combat behavior should halt because the boss is hurt.
 *
 * @returns {boolean} True when behavior updates should stop.
 */
Endboss.prototype.shouldStopBehaviorUpdate = function () {
    return this.isHurt();
};

/**
 * Updates the facing direction unless the boss should currently freeze it.
 *
 * @param {Character} character Active player character.
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
Endboss.prototype.updateFacingDirectionIfNeeded = function (character, deltaTime) {
    if (this.shouldFreezeFacingDirection()) {
        this.resetTurnDecision();
        return;
    }

    this.updateFacingDirection(character, deltaTime);
};

/**
 * Checks whether the boss should keep its current facing direction.
 *
 * @returns {boolean} True when facing updates should be frozen.
 */
Endboss.prototype.shouldFreezeFacingDirection = function () {
    return this.isHurt() || this.isWindingUp();
};

/**
 * Handles attack or retreat movement phases.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {boolean} True when combat movement handled the frame.
 */
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

/**
 * Moves the boss forward during the attack phase.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
Endboss.prototype.moveAttack = function (deltaTime) {
    this.x += this.getFacingDirection() * this.attackSpeed * deltaTime;
};

/**
 * Moves the boss backward during the retreat phase.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
Endboss.prototype.moveRetreat = function (deltaTime) {
    this.x -= this.getFacingDirection() * this.retreatSpeed * deltaTime;
};

/**
 * Checks whether the boss is allowed to start a new attack.
 *
 * @param {Character} character Active player character.
 * @returns {boolean} True when attack conditions are met.
 */
Endboss.prototype.canStartAttack = function (character) {
    return !this.isInAttackCooldown() && this.getDistanceToCharacter(character) <= this.attackTriggerRange;
};

/**
 * Checks whether the boss should keep walking toward the character.
 *
 * @param {Character} character Active player character.
 * @returns {boolean} True when the character is still outside attack range.
 */
Endboss.prototype.shouldMoveTowardsCharacter = function (character) {
    return this.getDistanceToCharacter(character) > this.attackTriggerRange;
};

/**
 * Starts the attack windup when the character is in range.
 *
 * @param {Character} character Active player character.
 * @returns {boolean} True when a new attack was started.
 */
Endboss.prototype.tryStartAttack = function (character) {
    if (!this.canStartAttack(character)) {
        return false;
    }

    this.startWindup();
    return true;
};

/**
 * Moves the boss toward the character when no attack is available.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @param {Character} character Active player character.
 * @returns {void}
 */
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

/**
 * Advances the attack cooldown timer.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
Endboss.prototype.updateAttackCooldown = function (deltaTime) {
    if (this.attackCooldownTimer <= 0) {
        return;
    }

    this.attackCooldownTimer = Math.max(0, this.attackCooldownTimer - deltaTime);
};

/**
 * Checks whether the current combat phase still has time remaining.
 *
 * @returns {boolean} True when a phase timer is active.
 */
Endboss.prototype.hasActivePhaseTimer = function () {
    return this.phaseTimer > 0;
};

/**
 * Advances the active combat phase timer.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
Endboss.prototype.updatePhaseTimer = function (deltaTime) {
    this.phaseTimer = Math.max(0, this.phaseTimer - deltaTime);
};

/**
 * Checks whether the current combat phase should advance.
 *
 * @returns {boolean} True when the phase timer elapsed.
 */
Endboss.prototype.shouldAdvanceCombatPhase = function () {
    return this.phaseTimer === 0;
};

/**
 * Advances the boss to the next combat phase.
 *
 * @returns {void}
 */
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

/**
 * Checks whether the active combat phase is the attack phase.
 *
 * @returns {boolean} True when the boss is attacking.
 */
Endboss.prototype.isAttackPhase = function () {
    return this.combatPhase === 'attack';
};

/**
 * Finishes the retreat phase when the boss is currently retreating.
 *
 * @returns {void}
 */
Endboss.prototype.finishRetreatPhaseIfNeeded = function () {
    if (!this.isRetreating()) {
        return;
    }

    this.finishCombatCycle();
};

/**
 * Starts the active attack phase and queues the attack sound.
 *
 * @returns {void}
 */
Endboss.prototype.startAttackPhase = function () {
    this.combatPhase = 'attack';
    this.phaseTimer = this.attackDuration;
    this.currentImage = 0;
    this.animationCounter = 0;
    this.emitAudioEvent('attack');
};

/**
 * Starts the retreat phase after an attack.
 *
 * @returns {void}
 */
Endboss.prototype.startRetreatPhase = function () {
    this.combatPhase = 'retreat';
    this.phaseTimer = this.retreatDuration;
};

/**
 * Resets the combat cycle and reapplies the attack cooldown.
 *
 * @returns {void}
 */
Endboss.prototype.finishCombatCycle = function () {
    this.resetCombatPhase();
    this.attackCooldownTimer = this.attackCooldownDuration;
};

/**
 * Calculates the horizontal distance between the boss and the character hitboxes.
 *
 * @param {Character} character Active player character.
 * @returns {number} Horizontal gap between both hitboxes.
 */
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

/**
 * Returns the horizontal hitbox bounds used for distance checks.
 *
 * @param {Character} character Active player character.
 * @returns {{characterLeft: number, characterRight: number, bossLeft: number, bossRight: number}} Horizontal hitbox bounds.
 */
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

/**
 * Updates the visible boss animation state.
 *
 * @param {boolean} bossFightStarted Whether the boss encounter is active.
 * @param {Character} character Active player character.
 * @returns {void}
 */
Endboss.prototype.updateAnimationState = function (bossFightStarted, character) {
    let nextState = this.resolveState(bossFightStarted, character);

    if (this.currentState === nextState) {
        return;
    }

    this.currentState = nextState;
    this.currentImage = 0;
    this.animationCounter = 0;
};

/**
 * Plays the current non-death animation state.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
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

/**
 * Advances the death animation by one frame when possible.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {boolean} True when a death frame was advanced.
 */
Endboss.prototype.tryAnimateDeathFrame = function (deltaTime) {
    if (!this.isAnimationFrameDue(deltaTime) || !this.hasRemainingDeathFrames()) {
        return false;
    }

    this.showNextDeathFrame();
    return true;
};

/**
 * Checks whether the boss death animation already finished.
 *
 * @returns {boolean} True when the final death frame should persist.
 */
Endboss.prototype.isDeathAnimationFinished = function () {
    return this.deathAnimationFinished;
};

/**
 * Checks whether more death frames remain to be displayed.
 *
 * @returns {boolean} True when more death frames are available.
 */
Endboss.prototype.hasRemainingDeathFrames = function () {
    return this.currentImage < this.deadImages.length;
};

/**
 * Shows the next frame in the death animation sequence.
 *
 * @returns {void}
 */
Endboss.prototype.showNextDeathFrame = function () {
    this.img = this.imageCache[this.deadImages[this.currentImage]];
    this.currentImage++;
};

/**
 * Marks the death animation as finished and keeps the last frame visible.
 *
 * @returns {void}
 */
Endboss.prototype.finishDeathAnimation = function () {
    this.deathAnimationFinished = true;
    this.showFinalDeathFrame();
};

/**
 * Shows the final death frame.
 *
 * @returns {void}
 */
Endboss.prototype.showFinalDeathFrame = function () {
    this.img = this.imageCache[this.deadImages[this.deadImages.length - 1]];
};