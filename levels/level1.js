let level1;

function initLevel() {
    level1 = new Level(
        [
            new Chicken(760),
            new Chicken(980),
            new SmallChicken(1360),
            new Chicken(1710),
            new SmallChicken(1980),
            new SmallChicken(2220),
        ],
        [
            new Coin(320, 225),
            new Coin(450, 155),
            new Coin(590, 105),
            new Coin(900, 220),
            new Coin(1030, 145),
            new Coin(1160, 220),
            new Coin(1460, 220),
            new Coin(1590, 145),
            new Coin(1720, 220),
            new Coin(2140, 225),
            new Coin(2270, 155),
            new Coin(2410, 105),
        ],
        [
            new SalsaBottle(460),
            new SalsaBottle(820),
            new SalsaBottle(1180),
            new SalsaBottle(1600),
            new SalsaBottle(1860),
            new SalsaBottle(2080),
            new SalsaBottle(2200),
            new SalsaBottle(2320),
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
