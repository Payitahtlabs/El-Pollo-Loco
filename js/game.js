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
    collectDomReferences();
    setupAudioManager();
    attachUiListeners();
    initializeUiState();
}

function collectDomReferences() {
    canvas = document.getElementById('canvas');
    startScreen = document.getElementById('start-screen');
    winScreen = document.getElementById('win-screen');
    gameOverScreen = document.getElementById('game-over-screen');
    touchControls = document.getElementById('touch-controls');
    touchButtons = Array.from(document.querySelectorAll('.touch-button'));
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
}

function setupAudioManager() {
    audioManager = new AudioManager('audio/music/background-music.mp3', 'audio/music/endboss-battle-music.mp3');
    registerItemSounds();
    registerEndbossSounds();
    applyStoredAudioState();
}

function attachUiListeners() {
    attachTouchControlListeners();
    attachGameSurfaceInteractionGuards();
    attachButtonFocusResets();
    attachStartListeners();
    attachAudioControlListeners();
    attachInputModalityListeners();
    attachFullscreenListeners();
    attachHelpOverlayListeners();
    attachResponsiveHintListeners();
}

function initializeUiState() {
    updateFullscreenAvailability();
    updateInteractionHints();
    updateMuteButtonState();
    updateFullscreenButtonState();
}

function registerItemSounds() {
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
}

function registerEndbossSounds() {
    audioManager.registerSound('endbossAlert', 'audio/sfx/endboss/endboss-alert.wav', 0.4);
    audioManager.registerSound('endbossAttack', 'audio/sfx/endboss/endboss-attack.wav', 0.36);
    audioManager.registerSound('endbossHurt', 'audio/sfx/endboss/endboss-hurt.wav', 0.42);
    audioManager.registerSound('endbossDeath', 'audio/sfx/endboss/endboss-death.wav', 0.46);
    audioManager.registerSound('endbossImpact', 'audio/sfx/endboss/endboss-impact.wav', 0.34);
}

function attachButtonFocusResets() {
    [muteButton, fullscreenButton, helpButton, helpCloseButton, ...restartButtons, ...homeButtons]
        .forEach((button) => attachPointerFocusReset(button));
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
    preventOverlayEventDefault(event);
    if (!helpOverlay) {
        return;
    }

    blurHelpButton();
    lastHelpOverlayOpenAt = Date.now();
    resetHelpOverlayCloseTimeout();
    showHelpOverlay();

    requestAnimationFrame(() => {
        if (!helpOverlay) {
            return;
        }

        revealHelpOverlay();
    });
}

function closeHelpOverlay(event) {
    preventOverlayEventDefault(event);
    if (!helpOverlay) {
        return;
    }

    blurFocusedHelpElement();
    hideHelpOverlay();
    scheduleHelpOverlayHide();
}

function handleHelpOverlayBackdropClick(event) {
    event.stopPropagation();

    if (event.target !== helpOverlay) {
        return;
    }

    closeHelpOverlay();
}

function handleHelpOverlayKeydown(event) {
    if (event.code !== 'Escape' || isHelpOverlayHidden()) {
        return;
    }

    closeHelpOverlay();
}

function preventOverlayEventDefault(event) {
    if (!event) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
}

function blurHelpButton() {
    if (helpButton) {
        helpButton.blur();
    }
}

function resetHelpOverlayCloseTimeout() {
    window.clearTimeout(helpOverlayCloseTimeout);
}

function showHelpOverlay() {
    helpOverlay.classList.remove('hidden');
    helpOverlay.classList.remove('is-closing');
    helpOverlay.setAttribute('aria-hidden', 'false');
}

function revealHelpOverlay() {
    helpOverlay.classList.add('is-visible');

    if (helpCloseButton) {
        helpCloseButton.focus({ preventScroll: true });
    }
}

function blurFocusedHelpElement() {
    if (helpOverlay.contains(document.activeElement)) {
        document.activeElement.blur();
    }
}

