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
    lastBottleThrowAt = 0;
    bottleThrowCooldown = 0.22;
    bossBottleThrowCooldown = 0.8;
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

    /**
     * Calculates the bounded frame delta time for the current animation frame.
     *
     * @param {number} timestamp Browser-provided animation frame timestamp.
     * @returns {number} Delta time in seconds.
     */
    getFrameDeltaTime(timestamp) {
        let deltaTime = this.lastFrameTime ? (timestamp - this.lastFrameTime) / 1000 : 0;
        this.lastFrameTime = timestamp;
        return Math.min(deltaTime, this.maxDeltaTime);
    }

    /**
     * Runs the update and render steps for one frame.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    runFrame(deltaTime) {
        this.update(deltaTime);
        this.draw();
    }

    /**
     * Schedules the next animation frame.
     *
     * @returns {void}
     */
    scheduleNextFrame() {
        this.animationId = requestAnimationFrame((nextTimestamp) => this.gameLoop(nextTimestamp));
    }

    /**
     * Resets stored frame timing data.
     *
     * @returns {void}
     */
    resetFrameTiming() {
        this.lastFrameTime = 0;
    }

    /**
     * Cancels the active animation frame loop.
     *
     * @returns {void}
     */
    stopAnimationLoop() {
        cancelAnimationFrame(this.animationId);
    }
}