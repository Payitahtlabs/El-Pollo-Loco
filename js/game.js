let canvas;
let world;
let keyboard;
let startScreen;
let winScreen;
let gameOverScreen;
let touchControls;
let touchButtons = [];
let audioManager;
let gameShellFrame;
let muteButton;
let muteIcon;
let fullscreenButton;
let fullscreenIcon;
let startListenersAttached = false;
let restartListenersAttached = false;
const MUTE_STORAGE_KEY = 'el-pollo-loco-audio-muted';

function init() {
    canvas = document.getElementById('canvas');
    startScreen = document.getElementById('start-screen');
    winScreen = document.getElementById('win-screen');
    gameOverScreen = document.getElementById('game-over-screen');
    touchControls = document.getElementById('touch-controls');
    touchButtons = Array.from(document.querySelectorAll('.touch-button'));
    audioManager = new AudioManager('audio/background-music.mp3');
    applyStoredAudioState();
    gameShellFrame = document.getElementById('game-shell-frame');
    muteButton = document.getElementById('mute-button');
    muteIcon = document.getElementById('mute-icon');
    fullscreenButton = document.getElementById('fullscreen-button');
    fullscreenIcon = document.getElementById('fullscreen-icon');
    attachTouchControlListeners();
    attachStartListeners();
    attachAudioControlListeners();
    attachFullscreenListeners();
    updateMuteButtonState();
    updateFullscreenButtonState();
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
    showTouchControls();
    audioManager.playBackgroundMusic();
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
    showTouchControls();
    audioManager.playBackgroundMusic();
    initializeGame();
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
    hideTouchControls();
    attachRestartListeners();
}

function attachTouchControlListeners() {
    touchButtons.forEach((button) => {
        button.addEventListener('pointerdown', handleTouchControlPress);
        button.addEventListener('pointerup', handleTouchControlRelease);
        button.addEventListener('pointercancel', handleTouchControlRelease);
        button.addEventListener('pointerleave', handleTouchControlRelease);
    });
}

function handleTouchControlPress(event) {
    if (!keyboard) {
        return;
    }

    event.preventDefault();
    let button = event.currentTarget;
    let action = button.dataset.action;

    if (!action || !(action in keyboard)) {
        return;
    }

    keyboard[action] = true;
    button.classList.add('is-pressed');
}

function handleTouchControlRelease(event) {
    let button = event.currentTarget;
    let action = button.dataset.action;

    if (action && keyboard && action in keyboard) {
        keyboard[action] = false;
    }

    button.classList.remove('is-pressed');
}

function resetTouchInputState() {
    touchButtons.forEach((button) => button.classList.remove('is-pressed'));

    if (!keyboard) {
        return;
    }

    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.UP = false;
    keyboard.DOWN = false;
    keyboard.SPACE = false;
    keyboard.D = false;
}

function showTouchControls() {
    if (!touchControls) {
        return;
    }

    touchControls.classList.remove('hidden');
    touchControls.setAttribute('aria-hidden', 'false');
}

function hideTouchControls() {
    if (!touchControls) {
        return;
    }

    resetTouchInputState();
    touchControls.classList.add('hidden');
    touchControls.setAttribute('aria-hidden', 'true');
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

function attachFullscreenListeners() {
    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', toggleFullscreen);
    }

    document.addEventListener('fullscreenchange', updateFullscreenButtonState);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButtonState);
}

function attachAudioControlListeners() {
    if (!muteButton) {
        return;
    }

    muteButton.addEventListener('click', toggleMutedAudio);
}

function toggleMutedAudio() {
    if (!audioManager) {
        return;
    }

    let isMuted = audioManager.toggleMuted();
    persistMutedState(isMuted);
    updateMuteButtonState();
}

function applyStoredAudioState() {
    if (!audioManager) {
        return;
    }

    audioManager.setMuted(readStoredMutedState());
}

function readStoredMutedState() {
    try {
        return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
    } catch (error) {
        console.warn('Muted audio state could not be read.', error);
        return false;
    }
}

function persistMutedState(isMuted) {
    try {
        localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
    } catch (error) {
        console.warn('Muted audio state could not be stored.', error);
    }
}

function toggleFullscreen() {
    if (!gameShellFrame) {
        return;
    }

    if (getFullscreenElement() === gameShellFrame) {
        exitFullscreenMode();
        return;
    }

    enterFullscreenMode();
}

function enterFullscreenMode() {
    let requestFullscreen = gameShellFrame.requestFullscreen || gameShellFrame.webkitRequestFullscreen;

    if (!requestFullscreen) {
        return;
    }

    let fullscreenResult = requestFullscreen.call(gameShellFrame);
    if (fullscreenResult && typeof fullscreenResult.catch === 'function') {
        fullscreenResult.catch((error) => {
            console.warn('Fullscreen could not be started.', error);
        });
    }
}

function exitFullscreenMode() {
    let exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;

    if (!exitFullscreen) {
        return;
    }

    let fullscreenResult = exitFullscreen.call(document);
    if (fullscreenResult && typeof fullscreenResult.catch === 'function') {
        fullscreenResult.catch((error) => {
            console.warn('Fullscreen could not be exited.', error);
        });
    }
}

function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
}

function updateFullscreenButtonState() {
    if (!fullscreenButton || !fullscreenIcon) {
        return;
    }

    let isFullscreen = getFullscreenElement() === gameShellFrame;
    let label = isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';

    fullscreenIcon.src = isFullscreen
        ? 'img/icons/icon-fullscreen-exit.svg'
        : 'img/icons/icon-fullscreen.svg';
    fullscreenButton.setAttribute('aria-label', label);
    fullscreenButton.setAttribute('title', label);
}

function updateMuteButtonState() {
    if (!audioManager || !muteButton || !muteIcon) {
        return;
    }

    let isMuted = audioManager.backgroundMusic.muted;
    let label = isMuted ? 'Unmute audio' : 'Mute audio';

    muteIcon.src = isMuted
        ? 'img/icons/icon-volume-mute.svg'
        : 'img/icons/icon-volume.svg';
    muteButton.setAttribute('aria-label', label);
    muteButton.setAttribute('title', label);
}
