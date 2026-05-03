/**
 * Checks whether the lose condition has been reached.
 *
 * @returns {void}
 */
World.prototype.checkLoseCondition = function () {
    if (this.canLoseGame()) {
        this.handleGameLost();
    }
};

/**
 * Checks whether the win condition has been reached.
 *
 * @returns {void}
 */
World.prototype.checkWinCondition = function () {
    if (this.canWinGame()) {
        this.handleGameWon();
    }
};

/**
 * Checks whether the game may transition into a loss state.
 *
 * @returns {boolean} True when the loss condition is satisfied.
 */
World.prototype.canLoseGame = function () {
    return !this.gameWon && !this.gameLost && this.character.isDead() && this.character.deathAnimationFinished;
};

/**
 * Checks whether the game may transition into a win state.
 *
 * @returns {boolean} True when the win condition is satisfied.
 */
World.prototype.canWinGame = function () {
    return !this.gameWon && !this.gameLost && this.level.endboss.isDead() && this.level.endboss.deathAnimationFinished;
};

/**
 * Marks the game as won and shows the win overlay.
 *
 * @returns {void}
 */
World.prototype.handleGameWon = function () {
    this.gameWon = true;
    this.stopCharacterLongIdleSound();
    this.showWinOverlay();

    if (this.onGameWon) {
        this.onGameWon();
    }
};

/**
 * Marks the game as lost and shows the game-over overlay.
 *
 * @returns {void}
 */
World.prototype.handleGameLost = function () {
    this.gameLost = true;
    this.stopCharacterLongIdleSound();
    this.showGameOverOverlay();

    if (this.onGameLost) {
        this.onGameLost();
    }
};

/**
 * Shows the win overlay.
 *
 * @returns {void}
 */
World.prototype.showWinOverlay = function () {
    this.setOverlayVisibility(this.winScreenOverlay, true);
};

/**
 * Hides the win overlay.
 *
 * @returns {void}
 */
World.prototype.hideWinOverlay = function () {
    this.setOverlayVisibility(this.winScreenOverlay, false);
};

/**
 * Shows the game-over overlay.
 *
 * @returns {void}
 */
World.prototype.showGameOverOverlay = function () {
    this.setOverlayVisibility(this.gameOverScreenOverlay, true);
};

/**
 * Hides the game-over overlay.
 *
 * @returns {void}
 */
World.prototype.hideGameOverOverlay = function () {
    this.setOverlayVisibility(this.gameOverScreenOverlay, false);
};

/**
 * Toggles an overlay's visible and ARIA-hidden state.
 *
 * @param {?HTMLElement} overlay Overlay element to update.
 * @param {boolean} isVisible Whether the overlay should be visible.
 * @returns {void}
 */
World.prototype.setOverlayVisibility = function (overlay, isVisible) {
    if (!overlay) {
        return;
    }

    overlay.classList.toggle('hidden', !isVisible);
    overlay.setAttribute('aria-hidden', String(!isVisible));
};

/**
 * Pauses the world loop.
 *
 * @returns {void}
 */
World.prototype.pause = function () {
    this.paused = true;
    this.stopAnimationLoop();
};

/**
 * Resumes the world loop after a pause.
 *
 * @returns {void}
 */
World.prototype.resume = function () {
    if (!this.paused) {
        return;
    }

    this.paused = false;
    this.resetFrameTiming();
    this.gameLoop(0);
};

/**
 * Stops the world loop and active long-idle audio.
 *
 * @returns {void}
 */
World.prototype.gameOver = function () {
    this.stopCharacterLongIdleSound();
    this.stopAnimationLoop();
};
