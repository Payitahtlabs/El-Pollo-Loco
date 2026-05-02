/**
 * Runs all collision checks for the current frame.
 *
 * @returns {void}
 */
World.prototype.checkCollisions = function () {
    this.checkEnemyCollisions();
    this.checkCoinCollisions();
    this.checkBottleCollisions();
    this.checkThrowableCollisions();
    this.checkEndbossCollisions();
};

/**
 * Resolves collisions between the character and standard level enemies.
 *
 * @returns {void}
 */
World.prototype.checkEnemyCollisions = function () {
    this.level.enemies = this.level.enemies.filter((enemy) => {
        if (!this.shouldKeepEnemy(enemy)) {
            return false;
        }

        this.handleEnemyCollision(enemy);
        return true;
    });
};

/**
 * Checks whether an enemy should remain in the level.
 *
 * @param {MovableObject} enemy Enemy instance being evaluated.
 * @returns {boolean} True when the enemy should stay active.
 */
World.prototype.shouldKeepEnemy = function (enemy) {
    return !(enemy.shouldRemove && enemy.shouldRemove());
};

/**
 * Handles a single enemy contact either as a stomp or as touch damage.
 *
 * @param {MovableObject} enemy Enemy currently being evaluated.
 * @returns {void}
 */
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

/**
 * Resolves a stomped enemy, its sounds, and a possible bottle drop.
 *
 * @param {MovableObject} enemy Enemy that was stomped.
 * @returns {void}
 */
World.prototype.handleEnemyStomp = function (enemy) {
    enemy.stomp();
    this.playChickenStompSound(enemy);
    this.maybeDropBottle(enemy);
    this.character.bounce();
};

/**
 * Applies touch damage from an enemy to the character.
 *
 * @returns {void}
 */
World.prototype.handleEnemyTouchDamage = function () {
    if (this.character.hit()) {
        this.audioManager?.playSound('characterHurt');
    }
};

/**
 * Determines whether the current enemy collision counts as a stomp from above.
 *
 * @param {MovableObject} enemy Enemy currently colliding with the character.
 * @returns {boolean} True when the character hits the enemy from above while falling.
 */
World.prototype.isStompCollision = function (enemy) {
    let characterBottom = this.character.y + this.character.height - this.character.offset.bottom;
    let enemyTop = enemy.y + enemy.offset.top;

    return this.character.speedY > 0 && characterBottom <= enemyTop + 35;
};

/**
 * Checks whether an enemy belongs to the chicken family.
 *
 * @param {MovableObject} enemy Enemy instance being evaluated.
 * @returns {boolean} True when the enemy is a chicken variant.
 */
World.prototype.isChickenEnemy = function (enemy) {
    return enemy instanceof Chicken || enemy instanceof SmallChicken;
};

/**
 * Checks whether an enemy is the small chicken variant.
 *
 * @param {MovableObject} enemy Enemy instance being evaluated.
 * @returns {boolean} True when the enemy is a small chicken.
 */
World.prototype.isSmallChicken = function (enemy) {
    return enemy instanceof SmallChicken;
};

/**
 * Plays the stomp sound sequence for a chicken enemy.
 *
 * @param {MovableObject} enemy Stomped enemy instance.
 * @returns {void}
 */
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

/**
 * Plays the bottle-hit sound sequence for a chicken enemy.
 *
 * @param {MovableObject} enemy Hit enemy instance.
 * @returns {void}
 */
World.prototype.playChickenBottleHitSound = function (enemy) {
    if (!this.isChickenEnemy(enemy)) {
        return;
    }

    this.audioManager?.playSound('chickenHit');
    this.audioManager?.playSound(this.isSmallChicken(enemy) ? 'chickenSmallHurt' : 'chickenHurt');
};

/**
 * Resolves coin pickups for the current frame.
 *
 * @returns {void}
 */
World.prototype.checkCoinCollisions = function () {
    this.level.coins = this.collectLevelItems(
        this.level.coins,
        () => this.character.collectCoin(),
        'coinCollect'
    );
};

/**
 * Resolves bottle pickups for the current frame.
 *
 * @returns {void}
 */
World.prototype.checkBottleCollisions = function () {
    this.level.bottles = this.collectLevelItems(
        this.level.bottles,
        () => this.character.collectBottle(),
        'bottleCollect'
    );
};

/**
 * Collects overlapping coins or bottles and removes them from the level.
 *
 * @template T
 * @param {T[]} items Collectible items to evaluate.
 * @param {Function} collectItem Callback that updates the character inventory.
 * @param {string} soundName Registered sound effect to play on collection.
 * @returns {T[]} Remaining items that were not collected.
 */
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

/**
 * Resolves bottle impacts against enemies and the endboss.
 *
 * @returns {void}
 */
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

/**
 * Resolves a thrown bottle hitting a regular enemy.
 *
 * @param {ThrowableBottle} bottle Active thrown bottle.
 * @returns {boolean} True when an enemy collision was handled.
 */
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

/**
 * Resolves a thrown bottle hitting the endboss.
 *
 * @param {ThrowableBottle} bottle Active thrown bottle.
 * @returns {void}
 */
World.prototype.handleThrowableEndbossCollision = function (bottle) {
    if (this.level.endboss.isDead() || !bottle.isColliding(this.level.endboss)) {
        return;
    }

    this.startBossFight();
    this.level.endboss.hit();
    this.triggerBottleSplash(bottle);
};

/**
 * Starts the bottle splash state and its sound effect.
 *
 * @param {ThrowableBottle} bottle Active thrown bottle.
 * @returns {void}
 */
World.prototype.triggerBottleSplash = function (bottle) {
    if (!bottle.startSplash()) {
        return;
    }

    this.audioManager?.playSound('bottleSplash');
};

/**
 * Drops a collectible bottle from a defeated regular chicken with a random chance.
 *
 * @param {MovableObject} enemy Defeated enemy instance.
 * @returns {void}
 */
World.prototype.maybeDropBottle = function (enemy) {
    if (!(enemy instanceof Chicken) || Math.random() >= this.bottleDropChance) {
        return;
    }

    let dropX = enemy.x + enemy.width / 2 - 40;
    let droppedBottle = new SalsaBottle(dropX);
    droppedBottle.startDropEffect();
    this.level.bottles.push(droppedBottle);
};

/**
 * Applies direct damage from an attacking endboss to the character.
 *
 * @returns {void}
 */
World.prototype.checkEndbossCollisions = function () {
    if (!this.canEndbossDamageCharacter()) {
        return;
    }

    if (!this.character.isColliding(this.level.endboss)) {
        return;
    }

    this.handleEndbossCharacterHit();
};

/**
 * Checks whether the endboss may currently damage the character.
 *
 * @returns {boolean} True when direct endboss damage is possible.
 */
World.prototype.canEndbossDamageCharacter = function () {
    return !this.level.endboss.isDead() && this.bossFightStarted && this.level.endboss.isAttacking();
};

/**
 * Applies damage from an attacking endboss to the character.
 *
 * @returns {void}
 */
World.prototype.handleEndbossCharacterHit = function () {
    if (this.character.hit()) {
        this.audioManager?.playSound('endbossImpact');
        this.audioManager?.playSound('characterHurt');
    }
};