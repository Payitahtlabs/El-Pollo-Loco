let canvas;
let world;
let keyboard;
let startScreen;
let winScreen;
let gameOverScreen;
let startListenersAttached = false;
let restartListenersAttached = false;

function init() {
    canvas = document.getElementById('canvas');
    startScreen = document.getElementById('start-screen');
    winScreen = document.getElementById('win-screen');
    gameOverScreen = document.getElementById('game-over-screen');
    attachStartListeners();
}

function startGame() {
    if (world) {
        return;
    }

    if (startScreen) {
        startScreen.classList.add('hidden');
        startScreen.setAttribute('aria-hidden', 'true');
    }

    canvas.classList.remove('hidden');
    detachStartListeners();
    initializeGame();
}

function initializeGame() {
    initLevel();
    keyboard = new Keyboard();
    world = new World(canvas, keyboard, {
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
    initializeGame();
}

function teardownCurrentGame() {
    if (world) {
        world.gameOver();
        world = null;
    }

    if (keyboard) {
        keyboard.destroy();
        keyboard = null;
    }
}

function handleStartKeydown(event) {
    if (event.code !== 'Enter' && event.code !== 'Space') {
        return;
    }

    event.preventDefault();
    startGame();
}

function handleRestartKeydown(event) {
    if (event.code !== 'Enter' && event.code !== 'Space') {
        return;
    }

    event.preventDefault();
    restartGame();
}

function enableRestart() {
    attachRestartListeners();
}

function attachStartListeners() {
    if (startListenersAttached) {
        return;
    }

    window.addEventListener('keydown', handleStartKeydown);
    if (startScreen) {
        startScreen.addEventListener('click', startGame);
    }
    startListenersAttached = true;
}

function detachStartListeners() {
    if (!startListenersAttached) {
        return;
    }

    window.removeEventListener('keydown', handleStartKeydown);
    if (startScreen) {
        startScreen.removeEventListener('click', startGame);
    }
    startListenersAttached = false;
}

function attachRestartListeners() {
    if (restartListenersAttached) {
        return;
    }

    window.addEventListener('keydown', handleRestartKeydown);
    if (winScreen) {
        winScreen.addEventListener('click', restartGame);
    }
    if (gameOverScreen) {
        gameOverScreen.addEventListener('click', restartGame);
    }
    restartListenersAttached = true;
}

function detachRestartListeners() {
    if (!restartListenersAttached) {
        return;
    }

    window.removeEventListener('keydown', handleRestartKeydown);
    if (winScreen) {
        winScreen.removeEventListener('click', restartGame);
    }
    if (gameOverScreen) {
        gameOverScreen.removeEventListener('click', restartGame);
    }
    restartListenersAttached = false;
}
