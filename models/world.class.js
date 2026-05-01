/**
 * Coordinates the running game world, including frame updates, rendering, collisions, and UI overlays.
 */
class World {
    // ── Spielobjekte ─────────────────────────────────────
    character = new Character();
    level = level1;
    healthStatusBar = new StatusBar([
        'img/statusbars/1_statusbar/2_statusbar_health/blue/0.png',
        'img/statusbars/1_statusbar/2_statusbar_health/blue/20.png',
        'img/statusbars/1_statusbar/2_statusbar_health/blue/40.png',
        'img/statusbars/1_statusbar/2_statusbar_health/blue/60.png',
        'img/statusbars/1_statusbar/2_statusbar_health/blue/80.png',
        'img/statusbars/1_statusbar/2_statusbar_health/blue/100.png',
    ], 12, 6);
    endbossStatusBar = new StatusBar([
        'img/statusbars/2_statusbar_endboss/blue/blue0.png',
        'img/statusbars/2_statusbar_endboss/blue/blue20.png',
        'img/statusbars/2_statusbar_endboss/blue/blue40.png',
        'img/statusbars/2_statusbar_endboss/blue/blue60.png',
        'img/statusbars/2_statusbar_endboss/blue/blue80.png',
        'img/statusbars/2_statusbar_endboss/blue/blue100.png',
    ], 270, 8);
    bottleCounter = new CounterDisplay('img/statusbars/3_icons/icon_salsa_bottle.png', 540, 16);
    coinCounter = new CounterDisplay('img/statusbars/3_icons/icon_coin.png', 620, 16);
    bossFightStarted = false;
    gameWon = false;
    gameLost = false;
    bottleDropChance = 0.25;
    throwableObjects = [];
    throwKeyPressed = false;
    bossArenaLeftX = 0;

    // ── Canvas ───────────────────────────────────────────
    canvas;
    ctx;
    keyboard;
    winScreenOverlay;
    gameOverScreenOverlay;
    onGameWon;
    onGameLost;
    audioManager;
    camera_x = 0;
    showHitboxes = false;

    // ── Game-Loop-Steuerung ──────────────────────────────
    animationId = null;
    lastFrameTime = 0;
    maxDeltaTime = 0.1;
    paused = false;

    /**
     * Creates the world and starts the main animation loop immediately.
     *
     * @param {HTMLCanvasElement} canvas Canvas used for game rendering.
     * @param {Keyboard} keyboard Shared keyboard state object.
     * @param {{audioManager?: AudioManager, onGameWon?: Function, onGameLost?: Function}} [gameEvents={}] Optional world callbacks and shared services.
     */
    constructor(canvas, keyboard, gameEvents = {}) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.winScreenOverlay = document.getElementById('win-screen');
        this.gameOverScreenOverlay = document.getElementById('game-over-screen');
        this.audioManager = gameEvents.audioManager || null;
        this.onGameWon = gameEvents.onGameWon || null;
        this.onGameLost = gameEvents.onGameLost || null;
        this.hideWinOverlay();
        this.hideGameOverOverlay();

