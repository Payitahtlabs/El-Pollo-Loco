/**
 * Updates the active world state while the game is still running.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
World.prototype.update = function (deltaTime) {
    if (this.gameWon || this.gameLost) {
        return;
    }

    this.updateWorldState(deltaTime);
    this.updateCollisionAndAudioState(deltaTime);
    this.updateCamera();
};

/**
 * Updates counters, dynamic objects, collisions, and outcome checks.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
World.prototype.updateCollisionAndAudioState = function (deltaTime) {
    this.updateDisplayState();
    this.updateThrowableObjects(deltaTime);
    this.updateLevelObjects(deltaTime);
    this.updateEndboss(deltaTime);
    this.checkCollisions();
    this.playPendingEndbossSounds();
    this.checkLoseCondition();
    this.checkWinCondition();
};

/**
 * Advances the player, ambient objects, and encounter triggers for the current frame.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
World.prototype.updateWorldState = function (deltaTime) {
    this.level.playerMinX = this.bossFightStarted ? this.bossArenaLeftX : 0;
    this.level.clouds.forEach((cloud) => cloud.update(deltaTime, this.level.levelEndX));
    this.character.update(deltaTime, this.keyboard, this.level);
    this.character.animate(deltaTime);
    this.playJumpSoundIfNeeded();
    this.updateCharacterAudioState();
    this.handleBottleThrow();
    this.updateEndbossFightState();
};

/**
 * Updates character-related looping audio based on the current state.
 *
 * @returns {void}
 */
World.prototype.updateCharacterAudioState = function () {
    if (this.character.isLongIdleActive()) {
        this.audioManager?.startLoopingSound('characterLongIdleSnore');
        return;
    }

    this.stopCharacterLongIdleSound();
};

/**
 * Stops the looping long-idle character sound.
 *
 * @returns {void}
 */
World.prototype.stopCharacterLongIdleSound = function () {
    this.audioManager?.stopLoopingSound('characterLongIdleSnore');
};

/**
 * Synchronizes all HUD displays with the current world state.
 *
 * @returns {void}
 */
World.prototype.updateDisplayState = function () {
    this.healthStatusBar.setPercentage(this.character.energy);
    this.bottleCounter.setValue(this.character.collectedBottles);
    this.coinCounter.setValue(this.character.collectedCoins);
    this.endbossStatusBar.setPercentage(this.level.endboss.energy);
};

/**
 * Updates and filters all active thrown bottles.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
World.prototype.updateThrowableObjects = function (deltaTime) {
    this.throwableObjects = this.throwableObjects.filter((bottle) => {
        let wasSplashing = bottle.isSplashing;
        bottle.update(deltaTime);

        if (!wasSplashing && bottle.isSplashing) {
            this.audioManager?.playSound('bottleSplash');
        }

        return !bottle.shouldRemove();
    });
};

/**
 * Updates collectible items and enemy objects inside the active level.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
World.prototype.updateLevelObjects = function (deltaTime) {
    this.level.bottles.forEach((bottle) => {
        if (bottle.update) {
            bottle.update(deltaTime);
        }
    });
    this.level.coins.forEach((coin) => coin.animate(deltaTime));
    this.level.enemies.forEach((enemy) => {
        enemy.update(deltaTime, this.level.levelEndX);
        enemy.animate(deltaTime);
    });
};

/**
 * Updates the endboss behavior and animation state.
 *
 * @param {number} deltaTime Time since the previous frame in seconds.
 * @returns {void}
 */
World.prototype.updateEndboss = function (deltaTime) {
    this.level.endboss.update(deltaTime, this.character, this.bossFightStarted);
    this.level.endboss.animate(deltaTime, this.bossFightStarted, this.character);
};

/**
 * Updates the camera so the character remains within view.
 *
 * @returns {void}
 */
World.prototype.updateCamera = function () {
    let maxCameraX = this.level.levelEndX - this.canvas.width;
    let targetCameraX = -this.character.x + 120;
    this.camera_x = Math.max(-maxCameraX, Math.min(0, targetCameraX));
};

/**
 * Checks whether the player has entered the boss arena trigger.
 *
 * @returns {void}
 */
World.prototype.updateEndbossFightState = function () {
    if (this.bossFightStarted) {
        return;
    }

    let triggerX = this.level.endboss.x - 300;
    if (this.isBossFightTriggerReached(triggerX)) {
        this.startBossFight(triggerX);
    }
};

