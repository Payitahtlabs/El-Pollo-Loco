/**
 * Resolves the visible animation for the current frame.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
Character.prototype.animate = function (deltaTime) {
    if (!this.animatePriorityStates(deltaTime)) {
        this.animateWalkState(deltaTime);
    }
};

/**
 * Runs all higher-priority animation states before walking.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {boolean} True when a priority animation handled the frame.
 */
Character.prototype.animatePriorityStates = function (deltaTime) {
    return this.animateDeathState(deltaTime)
        || this.animateHurtState(deltaTime)
        || this.animateJumpState(deltaTime)
        || this.animateIdleState(deltaTime);
};

/**
 * Resolves and plays the death animation when the character is dead.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {boolean} True when the death state is active.
 */
Character.prototype.animateDeathState = function (deltaTime) {
    if (!this.isDead()) {
        return false;
    }

    this.wasMoving = false;
    this.setAnimationState('dead', this.deadImages);
    this.animateDeath(deltaTime);
    return true;
};

/**
 * Resolves and plays the hurt animation when the hurt window is active.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {boolean} True when the hurt state is active.
 */
Character.prototype.animateHurtState = function (deltaTime) {
    if (!this.isHurtAnimationActive()) {
        return false;
    }

    this.wasMoving = false;
    this.setAnimationState('hurt', this.hurtImages);
    this.playStateAnimation(deltaTime, this.hurtImages);
    return true;
};

/**
 * Checks whether the short hurt animation should still be shown.
 *
 * @returns {boolean} True while the hurt animation is active.
 */
Character.prototype.isHurtAnimationActive = function () {
    if (!this.isHurt()) {
        return false;
    }

    return this.getTimeSinceLastHit() < this.hurtAnimationDuration;
};

/**
 * Resolves and plays the jump animation while airborne.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {boolean} True when the jump state is active.
 */
Character.prototype.animateJumpState = function (deltaTime) {
    if (!this.isAboveGround()) {
        return false;
    }

    this.wasMoving = false;
    this.setAnimationState('jump', this.jumpingImages);
    this.playStateAnimation(deltaTime, this.jumpingImages);
    return true;
};

/**
 * Resolves and plays idle animations when the character stands still.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {boolean} True when an idle state is active.
 */
Character.prototype.animateIdleState = function (deltaTime) {
    if (this.isMoving) {
        return false;
    }

    this.wasMoving = false;
    this.animateIdleVariant(deltaTime);
    return true;
};

/**
 * Chooses between regular idle and long-idle animation variants.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
Character.prototype.animateIdleVariant = function (deltaTime) {
    if (this.isLongIdleReady()) {
        this.playIdleAnimationVariant(deltaTime, 'long-idle', this.longIdleImages);
        return;
    }

    this.playIdleAnimationVariant(deltaTime, 'idle', this.idleImages);
};

/**
 * Checks whether the long-idle delay has elapsed.
 *
 * @returns {boolean} True when long-idle animation may start.
 */
Character.prototype.isLongIdleReady = function () {
    return this.idleTime >= this.longIdleDelay;
};

/**
 * Checks whether the current animation state is long-idle.
 *
 * @returns {boolean} True when the long-idle animation is active.
 */
Character.prototype.isLongIdleActive = function () {
    return this.currentAnimationState === 'long-idle';
};

/**
 * Plays the requested idle animation variant.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @param {string} state Animation state name.
 * @param {string[]} frames Animation frames for the state.
 * @returns {void}
 */
Character.prototype.playIdleAnimationVariant = function (deltaTime, state, frames) {
    this.setAnimationState(state, frames);
    this.playStateAnimation(deltaTime, frames);
};

/**
 * Resolves and plays the walking animation.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
Character.prototype.animateWalkState = function (deltaTime) {
    this.setAnimationState('walk', this.walkingImages);
    this.wasMoving = true;
    this.playStateAnimation(deltaTime, this.walkingImages);
};

/**
 * Advances the current animation frames when their timing is due.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @param {string[]} frames Animation frames to play.
 * @returns {void}
 */
Character.prototype.playStateAnimation = function (deltaTime, frames) {
    if (this.isAnimationFrameDue(deltaTime)) {
        this.playAnimation(frames);
    }
};

/**
 * Switches the active animation state and resets frame counters.
 *
 * @param {string} state Animation state name.
 * @param {?string[]} [frames=null] Optional frames used to prime the first image.
 * @returns {void}
 */
Character.prototype.setAnimationState = function (state, frames = null) {
    if (this.currentAnimationState === state) {
        return;
    }

    this.currentAnimationState = state;
    this.animationFps = this.animationSpeeds[state] || 10;
    this.currentImage = 0;
    this.animationCounter = 0;

    if (frames) {
        this.img = this.imageCache[frames[0]];
        this.currentImage = 1;
    }
};

/**
 * Advances the death animation until the final frame remains visible.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
Character.prototype.animateDeath = function (deltaTime) {
    if (this.isDeathAnimationComplete()) {
        this.showFinalDeathFrame();
        return;
    }

    if (this.tryAnimateDeathFrame(deltaTime)) {
        return;
    }

    this.finishDeathAnimation();
};

/**
 * Checks whether the death animation already finished.
 *
 * @returns {boolean} True when the final death frame should persist.
 */
Character.prototype.isDeathAnimationComplete = function () {
    return this.deathAnimationFinished;
};

/**
 * Advances to the next death frame when animation timing allows it.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {boolean} True when a death frame was advanced.
 */
Character.prototype.tryAnimateDeathFrame = function (deltaTime) {
    if (!this.isAnimationFrameDue(deltaTime) || !this.hasRemainingDeathFrames()) {
        return false;
    }

    this.showNextDeathFrame();
    return true;
};

/**
 * Checks whether more death frames remain to be displayed.
 *
 * @returns {boolean} True when more death frames are available.
 */
Character.prototype.hasRemainingDeathFrames = function () {
    return this.currentImage < this.deadImages.length;
};

/**
 * Shows the next frame in the death animation sequence.
 *
 * @returns {void}
 */
Character.prototype.showNextDeathFrame = function () {
    this.img = this.imageCache[this.deadImages[this.currentImage]];
    this.currentImage++;
};

/**
 * Marks the death animation as finished and keeps the last frame visible.
 *
 * @returns {void}
 */
Character.prototype.finishDeathAnimation = function () {
    this.deathAnimationFinished = true;
    this.showFinalDeathFrame();
};

/**
 * Shows the final death frame.
 *
 * @returns {void}
 */
Character.prototype.showFinalDeathFrame = function () {
    this.img = this.imageCache[this.deadImages[this.deadImages.length - 1]];
};
