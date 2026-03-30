class World {
    // ── Spielobjekte ─────────────────────────────────────
    character = new Character();
    enemies = [
        new Chicken(),
        new Chicken(),
        new Chicken(),
    ];

    clouds = [
        new Cloud()
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

        this.gameLoop();
    }

    // ── Game Loop ────────────────────────────────────────
    gameLoop() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    // ── Logik (wird später befüllt) ──────────────────────
    update() {
        // this.checkCollisions();
        // this.character.move();
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
        this.gameLoop();
    }

    gameOver() {
        cancelAnimationFrame(this.animationId);
    }
}