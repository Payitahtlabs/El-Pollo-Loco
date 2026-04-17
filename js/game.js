let canvas;
let world;
let keyboard;
let startScreen;
let startListenersAttached = false;

function init() {
    canvas = document.getElementById('canvas');
    startScreen = document.getElementById('start-screen');
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
    initLevel();
    keyboard = new Keyboard();
    world = new World(canvas, keyboard);
    detachStartListeners();
}

function handleStartKeydown(event) {
    if (event.code !== 'Enter' && event.code !== 'Space') {
        return;
    }

    event.preventDefault();
    startGame();
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
