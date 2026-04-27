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
let restartButtons = [];
let homeButtons = [];
let startHintText;
let helpButton;
let helpOverlay;
let helpCloseButton;
let helpOverlayCloseTimeout;
let startListenersAttached = false;
let restartListenersAttached = false;
let lastHelpOverlayOpenAt = 0;
const MUTE_STORAGE_KEY = 'el-pollo-loco-audio-muted';
const HELP_OVERLAY_ANIMATION_DURATION_MS = 180;
const HELP_OVERLAY_INTERACTION_GUARD_MS = 400;

function init() {
    canvas = document.getElementById('canvas');
    startScreen = document.getElementById('start-screen');
    winScreen = document.getElementById('win-screen');
    gameOverScreen = document.getElementById('game-over-screen');
    touchControls = document.getElementById('touch-controls');
    touchButtons = Array.from(document.querySelectorAll('.touch-button'));
    audioManager = new AudioManager('audio/music/background-music.mp3');
    audioManager.registerSound('characterHurt', 'audio/sfx/items/character-hurt.wav', 0.32);
    audioManager.registerSound('chickenHit', 'audio/sfx/items/chicken-hit.wav', 0.18);
    audioManager.registerSound('chickenHurt', 'audio/sfx/items/chicken-hurt.wav', 0.34);
    audioManager.registerSound('chickenStompAccent', 'audio/sfx/items/chicken-hurt.wav', 0.26);
    audioManager.registerSound('chickenSmallHurt', 'audio/sfx/items/chicken-small-hurt.wav', 0.2);
    audioManager.registerSound('chickenStomp', 'audio/sfx/items/chicken-stomp.wav', 0.28);
    audioManager.registerSound('chickenSmallStompAccent', 'audio/sfx/items/chicken-small-hurt.wav', 0.12);
    audioManager.registerSound('coinCollect', 'audio/sfx/items/coin-collect.mp3', 0.35);
    audioManager.registerSound('bottleCollect', 'audio/sfx/items/bottle-collect.wav', 0.3);
    audioManager.registerSound('bottleThrow', 'audio/sfx/items/bottle-throw.wav', 0.3);
    audioManager.registerSound('bottleSplash', 'audio/sfx/items/bottle-splash.wav', 0.34);
    audioManager.registerSound('jump', 'audio/sfx/items/jump.wav', 0.26);
    audioManager.registerSound('endbossAlert', 'audio/sfx/endboss/endboss-alert.wav', 0.4);
    audioManager.registerSound('endbossAttack', 'audio/sfx/endboss/endboss-attack.wav', 0.36);
    audioManager.registerSound('endbossHurt', 'audio/sfx/endboss/endboss-hurt.wav', 0.42);
    audioManager.registerSound('endbossDeath', 'audio/sfx/endboss/endboss-death.wav', 0.46);
    audioManager.registerSound('endbossImpact', 'audio/sfx/endboss/endboss-impact.wav', 0.34);
    applyStoredAudioState();
    gameShellFrame = document.getElementById('game-shell-frame');
    muteButton = document.getElementById('mute-button');
    muteIcon = document.getElementById('mute-icon');
    fullscreenButton = document.getElementById('fullscreen-button');
    fullscreenIcon = document.getElementById('fullscreen-icon');
    restartButtons = Array.from(document.querySelectorAll('[id$="restart-button"]'));
    homeButtons = Array.from(document.querySelectorAll('[id$="home-button"]'));
    startHintText = document.getElementById('start-hint-text');
    helpButton = document.getElementById('help-button');
    helpOverlay = document.getElementById('help-overlay');
    helpCloseButton = document.getElementById('help-close-button');
    attachTouchControlListeners();
    attachGameSurfaceInteractionGuards();
    attachStartListeners();
    attachAudioControlListeners();
    updateFullscreenAvailability();
    attachFullscreenListeners();
    attachHelpOverlayListeners();
    attachResponsiveHintListeners();
    updateInteractionHints();
    updateMuteButtonState();
    updateFullscreenButtonState();
}

