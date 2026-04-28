World.prototype.checkCollisions = function () {
    this.checkEnemyCollisions();
    this.checkCoinCollisions();
    this.checkBottleCollisions();
    this.checkThrowableCollisions();
    this.checkEndbossCollisions();
};

World.prototype.checkEnemyCollisions = function () {
    this.level.enemies = this.level.enemies.filter((enemy) => {
        if (!this.shouldKeepEnemy(enemy)) {
            return false;
        }

        this.handleEnemyCollision(enemy);
        return true;
    });
};

World.prototype.shouldKeepEnemy = function (enemy) {
    return !(enemy.shouldRemove && enemy.shouldRemove());
};

World.prototype.handleEnemyCollision = function (enemy) {
    if (enemy.isDefeated || !this.character.isColliding(enemy)) {
        return;
    }

    if (this.isStompCollision(enemy)) {
        this.handleEnemyStomp(enemy);
        return;
    }

    this.handleEnemyTouchDamage();
};

World.prototype.handleEnemyStomp = function (enemy) {
    enemy.stomp();
    this.playChickenStompSound(enemy);
    this.maybeDropBottle(enemy);
    this.character.bounce();
};

World.prototype.handleEnemyTouchDamage = function () {
    if (this.character.hit()) {
        this.audioManager?.playSound('characterHurt');
    }
};

World.prototype.isStompCollision = function (enemy) {
    let characterBottom = this.character.y + this.character.height - this.character.offset.bottom;
    let enemyTop = enemy.y + enemy.offset.top;

    return this.character.speedY > 0 && characterBottom <= enemyTop + 35;
};

World.prototype.isChickenEnemy = function (enemy) {
    return enemy instanceof Chicken || enemy instanceof SmallChicken;
};

World.prototype.isSmallChicken = function (enemy) {
    return enemy instanceof SmallChicken;
};

World.prototype.playChickenStompSound = function (enemy) {
    if (!this.isChickenEnemy(enemy)) {
        return;
    }

    this.audioManager?.playSound('chickenStomp');

    if (this.isSmallChicken(enemy)) {
        this.audioManager?.playSound('chickenSmallStompAccent');
        return;
    }

    this.audioManager?.playSound('chickenStompAccent');
};

World.prototype.playChickenBottleHitSound = function (enemy) {
    if (!this.isChickenEnemy(enemy)) {
        return;
    }

    this.audioManager?.playSound('chickenHit');
    this.audioManager?.playSound(this.isSmallChicken(enemy) ? 'chickenSmallHurt' : 'chickenHurt');
};

World.prototype.checkCoinCollisions = function () {
    this.level.coins = this.collectLevelItems(
        this.level.coins,
        () => this.character.collectCoin(),
        'coinCollect'
    );
};

World.prototype.checkBottleCollisions = function () {
    this.level.bottles = this.collectLevelItems(
        this.level.bottles,
        () => this.character.collectBottle(),
        'bottleCollect'
    );
};

World.prototype.collectLevelItems = function (items, collectItem, soundName) {
    return items.filter((item) => {
        if (!this.character.isColliding(item)) {
            return true;
        }

        collectItem();
        this.audioManager?.playSound(soundName);
        return false;
    });
};

World.prototype.checkThrowableCollisions = function () {
    this.throwableObjects.forEach((bottle) => {
        if (bottle.isSplashing) {
            return;
        }

        if (this.handleThrowableEnemyCollision(bottle)) {
            return;
        }

        this.handleThrowableEndbossCollision(bottle);
    });
};

World.prototype.handleThrowableEnemyCollision = function (bottle) {
    let hitEnemy = this.level.enemies.find((enemy) => !enemy.isDefeated && bottle.isColliding(enemy));

    if (!hitEnemy) {
        return false;
    }

    hitEnemy.stomp();
    this.playChickenBottleHitSound(hitEnemy);
    this.triggerBottleSplash(bottle);
    return true;
};

World.prototype.handleThrowableEndbossCollision = function (bottle) {
    if (this.level.endboss.isDead() || !bottle.isColliding(this.level.endboss)) {
        return;
    }

    this.startBossFight();
    this.level.endboss.hit();
    this.triggerBottleSplash(bottle);
};

World.prototype.triggerBottleSplash = function (bottle) {
    if (!bottle.startSplash()) {
        return;
    }

    this.audioManager?.playSound('bottleSplash');
};

World.prototype.maybeDropBottle = function (enemy) {
    if (!(enemy instanceof Chicken) || Math.random() >= this.bottleDropChance) {
        return;
    }

    let dropX = enemy.x + enemy.width / 2 - 40;
    let droppedBottle = new SalsaBottle(dropX);
    droppedBottle.startDropEffect();
    this.level.bottles.push(droppedBottle);
};

World.prototype.checkEndbossCollisions = function () {
    if (!this.canEndbossDamageCharacter()) {
        return;
    }

    if (!this.character.isColliding(this.level.endboss)) {
        return;
    }

    this.handleEndbossCharacterHit();
};

World.prototype.canEndbossDamageCharacter = function () {
    return !this.level.endboss.isDead() && this.bossFightStarted && this.level.endboss.isAttacking();
};

World.prototype.handleEndbossCharacterHit = function () {
    if (this.character.hit()) {
        this.audioManager?.playSound('endbossImpact');
        this.audioManager?.playSound('characterHurt');
    }
};