function hideHelpOverlay() {
    helpOverlay.classList.remove('is-visible');
    helpOverlay.classList.add('is-closing');
    helpOverlay.setAttribute('aria-hidden', 'true');
}

function scheduleHelpOverlayHide() {
    resetHelpOverlayCloseTimeout();
    helpOverlayCloseTimeout = window.setTimeout(finalizeHelpOverlayHide, HELP_OVERLAY_ANIMATION_DURATION_MS);
}

function finalizeHelpOverlayHide() {
    if (!helpOverlay) {
        return;
    }

    helpOverlay.classList.add('hidden');
    helpOverlay.classList.remove('is-closing');
}

function isHelpOverlayHidden() {
    return !helpOverlay || helpOverlay.classList.contains('hidden');
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

function handleStartKeydown(event) {
    if (!isPrimaryActionKey(event)) {
        return;
    }

    event.preventDefault();
    startGame();
}

function handleRestartKeydown(event) {
    if (!isPrimaryActionKey(event)) {
        return;
    }

    event.preventDefault();
    restartGame();
}

function isPrimaryActionKey(event) {
    return event.code === 'Enter' || event.code === 'Space';
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

    if (!isKeyboardAction(action)) {
        return;
    }

    setKeyboardActionState(action, true);
    button.classList.add('is-pressed');
}

function handleTouchControlRelease(event) {
    let button = event.currentTarget;
    let action = button.dataset.action;

    if (keyboard && isKeyboardAction(action)) {
        setKeyboardActionState(action, false);
    }

    button.classList.remove('is-pressed');
}

function isKeyboardAction(action) {
    return !!action && keyboard && action in keyboard;
}

function setKeyboardActionState(action, isPressed) {
    keyboard[action] = isPressed;
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
    toggleStartScreenClickListener('add');
    startListenersAttached = true;
}

function detachStartListeners() {
    if (!startListenersAttached) {
        return;
    }

    window.removeEventListener('keydown', handleStartKeydown);
    toggleStartScreenClickListener('remove');
    startListenersAttached = false;
}

function toggleStartScreenClickListener(action) {
    if (!startScreen) {
        return;
    }

    startScreen[`${action}EventListener`]('click', handleStartScreenClick);
}

function handleStartScreenClick(event) {
    if (shouldIgnoreStartScreenClick(event)) {
        return;
    }

    startGame();
}

function shouldIgnoreStartScreenClick(event) {
    return wasHelpOverlayJustOpened() || !!event.target.closest('button, a, [role="dialog"]');
}

function wasHelpOverlayJustOpened() {
    return Date.now() - lastHelpOverlayOpenAt < HELP_OVERLAY_INTERACTION_GUARD_MS;
}

function attachRestartListeners() {
    if (restartListenersAttached) {
        return;
    }

    window.addEventListener('keydown', handleRestartKeydown);
    toggleOverlayButtonListeners(restartButtons, 'click', restartGame, 'add');
    toggleOverlayButtonListeners(homeButtons, 'click', returnToHome, 'add');
    restartListenersAttached = true;
}

function detachRestartListeners() {
    if (!restartListenersAttached) {
        return;
    }

    window.removeEventListener('keydown', handleRestartKeydown);
    toggleOverlayButtonListeners(restartButtons, 'click', restartGame, 'remove');
    toggleOverlayButtonListeners(homeButtons, 'click', returnToHome, 'remove');
    restartListenersAttached = false;
}

function toggleOverlayButtonListeners(buttons, eventName, handler, action) {
    buttons.forEach((button) => button[`${action}EventListener`](eventName, handler));
}

function attachFullscreenListeners() {
    if (canAttachFullscreenListener()) {
        fullscreenButton.addEventListener('click', toggleFullscreen);
    }

    document.addEventListener('fullscreenchange', updateFullscreenButtonState);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButtonState);
}

function canAttachFullscreenListener() {
    return !!fullscreenButton && canUseNativeFullscreen();
}