/**
 * Starts the boss encounter once the player reaches the trigger zone.
 *
 * @param {number} [triggerX=this.level.endboss.x - 300] Left boundary of the boss arena trigger.
 * @returns {void}
 */
World.prototype.startBossFight = function (triggerX = this.level.endboss.x - 300) {
    if (this.bossFightStarted) {
        return;
    }

    this.activateBossFight(triggerX);
    this.playBossFightStartSounds();
};

/**
 * Checks whether the character reached the boss-fight trigger.
 *
 * @param {number} triggerX Left boundary of the boss arena trigger.
 * @returns {boolean} True when the trigger was reached.
 */
World.prototype.isBossFightTriggerReached = function (triggerX) {
    let characterFront = this.character.x + this.character.width;
    return characterFront >= triggerX;
};

/**
 * Activates the boss fight and locks the boss arena's left boundary.
 *
 * @param {number} triggerX Left boundary of the boss arena trigger.
 * @returns {void}
 */
World.prototype.activateBossFight = function (triggerX) {
    this.bossFightStarted = true;
    this.bossArenaLeftX = Math.max(0, triggerX - 180);
};

/**
 * Starts the boss-fight audio transition and alert sound.
 *
 * @returns {void}
 */
World.prototype.playBossFightStartSounds = function () {
    this.audioManager?.crossfadeToBossMusic();
    this.audioManager?.playSound('endbossAlert');
};

/**
 * Plays all endboss audio events queued during the current frame.
 *
 * @returns {void}
 */
World.prototype.playPendingEndbossSounds = function () {
    this.level.endboss.consumeAudioEvents().forEach((eventName) => {
        this.playEndbossAudioEvent(eventName);
    });
};

/**
 * Plays a specific endboss sound event.
 *
 * @param {string} eventName Queued endboss audio event name.
 * @returns {void}
 */
World.prototype.playEndbossAudioEvent = function (eventName) {
    switch (eventName) {
        case 'attack':
            this.audioManager?.playSound('endbossAttack');
            break;
        case 'hurt':
            this.audioManager?.playSound('endbossHurt');
            break;
        case 'death':
            this.audioManager?.playSound('endbossDeath');
            break;
    }
};

/**
 * Plays the jump sound when the character jumped in the current frame.
 *
 * @returns {void}
 */
World.prototype.playJumpSoundIfNeeded = function () {
    if (this.character.didJumpThisFrame) {
        this.audioManager?.playSound('jump');
    }
};

/**
 * Starts a bottle throw on the rising edge of the throw input.
 *
 * @returns {void}
 */
World.prototype.handleBottleThrow = function () {
    if (this.keyboard.throwKey && !this.throwKeyPressed && this.canThrowBottle()) {
        this.throwBottle();
    }

    this.throwKeyPressed = this.keyboard.throwKey;
};

/**
 * Checks whether the character may currently throw a bottle.
 *
 * @returns {boolean} True when a bottle throw is allowed.
 */
World.prototype.canThrowBottle = function () {
    if (this.character.isDead()) {
        return false;
    }

    return this.getTimeSinceLastBottleThrow() >= this.getBottleThrowCooldown();
};

/**
 * Returns the elapsed time since the last bottle throw.
 *
 * @returns {number} Seconds since the last bottle throw.
 */
World.prototype.getTimeSinceLastBottleThrow = function () {
    return (Date.now() - this.lastBottleThrowAt) / 1000;
};

/**
 * Resolves the active bottle throw cooldown.
 *
 * @returns {number} Cooldown duration in seconds.
 */
World.prototype.getBottleThrowCooldown = function () {
    return this.bossFightStarted ? this.bossBottleThrowCooldown : this.bottleThrowCooldown;
};

/**
 * Spawns and plays a new thrown bottle when inventory allows it.
 *
 * @returns {void}
 */
World.prototype.throwBottle = function () {
    if (!this.character.throwBottle()) {
        return;
    }

    let throwToLeft = this.character.otherDirection;
    let horizontalOffset = throwToLeft ? 10 : this.character.width - 70;
    let bottleX = this.character.x + horizontalOffset;
    let bottleY = this.character.y + 100;

    this.lastBottleThrowAt = Date.now();
    this.throwableObjects.push(new ThrowableBottle(bottleX, bottleY, throwToLeft));
    this.audioManager?.playSound('bottleThrow');
};
