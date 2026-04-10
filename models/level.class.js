class Level {
    enemies;
    coins;
    endboss;
    clouds;
    backgroundObjects;
    levelEndX;

    constructor(enemies, coins, endboss, clouds, backgroundObjects, levelEndX) {
        this.enemies = enemies;
        this.coins = coins;
        this.endboss = endboss;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.levelEndX = levelEndX;
    }
}
