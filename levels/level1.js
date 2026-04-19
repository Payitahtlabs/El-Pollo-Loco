let level1;

function initLevel() {
    level1 = new Level(
        [
            new Chicken(860),
            new SmallChicken(1180),
            new Chicken(1560),
            new SmallChicken(1940),
        ],
        [
            new Coin(320, 260),
            new Coin(500, 240),
            new Coin(720, 260),
            new Coin(1040, 230),
            new Coin(1320, 250),
            new Coin(1680, 220),
            new Coin(2060, 250),
        ],
        [
            new SalsaBottle(420),
            new SalsaBottle(980),
            new SalsaBottle(1480),
            new SalsaBottle(2140),
            new SalsaBottle(2360),
        ],
        new Endboss(),
        [
            new Cloud(120, 18, 12),
            new Cloud(860, 34, 15),
            new Cloud(1600, 12, 11),
            new Cloud(2340, 26, 14),
        ],
        [
            new BackgroundObject('img/background/layers/air.png', -720),
            new BackgroundObject('img/background/layers/3_third_layer/2.png', -720),
            new BackgroundObject('img/background/layers/2_second_layer/2.png', -720),
            new BackgroundObject('img/background/layers/1_first_layer/2.png', -720),

            new BackgroundObject('img/background/layers/air.png', 0),
            new BackgroundObject('img/background/layers/3_third_layer/1.png', 0),
            new BackgroundObject('img/background/layers/2_second_layer/1.png', 0),
            new BackgroundObject('img/background/layers/1_first_layer/1.png', 0),

            new BackgroundObject('img/background/layers/air.png', 720),
            new BackgroundObject('img/background/layers/3_third_layer/2.png', 720),
            new BackgroundObject('img/background/layers/2_second_layer/2.png', 720),
            new BackgroundObject('img/background/layers/1_first_layer/2.png', 720),

            new BackgroundObject('img/background/layers/air.png', 1440),
            new BackgroundObject('img/background/layers/3_third_layer/1.png', 1440),
            new BackgroundObject('img/background/layers/2_second_layer/1.png', 1440),
            new BackgroundObject('img/background/layers/1_first_layer/1.png', 1440),

            new BackgroundObject('img/background/layers/air.png', 2160),
            new BackgroundObject('img/background/layers/3_third_layer/2.png', 2160),
            new BackgroundObject('img/background/layers/2_second_layer/2.png', 2160),
            new BackgroundObject('img/background/layers/1_first_layer/2.png', 2160),
        ],
        2880
    );
}
