class Level {
    enemies;
    clouds;
    backgroundObjects;
    levelEndX;

    constructor(enemies, clouds, backgroundObjects, levelEndX) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.levelEndX = levelEndX;
    }
}
