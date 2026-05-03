/**
 * Represents Pepe as the player-controlled character.
 * Handles movement, state transitions, item collection, and animation flow.
 */
class Character extends MovableObject {

    x = 220;
    height = 280;
    y = 155;
    groundY = 155;
    speed = 240;
    isMoving = false;
    wasMoving = false;
    jumpKeyPressed = false;
    didJumpThisFrame = false;
    idleTime = 0;
    longIdleDelay = 10;
    hurtAnimationDuration = 0.24;
    hurtMovementLockDuration = 0.18;
    currentAnimationState = 'walk';
    animationSpeeds = {
        walk: 10,
        idle: 5,
        'long-idle': 3,
        jump: 12,
        hurt: 8,
        dead: 7,
    };
    collectedCoins = 0;
    collectedBottles = 0;
    deathAnimationFinished = false;
    offset = {
        top: 100,
        right: 20,
        bottom: 10,
        left: 20,
    };

    walkingImages = [
        'img/character_pepe/2_walk/W-21.png',
        'img/character_pepe/2_walk/W-22.png',
        'img/character_pepe/2_walk/W-23.png',
        'img/character_pepe/2_walk/W-24.png',
        'img/character_pepe/2_walk/W-25.png',
        'img/character_pepe/2_walk/W-26.png',
    ];

    idleImages = [
        'img/character_pepe/1_idle/idle/I-1.png',
        'img/character_pepe/1_idle/idle/I-2.png',
        'img/character_pepe/1_idle/idle/I-3.png',
        'img/character_pepe/1_idle/idle/I-4.png',
        'img/character_pepe/1_idle/idle/I-5.png',
        'img/character_pepe/1_idle/idle/I-6.png',
        'img/character_pepe/1_idle/idle/I-7.png',
        'img/character_pepe/1_idle/idle/I-8.png',
        'img/character_pepe/1_idle/idle/I-9.png',
        'img/character_pepe/1_idle/idle/I-10.png',
    ];

    longIdleImages = [
        'img/character_pepe/1_idle/long_idle/I-11.png',
        'img/character_pepe/1_idle/long_idle/I-12.png',
        'img/character_pepe/1_idle/long_idle/I-13.png',
        'img/character_pepe/1_idle/long_idle/I-14.png',
        'img/character_pepe/1_idle/long_idle/I-15.png',
        'img/character_pepe/1_idle/long_idle/I-16.png',
        'img/character_pepe/1_idle/long_idle/I-17.png',
        'img/character_pepe/1_idle/long_idle/I-18.png',
        'img/character_pepe/1_idle/long_idle/I-19.png',
        'img/character_pepe/1_idle/long_idle/I-20.png',
    ];

    jumpingImages = [
        'img/character_pepe/3_jump/J-31.png',
        'img/character_pepe/3_jump/J-32.png',
        'img/character_pepe/3_jump/J-33.png',
        'img/character_pepe/3_jump/J-34.png',
        'img/character_pepe/3_jump/J-35.png',
        'img/character_pepe/3_jump/J-36.png',
        'img/character_pepe/3_jump/J-37.png',
        'img/character_pepe/3_jump/J-38.png',
        'img/character_pepe/3_jump/J-39.png',
    ];

    hurtImages = [
        'img/character_pepe/4_hurt/H-41.png',
        'img/character_pepe/4_hurt/H-42.png',
        'img/character_pepe/4_hurt/H-43.png',
    ];

    deadImages = [
        'img/character_pepe/5_dead/D-51.png',
        'img/character_pepe/5_dead/D-52.png',
        'img/character_pepe/5_dead/D-53.png',
        'img/character_pepe/5_dead/D-54.png',
        'img/character_pepe/5_dead/D-55.png',
        'img/character_pepe/5_dead/D-56.png',
        'img/character_pepe/5_dead/D-57.png',
    ];

    /**
     * Preloads all animation assets for the playable character.
     */
    constructor() {
        super();
        this.loadImage(this.idleImages[0]);
        this.loadImages(this.idleImages);
        this.loadImages(this.longIdleImages);
        this.loadImages(this.walkingImages);
        this.loadImages(this.jumpingImages);
        this.loadImages(this.hurtImages);
        this.loadImages(this.deadImages);
    }
}