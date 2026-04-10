class World {
    // ── Spielobjekte ─────────────────────────────────────
    character = new Character();
    level = level1;

    // ── Canvas ───────────────────────────────────────────
    canvas;
    ctx;
    keyboard;
    camera_x = 0;

    // ── Game-Loop-Steuerung ──────────────────────────────
    animationId = null;
    lastFrameTime = 0;
    maxDeltaTime = 0.1;
    paused = false;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;

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

    // ── Logik ──────────────────────
    update(deltaTime) {
        this.level.clouds.forEach((cloud) => cloud.update(deltaTime, this.level.levelEndX));
        this.character.update(deltaTime, this.keyboard, this.level);
        this.character.animate(deltaTime);
        this.level.coins.forEach((coin) => coin.animate(deltaTime));
        this.level.enemies.forEach((enemy) => {
            enemy.update(deltaTime, this.level.levelEndX);
            enemy.animate(deltaTime);
        });
        this.level.endboss.animate(deltaTime);
        this.updateCamera();
    }

    // ── Rendering ────────────────────────────────────────
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(Math.round(this.camera_x), 0);

        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.level.coins);
        this.addObjectsToMap(this.level.bottles);
        this.addObjectsToMap(this.level.enemies);
        this.addToMap(this.level.endboss);
        this.addToMap(this.character);

        this.ctx.restore();
    }

    addObjectsToMap(objects) {
        objects.forEach((object) => this.addToMap(object));
    }

    addToMap(mo) {
        if (!mo.img) return;

        if (mo.otherDirection) {
            this.flipImage(mo);
        }

        this.ctx.drawImage(mo.img, Math.round(mo.x), Math.round(mo.y), mo.width, mo.height);

        if (mo.otherDirection) {
            this.flipImageBack(mo);
        }
    }

    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    flipImageBack(mo) {
        mo.x = mo.x * -1;
        this.ctx.restore();
    }

    updateCamera() {
        let maxCameraX = this.level.levelEndX - this.canvas.width;
        let targetCameraX = -this.character.x + 120;

        this.camera_x = Math.max(-maxCameraX, Math.min(0, targetCameraX));
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