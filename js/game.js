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
let startListenersAttached = false;
let restartListenersAttached = false;
let restartPrimaryActionArmed = true;

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
    audioManager.registerLoopingSound('characterLongIdleSnore', 'audio/sfx/player/character-long-idle-snore.wav', 0.22);
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

    if (!canHandleRestartPrimaryAction(event)) {
        return;
    }

    restartGame();
}

function handleRestartKeyup(event) {
    if (!isPrimaryActionKey(event)) {
        return;
    }

    restartPrimaryActionArmed = true;
}

function isPrimaryActionKey(event) {
    return event.code === 'Enter' || event.code === 'Space';
}

function canHandleRestartPrimaryAction(event) {
    if (!restartPrimaryActionArmed || event.repeat) {
        return false;
    }

    restartPrimaryActionArmed = false;
    return true;
}

function enableRestart() {
    hideTouchControls();
    restartPrimaryActionArmed = false;
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

    keyboard.left = false;
    keyboard.right = false;
    keyboard.up = false;
    keyboard.down = false;
    keyboard.space = false;
    keyboard.throwKey = false;
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

function attachRestartListeners() {
    if (restartListenersAttached) {
        return;
    }

    window.addEventListener('keydown', handleRestartKeydown);
    window.addEventListener('keyup', handleRestartKeyup);
    toggleOverlayButtonListeners(restartButtons, 'click', restartGame, 'add');
    toggleOverlayButtonListeners(homeButtons, 'click', returnToHome, 'add');
    restartListenersAttached = true;
}

function detachRestartListeners() {
    if (!restartListenersAttached) {
        return;
    }

    window.removeEventListener('keydown', handleRestartKeydown);
    window.removeEventListener('keyup', handleRestartKeyup);
    toggleOverlayButtonListeners(restartButtons, 'click', restartGame, 'remove');
    toggleOverlayButtonListeners(homeButtons, 'click', returnToHome, 'remove');
    restartListenersAttached = false;
    restartPrimaryActionArmed = true;
}

function toggleOverlayButtonListeners(buttons, eventName, handler, action) {
    buttons.forEach((button) => button[`${action}EventListener`](eventName, handler));
}
