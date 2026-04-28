World.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(Math.round(this.camera_x), 0);
    this.drawWorldObjects();
    this.ctx.restore();
    this.drawHud();
};

World.prototype.drawWorldObjects = function () {
    this.getWorldRenderGroups().forEach((objects) => this.addObjectsToMap(objects));
    this.getWorldRenderObjects().forEach((object) => this.addToMap(object));
};

World.prototype.drawHud = function () {
    this.getHudObjects().forEach((object) => this.addToMap(object));
    this.drawHudCounters();
};

World.prototype.getWorldRenderGroups = function () {
    return [
        this.level.backgroundObjects,
        this.level.clouds,
        this.level.coins,
        this.level.bottles,
        this.level.enemies,
        this.throwableObjects,
    ];
};

World.prototype.getWorldRenderObjects = function () {
    return [this.level.endboss, this.character];
};

World.prototype.getHudObjects = function () {
    let hudObjects = [this.healthStatusBar];

    if (this.shouldDrawEndbossStatusBar()) {
        hudObjects.push(this.endbossStatusBar);
    }

    return hudObjects;
};

World.prototype.shouldDrawEndbossStatusBar = function () {
    return this.bossFightStarted;
};

World.prototype.drawHudCounters = function () {
    this.bottleCounter.draw(this.ctx);
    this.coinCounter.draw(this.ctx);
};

World.prototype.addObjectsToMap = function (objects) {
    objects.forEach((object) => this.addToMap(object));
};

World.prototype.addToMap = function (mo) {
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
};

World.prototype.drawHitbox = function (mo) {
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
};

World.prototype.shouldShowHitbox = function (mo) {
    return mo === this.character ||
        this.level.enemies.includes(mo) ||
        this.level.coins.includes(mo) ||
        this.level.bottles.includes(mo) ||
        this.throwableObjects.includes(mo) ||
        mo === this.level.endboss;
};

World.prototype.flipImage = function (mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
};

World.prototype.flipImageBack = function (mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
};