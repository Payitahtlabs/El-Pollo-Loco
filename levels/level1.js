let level1;

function initLevel() {
    level1 = new Level(
        [
            new Chicken(520),
            new SmallChicken(760),
            new Chicken(980),
            new Chicken(1440),
            new SmallChicken(1860),
        ],
        [
            new Coin(380, 120),
            new Coin(620, 170),
            new Coin(860, 120),
            new Coin(1260, 160),
            new Coin(1540, 110),
            new Coin(1780, 170),
            new Coin(2140, 130),
        ],
        new Endboss(),
        [
            new Cloud(80, 18, 12),
            new Cloud(780, 35, 16),
            new Cloud(1480, 10, 10),
            new Cloud(2180, 28, 14),
        ],
        [
            new BackgroundObject('img/5_background/layers/air.png', -720),
            new BackgroundObject('img/5_background/layers/3_third_layer/2.png', -720),
            new BackgroundObject('img/5_background/layers/2_second_layer/2.png', -720),
            new BackgroundObject('img/5_background/layers/1_first_layer/2.png', -720),

            new BackgroundObject('img/5_background/layers/air.png', 0),
            new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 0),
            new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 0),
            new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 0),

            new BackgroundObject('img/5_background/layers/air.png', 720),
            new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 720),
            new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 720),
            new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 720),

            new BackgroundObject('img/5_background/layers/air.png', 1440),
            new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 1440),
            new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 1440),
            new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 1440),

            new BackgroundObject('img/5_background/layers/air.png', 2160),
            new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 2160),
            new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 2160),
            new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 2160),
        ],
        2880
    );
}
