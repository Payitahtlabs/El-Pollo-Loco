class Level {
    enemies;
    endboss;
    clouds;
    backgroundObjects;
    levelEndX;

    constructor(enemies, endboss, clouds, backgroundObjects, levelEndX) {
        this.enemies = enemies;
        this.endboss = endboss;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.levelEndX = levelEndX;
    }
}
