/**
 * Container for all objects and boundaries that define a playable level.
 */
class Level {
    enemies;
    coins;
    bottles;
    endboss;
    clouds;
    backgroundObjects;
    levelEndX;
    playerMinX = 0;

    /**
     * Bundles all level objects and horizontal boundaries into one shared state object.
     *
     * @param {MovableObject[]} enemies Enemy instances inside the level.
     * @param {DrawableObject[]} coins Collectible coin instances.
     * @param {DrawableObject[]} bottles Collectible bottle instances.
     * @param {Endboss} endboss Level endboss instance.
     * @param {Cloud[]} clouds Background cloud instances.
     * @param {DrawableObject[]} backgroundObjects Static background tiles.
     * @param {number} levelEndX Horizontal level end position.
     */
    constructor(enemies, coins, bottles, endboss, clouds, backgroundObjects, levelEndX) {
        this.enemies = enemies;
        this.coins = coins;
        this.bottles = bottles;
        this.endboss = endboss;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.levelEndX = levelEndX;
    }
}