function attachHelpOverlayListeners() {
    if (helpButton) {
        helpButton.addEventListener('pointerup', openHelpOverlay);
        helpButton.addEventListener('click', openHelpOverlay);
    }

    if (helpCloseButton) {
        helpCloseButton.addEventListener('click', closeHelpOverlay);
    }

    if (helpOverlay) {
        helpOverlay.addEventListener('click', handleHelpOverlayBackdropClick);
    }

    window.addEventListener('keydown', handleHelpOverlayKeydown);
}

function openHelpOverlay(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (!helpOverlay) {
        return;
    }

    if (helpButton) {
        helpButton.blur();
    }

    lastHelpOverlayOpenAt = Date.now();
    window.clearTimeout(helpOverlayCloseTimeout);
    helpOverlay.classList.remove('hidden');
    helpOverlay.classList.remove('is-closing');
    helpOverlay.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
        if (!helpOverlay) {
            return;
        }

        helpOverlay.classList.add('is-visible');

        if (helpCloseButton) {
            helpCloseButton.focus({ preventScroll: true });
        }
    });
}

function closeHelpOverlay(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (!helpOverlay) {
        return;
    }

    if (helpOverlay.contains(document.activeElement)) {
        document.activeElement.blur();
    }

    helpOverlay.classList.remove('is-visible');
    helpOverlay.classList.add('is-closing');
    helpOverlay.setAttribute('aria-hidden', 'true');

    window.clearTimeout(helpOverlayCloseTimeout);
    helpOverlayCloseTimeout = window.setTimeout(() => {
        if (!helpOverlay) {
            return;
        }

        helpOverlay.classList.add('hidden');
        helpOverlay.classList.remove('is-closing');
    }, HELP_OVERLAY_ANIMATION_DURATION_MS);
}

function handleHelpOverlayBackdropClick(event) {
    event.stopPropagation();

    if (event.target !== helpOverlay) {
        return;
    }

    closeHelpOverlay();
}

function handleHelpOverlayKeydown(event) {
    if (event.code !== 'Escape' || !helpOverlay || helpOverlay.classList.contains('hidden')) {
        return;
    }

    closeHelpOverlay();
}

function attachResponsiveHintListeners() {
    window.addEventListener('resize', updateInteractionHints);
    window.addEventListener('orientationchange', updateInteractionHints);
}

function updateInteractionHints() {
    let usesTouchPrimary = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (startHintText) {
        startHintText.textContent = usesTouchPrimary ? 'Tap to Start' : 'Press Enter / Space to Start';
    }
}

function attachGameSurfaceInteractionGuards() {
    let guardedElements = [
        canvas,
        startScreen,
        winScreen,
        gameOverScreen,
        muteButton,
        fullscreenButton,
        helpButton,
        helpOverlay,
        helpCloseButton,
        gameShellFrame,
        document.querySelector('h1'),
    ];

    guardedElements.forEach((element) => {
        if (!element) {
            return;
        }

        element.addEventListener('contextmenu', preventTouchControlDefault);
        element.addEventListener('dragstart', preventTouchControlDefault);
        element.addEventListener('selectstart', preventTouchControlDefault);
    });
}

function startGame() {
    if (world) {
        return;
    }

    hideStartScreen();
    canvas.classList.remove('hidden');
    detachStartListeners();
    showTouchControls();
    audioManager.unlockAudio();
    audioManager.playBackgroundMusic();
    initializeGame();
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
    audioManager.unlockAudio();
    audioManager.playBackgroundMusic();
    initializeGame();
}