function updateFullscreenAvailability() {
    if (!fullscreenButton) {
        return;
    }

    setButtonAvailability(fullscreenButton, canUseNativeFullscreen());
}

function setButtonAvailability(button, isAvailable) {
    button.classList.toggle('hidden', !isAvailable);
    button.setAttribute('aria-hidden', String(!isAvailable));
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

function attachPointerFocusReset(button) {
    if (!button) {
        return;
    }

    button.addEventListener('pointerup', () => button.blur());
}

function attachInputModalityListeners() {
    document.addEventListener('keydown', handleInputModalityKeydown);
    document.addEventListener('pointerdown', handlePointerInputMode);
}

function handleInputModalityKeydown(event) {
    if (event.key !== 'Tab') {
        return;
    }

    document.body.classList.add('using-keyboard-navigation');
}

function handlePointerInputMode() {
    document.body.classList.remove('using-keyboard-navigation');
}

function toggleMutedAudio() {
    if (!audioManager) {
        return;
    }

    persistMutedState(audioManager.toggleMuted());
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
    if (!canToggleFullscreen()) {
        return;
    }

    if (isGameInFullscreen()) {
        exitFullscreenMode();
        return;
    }

    enterFullscreenMode();
}

function canToggleFullscreen() {
    return !!gameShellFrame && canUseNativeFullscreen();
}

function isGameInFullscreen() {
    return getFullscreenElement() === gameShellFrame;
}

function enterFullscreenMode() {
    let requestFullscreen = getFullscreenRequestMethod();

    if (!requestFullscreen) {
        return;
    }

    handleFullscreenRequestResult(requestFullscreen.call(gameShellFrame));
}

function getFullscreenRequestMethod() {
    return gameShellFrame.requestFullscreen || gameShellFrame.webkitRequestFullscreen;
}

function exitFullscreenMode() {
    let exitFullscreen = getExitFullscreenMethod();

    if (!exitFullscreen) {
        return;
    }

    handleFullscreenRequestResult(exitFullscreen.call(document));
}

function getExitFullscreenMethod() {
    return document.exitFullscreen || document.webkitExitFullscreen;
}

function handleFullscreenRequestResult(fullscreenResult) {
    if (fullscreenResult && typeof fullscreenResult.catch === 'function') {
        fullscreenResult.catch(() => {});
    }
}

function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
}

function updateFullscreenButtonState() {
    if (!canUpdateFullscreenButtonState()) {
        return;
    }

    let isFullscreen = isGameInFullscreen();
    fullscreenIcon.src = getFullscreenIconPath(isFullscreen);
    setAccessibleButtonLabel(fullscreenButton, getFullscreenButtonLabel(isFullscreen));
}

function canUpdateFullscreenButtonState() {
    return !!fullscreenButton && !!fullscreenIcon && canUseNativeFullscreen();
}

function getFullscreenButtonLabel(isFullscreen) {
    return isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';
}

function getFullscreenIconPath(isFullscreen) {
    return isFullscreen
        ? 'img/icons/toolbar-fullscreen-exit.svg'
        : 'img/icons/toolbar-fullscreen.svg';
}

function updateMuteButtonState() {
    if (!canUpdateMuteButtonState()) {
        return;
    }

    let isMuted = isAudioMuted();
    muteIcon.src = getMuteIconPath(isMuted);
    setAccessibleButtonLabel(muteButton, getMuteButtonLabel(isMuted));
}

function canUpdateMuteButtonState() {
    return !!audioManager && !!muteButton && !!muteIcon;
}

function isAudioMuted() {
    return audioManager.backgroundMusic.muted;
}

function getMuteButtonLabel(isMuted) {
    return isMuted ? 'Unmute audio' : 'Mute audio';
}

function getMuteIconPath(isMuted) {
    return isMuted
        ? 'img/icons/toolbar-volume-mute.svg'
        : 'img/icons/toolbar-volume.svg';
}

function setAccessibleButtonLabel(button, label) {
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
}
