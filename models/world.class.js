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
        if (this.gameWon || this.gameLost) {
            return;
        }

        this.updateWorldState(deltaTime);
        this.updateDisplayState();
        this.updateThrowableObjects(deltaTime);
        this.updateLevelObjects(deltaTime);
        this.updateEndboss(deltaTime);
        this.checkCollisions();
        this.playPendingEndbossSounds();
        this.checkLoseCondition();
        this.checkWinCondition();
        this.updateCamera();
    }

    updateWorldState(deltaTime) {
        this.level.playerMinX = this.bossFightStarted ? this.bossArenaLeftX : 0;
        this.level.clouds.forEach((cloud) => cloud.update(deltaTime, this.level.levelEndX));
        this.character.update(deltaTime, this.keyboard, this.level);
        this.character.animate(deltaTime);
        this.playJumpSoundIfNeeded();
        this.handleBottleThrow();
        this.updateEndbossFightState();
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

    // ── Rendering ────────────────────────────────────────
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(Math.round(this.camera_x), 0);
        this.drawWorldObjects();
        this.ctx.restore();
        this.drawHud();
    }

    drawWorldObjects() {
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.level.coins);
        this.addObjectsToMap(this.level.bottles);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.addToMap(this.level.endboss);
        this.addToMap(this.character);
    }

    drawHud() {
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
            this.startBossFight(triggerX);
        }
    }

    startBossFight(triggerX = this.level.endboss.x - 300) {
        if (this.bossFightStarted) {
            return;
        }

        this.bossFightStarted = true;
        this.bossArenaLeftX = Math.max(0, triggerX - 180);
        this.audioManager?.crossfadeToBossMusic();
        this.audioManager?.playSound('endbossAlert');
    }

    playPendingEndbossSounds() {
        this.level.endboss.consumeAudioEvents().forEach((eventName) => {
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
        });
    }

    playJumpSoundIfNeeded() {
        if (this.character.didJumpThisFrame) {
            this.audioManager?.playSound('jump');
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
        this.audioManager?.playSound('bottleThrow');
    }

    checkCollisions() {
        this.checkEnemyCollisions();
        this.checkCoinCollisions();
        this.checkBottleCollisions();
        this.checkThrowableCollisions();
        this.checkEndbossCollisions();
    }

    checkEnemyCollisions() {
        this.level.enemies = this.level.enemies.filter((enemy) => {
            if (!this.shouldKeepEnemy(enemy)) {
                return false;
            }

            this.handleEnemyCollision(enemy);
            return true;
        });
    }

    shouldKeepEnemy(enemy) {
        return !(enemy.shouldRemove && enemy.shouldRemove());
    }

    handleEnemyCollision(enemy) {
        if (enemy.isDefeated || !this.character.isColliding(enemy)) {
            return;
        }

        if (this.isStompCollision(enemy)) {
            this.handleEnemyStomp(enemy);
            return;
        }

        this.handleEnemyTouchDamage();
    }

    handleEnemyStomp(enemy) {
        enemy.stomp();
        this.playChickenStompSound(enemy);
        this.maybeDropBottle(enemy);
        this.character.bounce();
    }

    handleEnemyTouchDamage() {
        if (this.character.hit()) {
            this.audioManager?.playSound('characterHurt');
        }
    }

    isStompCollision(enemy) {
        let characterBottom = this.character.y + this.character.height - this.character.offset.bottom;
        let enemyTop = enemy.y + enemy.offset.top;

        return this.character.speedY > 0 && characterBottom <= enemyTop + 35;
    }

    isChickenEnemy(enemy) {
        return enemy instanceof Chicken || enemy instanceof SmallChicken;
    }

    isSmallChicken(enemy) {
        return enemy instanceof SmallChicken;
    }

    playChickenStompSound(enemy) {
        if (!this.isChickenEnemy(enemy)) {
            return;
        }

        this.audioManager?.playSound('chickenStomp');

        if (this.isSmallChicken(enemy)) {
            this.audioManager?.playSound('chickenSmallStompAccent');
            return;
        }

        this.audioManager?.playSound('chickenStompAccent');
    }

    playChickenBottleHitSound(enemy) {
        if (!this.isChickenEnemy(enemy)) {
            return;
        }

        this.audioManager?.playSound('chickenHit');
        this.audioManager?.playSound(this.isSmallChicken(enemy) ? 'chickenSmallHurt' : 'chickenHurt');
    }

    checkCoinCollisions() {
        this.level.coins = this.collectLevelItems(
            this.level.coins,
            () => this.character.collectCoin(),
            'coinCollect'
        );
    }

    checkBottleCollisions() {
        this.level.bottles = this.collectLevelItems(
            this.level.bottles,
            () => this.character.collectBottle(),
            'bottleCollect'
        );
    }

    collectLevelItems(items, collectItem, soundName) {
        return items.filter((item) => {
            if (!this.character.isColliding(item)) {
                return true;
            }

            collectItem();
            this.audioManager?.playSound(soundName);
            return false;
        });
    }

    checkThrowableCollisions() {
        this.throwableObjects.forEach((bottle) => {
            if (bottle.isSplashing) {
                return;
            }

            if (this.handleThrowableEnemyCollision(bottle)) {
                return;
            }

            this.handleThrowableEndbossCollision(bottle);
        });
    }

    handleThrowableEnemyCollision(bottle) {
        let hitEnemy = this.level.enemies.find((enemy) => !enemy.isDefeated && bottle.isColliding(enemy));

        if (!hitEnemy) {
            return false;
        }

        hitEnemy.stomp();
        this.playChickenBottleHitSound(hitEnemy);
        bottle.startSplash();
        return true;
    }

    handleThrowableEndbossCollision(bottle) {
        if (this.level.endboss.isDead() || !bottle.isColliding(this.level.endboss)) {
            return;
        }

        this.startBossFight();
        this.level.endboss.hit();
        bottle.startSplash();
    }

    maybeDropBottle(enemy) {
        if (!(enemy instanceof Chicken) || Math.random() >= this.bottleDropChance) {
            return;
        }

        let dropX = enemy.x + enemy.width / 2 - 40;
        let droppedBottle = new SalsaBottle(dropX);
        droppedBottle.startDropEffect();
        this.level.bottles.push(droppedBottle);
    }

    checkEndbossCollisions() {
        if (!this.canEndbossDamageCharacter()) {
            return;
        }

        if (!this.character.isColliding(this.level.endboss)) {
            return;
        }

        this.handleEndbossCharacterHit();
    }

    canEndbossDamageCharacter() {
        return !this.level.endboss.isDead() && this.bossFightStarted && this.level.endboss.isAttacking();
    }

    handleEndbossCharacterHit() {
        if (this.character.hit()) {
            this.audioManager?.playSound('endbossImpact');
            this.audioManager?.playSound('characterHurt');
        }
    }

    checkLoseCondition() {
        if (this.gameWon || this.gameLost || !this.character.isDead() || !this.character.deathAnimationFinished) {
            return;
        }

        this.gameLost = true;
        this.showGameOverOverlay();

        if (this.onGameLost) {
            this.onGameLost();
        }
    }

    checkWinCondition() {
        if (this.gameWon || this.gameLost || !this.level.endboss.isDead() || !this.level.endboss.deathAnimationFinished) {
            return;
        }

        this.gameWon = true;
        this.showWinOverlay();

        if (this.onGameWon) {
            this.onGameWon();
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