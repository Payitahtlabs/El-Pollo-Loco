/**
 * Updates movement and input-driven state for the current frame.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @param {Keyboard} keyboard Current keyboard input state.
 * @param {Level} level Active level data used for movement bounds.
 * @returns {void}
 */
Character.prototype.update = function (deltaTime, keyboard, level) {
    this.prepareFrameState(deltaTime, keyboard);

    if (this.shouldStopMovementUpdate()) {
        return;
    }

    this.updateHorizontalMovement(deltaTime, keyboard);
    this.handleJumpInput(keyboard);
    this.clampHorizontalPosition(level);
};

/**
 * Resets frame-specific state before movement handling.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @param {Keyboard} keyboard Current keyboard input state.
 * @returns {void}
 */
Character.prototype.prepareFrameState = function (deltaTime, keyboard) {
    this.isMoving = keyboard.right || keyboard.left;
    this.didJumpThisFrame = false;
    this.applyGravity(deltaTime);
    this.updateIdleTime(deltaTime);
};

/**
 * Determines whether movement handling should stop for the current frame.
 *
 * @returns {boolean} True when movement updates should be skipped.
 */
Character.prototype.shouldStopMovementUpdate = function () {
    if (!this.isMovementBlocked()) {
        return false;
    }

    this.stopActiveMovementInputs();
    return true;
};

/**
 * Checks whether the character is currently prevented from moving.
 *
 * @returns {boolean} True when movement is blocked.
 */
Character.prototype.isMovementBlocked = function () {
    return this.isDead() || this.isHurtMovementLocked();
};

/**
 * Checks whether the hurt animation still locks movement.
 *
 * @returns {boolean} True while hurt movement lock is active.
 */
Character.prototype.isHurtMovementLocked = function () {
    return this.isHurtAnimationActive();
};

/**
 * Returns the elapsed time since the last hit.
 *
 * @returns {number} Seconds since the last registered hit.
 */
Character.prototype.getTimeSinceLastHit = function () {
    return (Date.now() - this.lastHit) / 1000;
};

/**
 * Clears currently active movement-related input state.
 *
 * @returns {void}
 */
Character.prototype.stopActiveMovementInputs = function () {
    this.isMoving = false;
    this.jumpKeyPressed = false;
};

/**
 * Updates horizontal movement based on active keyboard input.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @param {Keyboard} keyboard Current keyboard input state.
 * @returns {void}
 */
Character.prototype.updateHorizontalMovement = function (deltaTime, keyboard) {
    if (keyboard.right) {
        this.moveRightWithFacing(deltaTime);
    }

    if (keyboard.left) {
        this.moveLeftWithFacing(deltaTime);
    }
};

/**
 * Moves the character right and updates the facing direction.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
Character.prototype.moveRightWithFacing = function (deltaTime) {
    this.otherDirection = false;
    this.moveRight(deltaTime);
};

/**
 * Moves the character left and updates the facing direction.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
Character.prototype.moveLeftWithFacing = function (deltaTime) {
    this.otherDirection = true;
    this.moveLeft(deltaTime);
};

/**
 * Keeps the character within the level's horizontal bounds.
 *
 * @param {Level} level Active level data.
 * @returns {void}
 */
Character.prototype.clampHorizontalPosition = function (level) {
    let minX = level.playerMinX ?? 0;

    if (this.x < minX) {
        this.x = minX;
    }

    if (this.x + this.width > level.levelEndX) {
        this.x = level.levelEndX - this.width;
    }
};

/**
 * Starts a jump once per key press while the character is grounded.
 *
 * @param {Keyboard} keyboard Current keyboard input state.
 * @returns {void}
 */
Character.prototype.handleJumpInput = function (keyboard) {
    let jumpKeyActive = keyboard.up || keyboard.space;

    if (jumpKeyActive && !this.jumpKeyPressed && this.jump()) {
        this.didJumpThisFrame = true;
    }

    this.jumpKeyPressed = jumpKeyActive;
};

/**
 * Tracks how long the character has been idle on the ground.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
Character.prototype.updateIdleTime = function (deltaTime) {
    if (this.isMoving || this.isAboveGround() || this.isHurt() || this.isDead()) {
        this.idleTime = 0;
        return;
    }

    this.idleTime += deltaTime;
};

/**
 * Increases the collected coin count by one.
 *
 * @returns {void}
 */
Character.prototype.collectCoin = function () {
    this.collectedCoins++;
};

/**
 * Increases the collected bottle count by one.
 *
 * @returns {void}
 */
Character.prototype.collectBottle = function () {
    this.collectedBottles++;
};

/**
 * Checks whether the character currently carries a throwable bottle.
 *
 * @returns {boolean} True when at least one bottle is available.
 */
Character.prototype.hasBottle = function () {
    return this.collectedBottles > 0;
};

/**
 * Consumes one carried bottle for a throw action.
 *
 * @returns {boolean} True when a bottle was consumed.
 */
Character.prototype.throwBottle = function () {
    if (!this.hasBottle()) {
        return false;
    }

    this.collectedBottles--;
    return true;
};

/**
 * Applies incoming damage and resets the death animation when the hit becomes fatal.
 *
 * @returns {boolean} True when the hit was applied.
 */
Character.prototype.hit = function () {
    let wasDead = this.isDead();

    if (!MovableObject.prototype.hit.call(this)) {
        return false;
    }

    this.resetDeathAnimationIfNeeded(wasDead);
    return true;
};

/**
 * Resets the death animation state when the character dies from the latest hit.
 *
 * @param {boolean} wasDead Whether the character was already dead before the hit.
 * @returns {void}
 */
Character.prototype.resetDeathAnimationIfNeeded = function (wasDead) {
    if (wasDead || !this.isDead()) {
        return;
    }

    this.currentImage = 0;
    this.animationCounter = 0;
    this.deathAnimationFinished = false;
};