        this.gameLoop(0);
    }

    // ── Game Loop ────────────────────────────────────────
    /**
     * Runs one frame of the main game loop and schedules the next frame.
     *
     * @param {number} timestamp Browser-provided animation frame timestamp.
     * @returns {void}
     */
    gameLoop(timestamp) {
        let deltaTime = this.getFrameDeltaTime(timestamp);

        this.runFrame(deltaTime);
        this.scheduleNextFrame();
    }

    getFrameDeltaTime(timestamp) {
        let deltaTime = this.lastFrameTime ? (timestamp - this.lastFrameTime) / 1000 : 0;
        this.lastFrameTime = timestamp;
        return Math.min(deltaTime, this.maxDeltaTime);
    }

    runFrame(deltaTime) {
        this.update(deltaTime);
        this.draw();
    }

    scheduleNextFrame() {
        this.animationId = requestAnimationFrame((nextTimestamp) => this.gameLoop(nextTimestamp));
    }

    resetFrameTiming() {
        this.lastFrameTime = 0;
    }

    stopAnimationLoop() {
        cancelAnimationFrame(this.animationId);
    }

    // ── Logik ──────────────────────
    /**
     * Updates the active world state while the game is still running.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    update(deltaTime) {
        if (this.gameWon || this.gameLost) {
            return;
        }

        this.updateWorldState(deltaTime);
        this.updateCollisionAndAudioState(deltaTime);
        this.updateCamera();
    }

    updateCollisionAndAudioState(deltaTime) {
        this.updateDisplayState();
        this.updateThrowableObjects(deltaTime);
        this.updateLevelObjects(deltaTime);
        this.updateEndboss(deltaTime);
        this.checkCollisions();
        this.playPendingEndbossSounds();
        this.checkLoseCondition();
        this.checkWinCondition();
    }

    /**
     * Advances the player, ambient objects, and encounter triggers for the current frame.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    updateWorldState(deltaTime) {
        this.level.playerMinX = this.bossFightStarted ? this.bossArenaLeftX : 0;
        this.level.clouds.forEach((cloud) => cloud.update(deltaTime, this.level.levelEndX));
        this.character.update(deltaTime, this.keyboard, this.level);
        this.character.animate(deltaTime);
        this.playJumpSoundIfNeeded();
        this.updateCharacterAudioState();
        this.handleBottleThrow();
        this.updateEndbossFightState();
    }

    updateCharacterAudioState() {
        if (this.character.isLongIdleActive()) {
            this.audioManager?.startLoopingSound('characterLongIdleSnore');
            return;
        }

        this.stopCharacterLongIdleSound();
    }

    stopCharacterLongIdleSound() {
        this.audioManager?.stopLoopingSound('characterLongIdleSnore');
    }

    updateDisplayState() {
        this.healthStatusBar.setPercentage(this.character.energy);
        this.bottleCounter.setValue(this.character.collectedBottles);
        this.coinCounter.setValue(this.character.collectedCoins);
        this.endbossStatusBar.setPercentage(this.level.endboss.energy);
    }

    updateThrowableObjects(deltaTime) {
        this.throwableObjects = this.throwableObjects.filter((bottle) => {
            let wasSplashing = bottle.isSplashing;
            bottle.update(deltaTime);

            if (!wasSplashing && bottle.isSplashing) {
                this.audioManager?.playSound('bottleSplash');
            }

            return !bottle.shouldRemove();
        });
    }

    updateLevelObjects(deltaTime) {
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
    }

    updateEndboss(deltaTime) {
        this.level.endboss.update(deltaTime, this.character, this.bossFightStarted);
        this.level.endboss.animate(deltaTime, this.bossFightStarted, this.character);
    }

    updateCamera() {
        let maxCameraX = this.level.levelEndX - this.canvas.width;
        let targetCameraX = -this.character.x + 120;

        this.camera_x = Math.max(-maxCameraX, Math.min(0, targetCameraX));
    }

    updateEndbossFightState() {
        if (this.bossFightStarted) return;

        let triggerX = this.level.endboss.x - 300;

        if (!this.isBossFightTriggerReached(triggerX)) {
            return;
        }

        this.startBossFight(triggerX);
    }

    /**
     * Starts the boss encounter once the player reaches the trigger zone.
     *
     * @param {number} [triggerX=this.level.endboss.x - 300] Left boundary of the boss arena trigger.
     * @returns {void}
     */
    startBossFight(triggerX = this.level.endboss.x - 300) {
        if (this.bossFightStarted) {
            return;
        }

        this.activateBossFight(triggerX);
        this.playBossFightStartSounds();
    }

    isBossFightTriggerReached(triggerX) {
        let characterFront = this.character.x + this.character.width;
        return characterFront >= triggerX;
    }

    activateBossFight(triggerX) {
        this.bossFightStarted = true;
        this.bossArenaLeftX = Math.max(0, triggerX - 180);
    }

    playBossFightStartSounds() {
        this.audioManager?.crossfadeToBossMusic();
        this.audioManager?.playSound('endbossAlert');
    }

    playPendingEndbossSounds() {
        this.level.endboss.consumeAudioEvents().forEach((eventName) => {
            this.playEndbossAudioEvent(eventName);
        });
    }

    playEndbossAudioEvent(eventName) {
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
    }

    playJumpSoundIfNeeded() {
        if (this.character.didJumpThisFrame) {
            this.audioManager?.playSound('jump');
        }
    }

    handleBottleThrow() {
        if (this.keyboard.throwKey && !this.throwKeyPressed && !this.character.isDead()) {
            this.throwBottle();
        }

        this.throwKeyPressed = this.keyboard.throwKey;
    }

    throwBottle() {
        if (!this.character.throwBottle()) {
            return;
        }

        let throwToLeft = this.character.otherDirection;
        let horizontalOffset = throwToLeft ? 10 : this.character.width - 70;
        let bottleX = this.character.x + horizontalOffset;
        let bottleY = this.character.y + 100;

        this.throwableObjects.push(new ThrowableBottle(bottleX, bottleY, throwToLeft));
        this.audioManager?.playSound('bottleThrow');
    }

    checkLoseCondition() {
        if (!this.canLoseGame()) {
            return;
        }

        this.handleGameLost();
    }

    checkWinCondition() {
        if (!this.canWinGame()) {
            return;
        }

        this.handleGameWon();
    }

    canLoseGame() {
        return !this.gameWon && !this.gameLost && this.character.isDead() && this.character.deathAnimationFinished;
    }

    canWinGame() {
        return !this.gameWon && !this.gameLost && this.level.endboss.isDead() && this.level.endboss.deathAnimationFinished;
    }

    handleGameWon() {
        this.gameWon = true;
        this.stopCharacterLongIdleSound();
        this.showWinOverlay();

        if (this.onGameWon) {
            this.onGameWon();
        }
    }

    handleGameLost() {
        this.gameLost = true;
        this.stopCharacterLongIdleSound();
        this.showGameOverOverlay();

        if (this.onGameLost) {
            this.onGameLost();
        }
    }

    showWinOverlay() {
        this.setOverlayVisibility(this.winScreenOverlay, true);
    }

    hideWinOverlay() {
        this.setOverlayVisibility(this.winScreenOverlay, false);
    }

    showGameOverOverlay() {
        this.setOverlayVisibility(this.gameOverScreenOverlay, true);
    }

    hideGameOverOverlay() {
        this.setOverlayVisibility(this.gameOverScreenOverlay, false);
    }

    setOverlayVisibility(overlay, isVisible) {
        if (!overlay) {
            return;
        }

        overlay.classList.toggle('hidden', !isVisible);
        overlay.setAttribute('aria-hidden', String(!isVisible));
    }

    // ── Steuerung ────────────────────────────────────────
    pause() {
        this.paused = true;
        this.stopAnimationLoop();
    }

    resume() {
        if (!this.paused) return;
        this.paused = false;
        this.resetFrameTiming();
        this.gameLoop(0);
    }

    gameOver() {
        this.stopCharacterLongIdleSound();
        this.stopAnimationLoop();
    }
}