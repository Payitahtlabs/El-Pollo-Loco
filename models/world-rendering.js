/**
 * Renders a complete frame including the scrolling world and static HUD elements.
 *
 * @returns {void}
 */
World.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(Math.round(this.camera_x), 0);
    this.drawWorldObjects();
    this.ctx.restore();
    this.drawHud();
};

/**
 * Draws all world-space objects that should move with the camera.
 *
 * @returns {void}
 */
World.prototype.drawWorldObjects = function () {
    this.getWorldRenderGroups().forEach((objects) => this.addObjectsToMap(objects));
    this.getWorldRenderObjects().forEach((object) => this.addToMap(object));
};

/**
 * Draws the fixed HUD layer on top of the world rendering.
 *
 * @returns {void}
 */
World.prototype.drawHud = function () {
    this.getHudObjects().forEach((object) => this.addToMap(object));
    this.drawHudCounters();
};

/**
 * Returns grouped world arrays that should be rendered with camera movement.
 *
 * @returns {DrawableObject[][]} World-space render groups.
 */
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

/**
 * Returns single world objects rendered after grouped objects.
 *
 * @returns {DrawableObject[]} Ordered world objects.
 */
World.prototype.getWorldRenderObjects = function () {
    return [this.level.endboss, this.character];
};

/**
 * Returns the HUD objects that should be rendered in the current frame.
 *
 * @returns {DrawableObject[]} Visible HUD objects.
 */
World.prototype.getHudObjects = function () {
    let hudObjects = [this.healthStatusBar];

    if (this.shouldDrawEndbossStatusBar()) {
        hudObjects.push(this.endbossStatusBar);
    }

    return hudObjects;
};

/**
 * Checks whether the endboss status bar should currently be drawn.
 *
 * @returns {boolean} True when the boss fight has started.
 */
World.prototype.shouldDrawEndbossStatusBar = function () {
    return this.bossFightStarted;
};

/**
 * Draws the collectible counters on the HUD.
 *
 * @returns {void}
 */
World.prototype.drawHudCounters = function () {
    this.bottleCounter.draw(this.ctx);
    this.coinCounter.draw(this.ctx);
};

/**
 * Draws all objects from a render group.
 *
 * @param {DrawableObject[]} objects Objects to draw.
 * @returns {void}
 */
World.prototype.addObjectsToMap = function (objects) {
    objects.forEach((object) => this.addToMap(object));
};

/**
 * Draws a single world object, including optional horizontal mirroring and debug hitboxes.
 *
 * @param {DrawableObject} mo World object to draw.
 * @returns {void}
 */
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

/**
 * Draws the configured debug hitbox for the given object.
 *
 * @param {DrawableObject} mo World object whose hitbox should be visualized.
 * @returns {void}
 */
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

/**
 * Checks whether a given object should show its debug hitbox.
 *
 * @param {DrawableObject} mo World object being rendered.
 * @returns {boolean} True when the object's hitbox should be drawn.
 */
World.prototype.shouldShowHitbox = function (mo) {
    return mo === this.character ||
        this.level.enemies.includes(mo) ||
        this.level.coins.includes(mo) ||
        this.level.bottles.includes(mo) ||
        this.throwableObjects.includes(mo) ||
        mo === this.level.endboss;
};

/**
 * Mirrors a drawable object horizontally before rendering left-facing sprites.
 *
 * @param {DrawableObject} mo World object to mirror.
 * @returns {void}
 */
World.prototype.flipImage = function (mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
};

/**
 * Restores the canvas state after a mirrored sprite was drawn.
 *
 * @param {DrawableObject} mo World object that was mirrored.
 * @returns {void}
 */
World.prototype.flipImageBack = function (mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
};