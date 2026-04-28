function startGame() {
    if (world) {
        return;
    }

    prepareGameStart();
    initializeGame();
}

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

function initializeGame() {
    initLevel();
    keyboard = new Keyboard();
    world = new World(canvas, keyboard, {
        audioManager,
        onGameLost: enableRestart,
        onGameWon: enableRestart,
    });
}

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

function prepareRunAudio() {
    audioManager.unlockAudio();
    audioManager.resetMusicBlend();
    audioManager.playBackgroundMusic();
}

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