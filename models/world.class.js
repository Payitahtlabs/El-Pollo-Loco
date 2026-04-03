class World {
    // ── Spielobjekte ─────────────────────────────────────
    character = new Character();
    enemies = [
        new Chicken(),
        new Chicken(),
        new Chicken(),
    ];

    clouds = [
        new Cloud(80, 18, 12),
        new Cloud(420, 35, 16),
        new Cloud(760, 10, 10),
        new Cloud(1120, 28, 14),
        new Cloud(1480, 20, 18),
    ];

    backgroundObjects = [
        new BackgroundObject('img/5_background/layers/air.png', 0),
        new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 0),
        new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 0),
        new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 0),
    ];

    // ── Canvas ───────────────────────────────────────────
    canvas;
    ctx;

    // ── Game-Loop-Steuerung ──────────────────────────────
    animationId = null;
    lastFrameTime = 0;
    maxDeltaTime = 0.1;
    paused = false;
    drawables = [];

    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;

        // Alle Objekte in einer einzigen Liste zusammenführen
        this.drawables = [
            ...this.backgroundObjects,
            ...this.enemies,
            ...this.clouds,
            this.character,
        ];

        this.gameLoop(0);
    }

    // ── Game Loop ────────────────────────────────────────
    gameLoop(timestamp) {
        let deltaTime = this.lastFrameTime ? (timestamp - this.lastFrameTime) / 1000 : 0;
        this.lastFrameTime = timestamp;

        if (deltaTime > this.maxDeltaTime) deltaTime = this.maxDeltaTime;

        this.update(deltaTime);
        this.draw();
        this.animationId = requestAnimationFrame((nextTimestamp) => this.gameLoop(nextTimestamp));
    }

    // ── Logik (wird später befüllt) ──────────────────────
    update(deltaTime) {
        this.clouds.forEach((cloud) => cloud.update(deltaTime, this.canvas.width));
        this.character.animate(deltaTime);
    }

    // ── Rendering ────────────────────────────────────────
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawables.forEach(obj => this.addToMap(obj));
    }

    addToMap(mo) {
        if (!mo.img) return;
        this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
    }

    // ── Steuerung ────────────────────────────────────────
    pause() {
        this.paused = true;
        cancelAnimationFrame(this.animationId);
    }

    resume() {
        if (!this.paused) return;
        this.paused = false;
        this.lastFrameTime = 0;
        this.gameLoop(0);
    }

    gameOver() {
        cancelAnimationFrame(this.animationId);
    }
}