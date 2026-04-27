class Level {
    enemies;
    coins;
    bottles;
    endboss;
    clouds;
    backgroundObjects;
    levelEndX;
    playerMinX = 0;

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
