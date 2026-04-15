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
    endbossStatusBar = new StatusBar([
        'img/7_statusbars/2_statusbar_endboss/blue/blue0.png',
        'img/7_statusbars/2_statusbar_endboss/blue/blue20.png',
        'img/7_statusbars/2_statusbar_endboss/blue/blue40.png',
        'img/7_statusbars/2_statusbar_endboss/blue/blue60.png',
        'img/7_statusbars/2_statusbar_endboss/blue/blue80.png',
        'img/7_statusbars/2_statusbar_endboss/blue/blue100.png',
    ], 270, 8);
    bottleCounter = new CounterDisplay('img/7_statusbars/3_icons/icon_salsa_bottle.png', 540, 16);
    coinCounter = new CounterDisplay('img/7_statusbars/3_icons/icon_coin.png', 620, 16);
    bossFightStarted = false;
    throwableObjects = [];
    throwKeyPressed = false;

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
        this.handleBottleThrow();
        this.updateEndbossFightState();
        this.endbossStatusBar.setPercentage(this.level.endboss.energy);
        this.throwableObjects = this.throwableObjects.filter((bottle) => {
            bottle.update(deltaTime);
            return !bottle.shouldRemove();
        });
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
        this.addObjectsToMap(this.throwableObjects);
        this.addToMap(this.level.endboss);
        this.addToMap(this.character);

        this.ctx.restore();
        this.addToMap(this.healthStatusBar);
        if (this.bossFightStarted) {
            this.addToMap(this.endbossStatusBar);
        }
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
            this.throwableObjects.includes(mo) ||
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

    updateEndbossFightState() {
        if (this.bossFightStarted) return;

        let triggerX = this.level.endboss.x - 300;
        let characterFront = this.character.x + this.character.width;

        if (characterFront >= triggerX) {
            this.bossFightStarted = true;
        }
    }

    handleBottleThrow() {
        if (this.keyboard.D && !this.throwKeyPressed && !this.character.isDead()) {
            this.throwBottle();
        }

        this.throwKeyPressed = this.keyboard.D;
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
    }

    checkCollisions() {
        this.checkEnemyCollisions();
        this.checkCoinCollisions();
        this.checkBottleCollisions();
        this.checkThrowableCollisions();
    }

    checkEnemyCollisions() {
        this.level.enemies = this.level.enemies.filter((enemy) => {
            if (enemy.shouldRemove && enemy.shouldRemove()) {
                return false;
            }

            if (enemy.isDefeated || !this.character.isColliding(enemy)) {
                return true;
            }

            if (this.isStompCollision(enemy)) {
                enemy.stomp();
                this.character.bounce();
                return true;
            }

            this.character.hit();
            return true;
        });
    }

    isStompCollision(enemy) {
        let characterBottom = this.character.y + this.character.height - this.character.offset.bottom;
        let enemyTop = enemy.y + enemy.offset.top;

        return this.character.speedY > 0 && characterBottom <= enemyTop + 35;
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

    checkThrowableCollisions() {
        this.throwableObjects.forEach((bottle) => {
            if (bottle.isSplashing || !bottle.isColliding(this.level.endboss)) {
                return;
            }

            this.bossFightStarted = true;
            this.level.endboss.hit();
            bottle.startSplash();
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