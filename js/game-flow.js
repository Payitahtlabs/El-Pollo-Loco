/**
 * Starts a new run from the home screen if no world is currently active.
 *
 * @returns {void}
 */
function startGame() {
    if (world) {
        return;
    }

    prepareGameStart();
    initializeGame();
}

/**
 * Prepares the visible shell and audio state for a new run.
 *
 * @returns {void}
 */
function prepareGameStart() {
    hideStartScreen();
    showGameCanvas();
    detachStartListeners();
    showTouchControls();
    prepareRunAudio();
}

function hideStartScreen() {
    if (!startScreen) {
        return;
    }

    startScreen.classList.add('hidden');
    startScreen.setAttribute('aria-hidden', 'true');
}

function showStartScreen() {
    if (!startScreen) {
        return;
    }

    startScreen.classList.remove('hidden');
    startScreen.setAttribute('aria-hidden', 'false');
}

/**
 * Initializes level state, keyboard input, and the active world instance.
 *
 * @returns {void}
 */
function initializeGame() {
    initLevel();
    keyboard = new Keyboard();
    world = new World(canvas, keyboard, {
        audioManager,
        onGameLost: enableRestart,
        onGameWon: enableRestart,
    });
}

/**
 * Restarts the active run without reloading the page.
 *
 * @returns {void}
 */
function restartGame() {
    if (!world) {
        return;
    }

    teardownCurrentGame();
    detachRestartListeners();
    showTouchControls();
    prepareRunAudio();
    initializeGame();
}

/**
 * Tears down the active run and returns the shell to the home screen.
 *
 * @returns {void}
 */
function returnToHome() {
    teardownCurrentGame();
    detachRestartListeners();
    hideTouchControls();
    stopGameAudio();
    hideGameEndScreens();
    hideGameCanvas();
    showStartScreen();
    attachStartListeners();
}

/**
 * Resets and starts the gameplay music for a new run.
 *
 * @returns {void}
 */
function prepareRunAudio() {
    audioManager.unlockAudio();
    audioManager.resetMusicBlend();
    audioManager.playBackgroundMusic();
}

/**
 * Stops the active game music tracks.
 *
 * @returns {void}
 */
function stopGameAudio() {
    if (audioManager) {
        audioManager.stopAllMusic();
    }
}

function hideGameEndScreens() {
    if (winScreen) {
        winScreen.classList.add('hidden');
        winScreen.setAttribute('aria-hidden', 'true');
    }

    if (gameOverScreen) {
        gameOverScreen.classList.add('hidden');
        gameOverScreen.setAttribute('aria-hidden', 'true');
    }
}

function showGameCanvas() {
    if (canvas) {
        canvas.classList.remove('hidden');
    }
}

function hideGameCanvas() {
    if (canvas) {
        canvas.classList.add('hidden');
    }
}

/**
 * Tears down the active world and input handlers for the current run.
 *
 * @returns {void}
 */
function teardownCurrentGame() {
    resetTouchInputState();

    if (world) {
        world.gameOver();
        world = null;
    }

    if (keyboard) {
        keyboard.destroy();
        keyboard = null;
    }
}