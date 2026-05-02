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

    /**
     * Updates movement and input-driven state for the current frame.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @param {Keyboard} keyboard Current keyboard input state.
     * @param {Level} level Active level data used for movement bounds.
     * @returns {void}
     */
    update(deltaTime, keyboard, level) {
        this.prepareFrameState(deltaTime, keyboard);

        if (this.shouldStopMovementUpdate()) {
            return;
        }

        this.updateHorizontalMovement(deltaTime, keyboard);
        this.handleJumpInput(keyboard);
        this.clampHorizontalPosition(level);
    }

    /**
     * Resets frame-specific state before movement handling.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @param {Keyboard} keyboard Current keyboard input state.
     * @returns {void}
     */
    prepareFrameState(deltaTime, keyboard) {
        this.isMoving = keyboard.right || keyboard.left;
        this.didJumpThisFrame = false;
        this.applyGravity(deltaTime);
        this.updateIdleTime(deltaTime);
    }

    /**
     * Determines whether movement handling should stop for the current frame.
     *
     * @returns {boolean} True when movement updates should be skipped.
     */
    shouldStopMovementUpdate() {
        if (!this.isMovementBlocked()) {
            return false;
        }

        this.stopActiveMovementInputs();
        return true;
    }

    /**
     * Checks whether the character is currently prevented from moving.
     *
     * @returns {boolean} True when movement is blocked.
     */
    isMovementBlocked() {
        return this.isDead() || this.isHurtMovementLocked();
    }

    /**
     * Checks whether the hurt animation still locks movement.
     *
     * @returns {boolean} True while hurt movement lock is active.
     */
    isHurtMovementLocked() {
        return this.isHurtAnimationActive();
    }

    /**
     * Returns the elapsed time since the last hit.
     *
     * @returns {number} Seconds since the last registered hit.
     */
    getTimeSinceLastHit() {
        return (Date.now() - this.lastHit) / 1000;
    }

    /**
     * Clears currently active movement-related input state.
     *
     * @returns {void}
     */
    stopActiveMovementInputs() {
        this.isMoving = false;
        this.jumpKeyPressed = false;
    }

    /**
     * Updates horizontal movement based on active keyboard input.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @param {Keyboard} keyboard Current keyboard input state.
     * @returns {void}
     */
    updateHorizontalMovement(deltaTime, keyboard) {
        if (keyboard.right) {
            this.moveRightWithFacing(deltaTime);
        }

        if (keyboard.left) {
            this.moveLeftWithFacing(deltaTime);
        }
    }

    /**
     * Moves the character right and updates the facing direction.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    moveRightWithFacing(deltaTime) {
        this.otherDirection = false;
        this.moveRight(deltaTime);
    }

    /**
     * Moves the character left and updates the facing direction.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    moveLeftWithFacing(deltaTime) {
        this.otherDirection = true;
        this.moveLeft(deltaTime);
    }

    /**
     * Keeps the character within the level's horizontal bounds.
     *
     * @param {Level} level Active level data.
     * @returns {void}
     */
    clampHorizontalPosition(level) {
        let minX = level.playerMinX ?? 0;

        if (this.x < minX) {
            this.x = minX;
        }

        if (this.x + this.width > level.levelEndX) {
            this.x = level.levelEndX - this.width;
        }
    }

    /**
     * Starts a jump once per key press while the character is grounded.
     *
     * @param {Keyboard} keyboard Current keyboard input state.
     * @returns {void}
     */
    handleJumpInput(keyboard) {
        let jumpKeyActive = keyboard.up || keyboard.space;

        if (jumpKeyActive && !this.jumpKeyPressed && this.jump()) {
            this.didJumpThisFrame = true;
        }

        this.jumpKeyPressed = jumpKeyActive;
    }

    /**
     * Tracks how long the character has been idle on the ground.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    updateIdleTime(deltaTime) {
        if (this.isMoving || this.isAboveGround() || this.isHurt() || this.isDead()) {
            this.idleTime = 0;
            return;
        }

        this.idleTime += deltaTime;
    }

    /**
     * Increases the collected coin count by one.
     *
     * @returns {void}
     */
    collectCoin() {
        this.collectedCoins++;
    }

    /**
     * Increases the collected bottle count by one.
     *
     * @returns {void}
     */
    collectBottle() {
        this.collectedBottles++;
    }

    /**
     * Checks whether the character currently carries a throwable bottle.
     *
     * @returns {boolean} True when at least one bottle is available.
     */
    hasBottle() {
        return this.collectedBottles > 0;
    }

    /**
     * Consumes one carried bottle for a throw action.
     *
     * @returns {boolean} True when a bottle was consumed.
     */
    throwBottle() {
        if (!this.hasBottle()) return false;

        this.collectedBottles--;
        return true;
    }

    /**
     * Applies incoming damage and resets the death animation when the hit becomes fatal.
     *
     * @returns {boolean} True when the hit was applied.
     */
    hit() {
        let wasDead = this.isDead();

        if (!super.hit()) {
            return false;
        }

        this.resetDeathAnimationIfNeeded(wasDead);

        return true;
    }

    /**
     * Resets the death animation state when the character dies from the latest hit.
     *
     * @param {boolean} wasDead Whether the character was already dead before the hit.
     * @returns {void}
     */
    resetDeathAnimationIfNeeded(wasDead) {
        if (wasDead || !this.isDead()) {
            return;
        }

        this.currentImage = 0;
        this.animationCounter = 0;
        this.deathAnimationFinished = false;
    }

    /**
     * Resolves the visible animation for the current frame.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    animate(deltaTime) {
        if (this.animatePriorityStates(deltaTime)) {
            return;
        }

        this.animateWalkState(deltaTime);
    }

    /**
     * Runs all higher-priority animation states before walking.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {boolean} True when a priority animation handled the frame.
     */
    animatePriorityStates(deltaTime) {
        return this.animateDeathState(deltaTime)
            || this.animateHurtState(deltaTime)
            || this.animateJumpState(deltaTime)
            || this.animateIdleState(deltaTime);
    }

    /**
     * Resolves and plays the death animation when the character is dead.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {boolean} True when the death state is active.
     */
    animateDeathState(deltaTime) {
        if (!this.isDead()) {
            return false;
        }

        this.wasMoving = false;
        this.setAnimationState('dead', this.deadImages);
        this.animateDeath(deltaTime);
        return true;
    }

    /**
     * Resolves and plays the hurt animation when the hurt window is active.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {boolean} True when the hurt state is active.
     */
    animateHurtState(deltaTime) {
        if (!this.isHurtAnimationActive()) {
            return false;
        }

        this.wasMoving = false;
        this.setAnimationState('hurt', this.hurtImages);
        this.playStateAnimation(deltaTime, this.hurtImages);
        return true;
    }

    /**
     * Checks whether the short hurt animation should still be shown.
     *
     * @returns {boolean} True while the hurt animation is active.
     */
    isHurtAnimationActive() {
        if (!this.isHurt()) {
            return false;
        }

        return this.getTimeSinceLastHit() < this.hurtAnimationDuration;
    }

    /**
     * Resolves and plays the jump animation while airborne.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {boolean} True when the jump state is active.
     */
    animateJumpState(deltaTime) {
        if (!this.isAboveGround()) {
            return false;
        }

        this.wasMoving = false;
        this.setAnimationState('jump', this.jumpingImages);
        this.playStateAnimation(deltaTime, this.jumpingImages);
        return true;
    }

    /**
     * Resolves and plays idle animations when the character stands still.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {boolean} True when an idle state is active.
     */
    animateIdleState(deltaTime) {
        if (this.isMoving) {
            return false;
        }

        this.wasMoving = false;
        this.animateIdleVariant(deltaTime);
        return true;
    }

    /**
     * Chooses between regular idle and long-idle animation variants.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    animateIdleVariant(deltaTime) {
        if (this.isLongIdleReady()) {
            this.playIdleAnimationVariant(deltaTime, 'long-idle', this.longIdleImages);
            return;
        }

        this.playIdleAnimationVariant(deltaTime, 'idle', this.idleImages);
    }

    /**
     * Checks whether the long-idle delay has elapsed.
     *
     * @returns {boolean} True when long-idle animation may start.
     */
    isLongIdleReady() {
        return this.idleTime >= this.longIdleDelay;
    }

    /**
     * Checks whether the current animation state is long-idle.
     *
     * @returns {boolean} True when the long-idle animation is active.
     */
    isLongIdleActive() {
        return this.currentAnimationState === 'long-idle';
    }

    /**
     * Plays the requested idle animation variant.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @param {string} state Animation state name.
     * @param {string[]} frames Animation frames for the state.
     * @returns {void}
     */
    playIdleAnimationVariant(deltaTime, state, frames) {
        this.setAnimationState(state, frames);
        this.playStateAnimation(deltaTime, frames);
    }

    /**
     * Resolves and plays the walking animation.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    animateWalkState(deltaTime) {
        this.setAnimationState('walk', this.walkingImages);
        this.wasMoving = true;

        this.playStateAnimation(deltaTime, this.walkingImages);
    }

    /**
     * Advances the current animation frames when their timing is due.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @param {string[]} frames Animation frames to play.
     * @returns {void}
     */
    playStateAnimation(deltaTime, frames) {
        if (!this.isAnimationFrameDue(deltaTime)) {
            return;
        }

        this.playAnimation(frames);
    }

    /**
     * Switches the active animation state and resets frame counters.
     *
     * @param {string} state Animation state name.
     * @param {?string[]} [frames=null] Optional frames used to prime the first image.
     * @returns {void}
     */
    setAnimationState(state, frames = null) {
        if (this.currentAnimationState === state) {
            return;
        }

        this.currentAnimationState = state;
        this.animationFps = this.animationSpeeds[state] || 10;
        this.currentImage = 0;
        this.animationCounter = 0;

        if (frames) {
            this.img = this.imageCache[frames[0]];
            this.currentImage = 1;
        }
    }

    /**
     * Advances the death animation until the final frame remains visible.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {void}
     */
    animateDeath(deltaTime) {
        if (this.isDeathAnimationComplete()) {
            this.showFinalDeathFrame();
            return;
        }

        if (this.tryAnimateDeathFrame(deltaTime)) {
            return;
        }

        this.finishDeathAnimation();
    }

    /**
     * Checks whether the death animation already finished.
     *
     * @returns {boolean} True when the final death frame should persist.
     */
    isDeathAnimationComplete() {
        return this.deathAnimationFinished;
    }

    /**
     * Advances to the next death frame when animation timing allows it.
     *
     * @param {number} deltaTime Time since the previous frame in seconds.
     * @returns {boolean} True when a death frame was advanced.
     */
    tryAnimateDeathFrame(deltaTime) {
        if (!this.isAnimationFrameDue(deltaTime) || !this.hasRemainingDeathFrames()) {
            return false;
        }

        this.showNextDeathFrame();
        return true;
    }

    /**
     * Checks whether more death frames remain to be displayed.
     *
     * @returns {boolean} True when more death frames are available.
     */
    hasRemainingDeathFrames() {
        return this.currentImage < this.deadImages.length;
    }

    /**
     * Shows the next frame in the death animation sequence.
     *
     * @returns {void}
     */
    showNextDeathFrame() {
        this.img = this.imageCache[this.deadImages[this.currentImage]];
        this.currentImage++;
    }

    /**
     * Marks the death animation as finished and keeps the last frame visible.
     *
     * @returns {void}
     */
    finishDeathAnimation() {
        this.deathAnimationFinished = true;
        this.showFinalDeathFrame();
    }

    /**
     * Shows the final death frame.
     *
     * @returns {void}
     */
    showFinalDeathFrame() {
        this.img = this.imageCache[this.deadImages[this.deadImages.length - 1]];
    }
}