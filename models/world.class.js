class World {
    // ── Spielobjekte ─────────────────────────────────────
    character = new Character();
    level = level1;
    healthStatusBar = new StatusBar([
        'img/7_statusbars/1_statusbar/2_statusbar_health/blue/0.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/blue/20.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/blue/40.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/blue/60.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/blue/80.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/blue/100.png',
    ], 12, 6);
    bottleCounter = new CounterDisplay('img/7_statusbars/3_icons/icon_salsa_bottle.png', 540, 16);
    coinCounter = new CounterDisplay('img/7_statusbars/3_icons/icon_coin.png', 620, 16);

    // ── Canvas ───────────────────────────────────────────
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    showHitboxes = false;

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
        this.healthStatusBar.setPercentage(this.character.energy);
        this.bottleCounter.setValue(this.character.collectedBottles);
        this.coinCounter.setValue(this.character.collectedCoins);
        this.level.coins.forEach((coin) => coin.animate(deltaTime));
        this.level.enemies.forEach((enemy) => {
            enemy.update(deltaTime, this.level.levelEndX);
            enemy.animate(deltaTime);
        });
        this.level.endboss.animate(deltaTime);
        this.checkCollisions();
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
        this.addToMap(this.healthStatusBar);
        this.bottleCounter.draw(this.ctx);
        this.coinCounter.draw(this.ctx);
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

        if (this.showHitboxes && this.shouldShowHitbox(mo)) {
            this.drawHitbox(mo);
        }

        if (mo.otherDirection) {
            this.flipImageBack(mo);
        }
    }

    drawHitbox(mo) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'rgba(0, 140, 255, 0.85)';
        this.ctx.rect(
            Math.round(mo.x + mo.offset.left),
            Math.round(mo.y + mo.offset.top),
            mo.width - mo.offset.left - mo.offset.right,
            mo.height - mo.offset.top - mo.offset.bottom
        );
        this.ctx.stroke();
    }

    shouldShowHitbox(mo) {
        return mo === this.character ||
            this.level.enemies.includes(mo) ||
            this.level.coins.includes(mo) ||
            this.level.bottles.includes(mo) ||
            mo === this.level.endboss;
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

    checkCollisions() {
        this.checkEnemyCollisions();
        this.checkCoinCollisions();
        this.checkBottleCollisions();
    }

    checkEnemyCollisions() {
        this.level.enemies.forEach((enemy) => {
            if (this.character.isColliding(enemy)) {
                this.character.hit();
            }
        });
    }

    checkCoinCollisions() {
        this.level.coins = this.level.coins.filter((coin) => {
            if (!this.character.isColliding(coin)) {
                return true;
            }

            this.character.collectCoin();
            return false;
        });
    }

    checkBottleCollisions() {
        this.level.bottles = this.level.bottles.filter((bottle) => {
            if (!this.character.isColliding(bottle)) {
                return true;
            }

            this.character.collectBottle();
            return false;
        });
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