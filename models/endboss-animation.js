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