function returnToHome() {
    teardownCurrentGame();
    detachRestartListeners();
    hideTouchControls();

    if (audioManager) {
        audioManager.stopBackgroundMusic();
    }

    if (winScreen) {
        winScreen.classList.add('hidden');
        winScreen.setAttribute('aria-hidden', 'true');
    }

    if (gameOverScreen) {
        gameOverScreen.classList.add('hidden');
        gameOverScreen.setAttribute('aria-hidden', 'true');
    }

    if (canvas) {
        canvas.classList.add('hidden');
    }

    showStartScreen();
    attachStartListeners();
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
        button.addEventListener('contextmenu', preventTouchControlDefault);
        button.addEventListener('dragstart', preventTouchControlDefault);
    });
}

function preventTouchControlDefault(event) {
    event.preventDefault();
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
        startScreen.addEventListener('click', handleStartScreenClick);
    }
    startListenersAttached = true;
}

function detachStartListeners() {
    if (!startListenersAttached) {
        return;
    }

    window.removeEventListener('keydown', handleStartKeydown);
    if (startScreen) {
        startScreen.removeEventListener('click', handleStartScreenClick);
    }
    startListenersAttached = false;
}

function handleStartScreenClick(event) {
    if (Date.now() - lastHelpOverlayOpenAt < HELP_OVERLAY_INTERACTION_GUARD_MS) {
        return;
    }

    if (event.target.closest('button, a, [role="dialog"]')) {
        return;
    }

    startGame();
}

function attachRestartListeners() {
    if (restartListenersAttached) {
        return;
    }

    window.addEventListener('keydown', handleRestartKeydown);
    restartButtons.forEach((button) => button.addEventListener('click', restartGame));
    homeButtons.forEach((button) => button.addEventListener('click', returnToHome));
    restartListenersAttached = true;
}

function detachRestartListeners() {
    if (!restartListenersAttached) {
        return;
    }

    window.removeEventListener('keydown', handleRestartKeydown);
    restartButtons.forEach((button) => button.removeEventListener('click', restartGame));
    homeButtons.forEach((button) => button.removeEventListener('click', returnToHome));
    restartListenersAttached = false;
}

function attachFullscreenListeners() {
    if (fullscreenButton && canUseNativeFullscreen()) {
        fullscreenButton.addEventListener('click', toggleFullscreen);
    }

    document.addEventListener('fullscreenchange', updateFullscreenButtonState);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButtonState);
}

function updateFullscreenAvailability() {
    if (!fullscreenButton) {
        return;
    }

    let isAvailable = canUseNativeFullscreen();

    fullscreenButton.classList.toggle('hidden', !isAvailable);
    fullscreenButton.setAttribute('aria-hidden', String(!isAvailable));
}

function canUseNativeFullscreen() {
    if (!gameShellFrame || isStandaloneMode()) {
        return false;
    }

    return typeof gameShellFrame.requestFullscreen === 'function'
        || typeof gameShellFrame.webkitRequestFullscreen === 'function';
}

function isStandaloneMode() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
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
    } catch {
        return false;
    }
}

function persistMutedState(isMuted) {
    try {
        localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
    } catch {
        return;
    }
}

function toggleFullscreen() {
    if (!gameShellFrame || !canUseNativeFullscreen()) {
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
        fullscreenResult.catch(() => {});
    }
}

function exitFullscreenMode() {
    let exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;

    if (!exitFullscreen) {
        return;
    }

    let fullscreenResult = exitFullscreen.call(document);
    if (fullscreenResult && typeof fullscreenResult.catch === 'function') {
        fullscreenResult.catch(() => {});
    }
}

function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
}

function updateFullscreenButtonState() {
    if (!fullscreenButton || !fullscreenIcon || !canUseNativeFullscreen()) {
        return;
    }

    let isFullscreen = getFullscreenElement() === gameShellFrame;
    let label = isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';

    fullscreenIcon.src = isFullscreen
        ? 'img/icons/toolbar-fullscreen-exit.svg'
        : 'img/icons/toolbar-fullscreen.svg';
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
        ? 'img/icons/toolbar-volume-mute.svg'
        : 'img/icons/toolbar-volume.svg';
    muteButton.setAttribute('aria-label', label);
    muteButton.setAttribute('title', label);
}
