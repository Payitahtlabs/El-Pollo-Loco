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

/**
 * Initializes DOM references, audio setup, and all UI listeners for the game shell.
 */
function init() {
    collectDomReferences();
    setupAudioManager();
    attachUiListeners();
    initializeUiState();
}

/**
 * Caches all required DOM references for the game shell.
 *
 * @returns {void}
 */
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

/**
 * Creates the shared audio manager and registers all stable sound groups.
 */
function setupAudioManager() {
    audioManager = new AudioManager('audio/music/background-music.mp3', 'audio/music/endboss-battle-music.mp3');
    registerItemSounds();
    registerEndbossSounds();
    applyStoredAudioState();
}

/**
 * Attaches all UI event listeners for the game shell.
 *
 * @returns {void}
 */
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

/**
 * Initializes toolbar and interaction hints for the shell.
 *
 * @returns {void}
 */
function initializeUiState() {
    updateFullscreenAvailability();
    updateInteractionHints();
    updateMuteButtonState();
    updateFullscreenButtonState();
}

/**
 * Registers character, item, and ambient gameplay sounds.
 */
function registerItemSounds() {
    audioManager.registerSound('characterHurt', 'audio/sfx/player/character-hurt.wav', 0.32);
    audioManager.registerLoopingSound('characterLongIdleSnore', 'audio/sfx/player/character-long-idle-snore.wav', 0.22);
    audioManager.registerSound('chickenHit', 'audio/sfx/enemies/chicken-hit.wav', 0.18);
    audioManager.registerSound('chickenHurt', 'audio/sfx/enemies/chicken-hurt.wav', 0.34);
    audioManager.registerSound('chickenStompAccent', 'audio/sfx/enemies/chicken-hurt.wav', 0.26);
    audioManager.registerSound('chickenSmallHurt', 'audio/sfx/enemies/chicken-small-hurt.wav', 0.2);
    audioManager.registerSound('chickenStomp', 'audio/sfx/enemies/chicken-stomp.wav', 0.28);
    audioManager.registerSound('chickenSmallStompAccent', 'audio/sfx/enemies/chicken-small-hurt.wav', 0.12);
    audioManager.registerSound('coinCollect', 'audio/sfx/items/coin-collect.mp3', 0.35);
    audioManager.registerSound('bottleCollect', 'audio/sfx/items/bottle-collect.wav', 0.3);
    audioManager.registerSound('bottleThrow', 'audio/sfx/items/bottle-throw.wav', 0.3);
    audioManager.registerSound('bottleSplash', 'audio/sfx/items/bottle-splash.wav', 0.34);
    audioManager.registerSound('jump', 'audio/sfx/player/jump.wav', 0.26);
}

/**
 * Registers the endboss-specific sound effects.
 */
function registerEndbossSounds() {
    audioManager.registerSound('endbossAlert', 'audio/sfx/endboss/endboss-alert.wav', 0.4);
    audioManager.registerSound('endbossAttack', 'audio/sfx/endboss/endboss-attack.wav', 0.36);
    audioManager.registerSound('endbossHurt', 'audio/sfx/endboss/endboss-hurt.wav', 0.42);
    audioManager.registerSound('endbossDeath', 'audio/sfx/endboss/endboss-death.wav', 0.46);
    audioManager.registerSound('endbossImpact', 'audio/sfx/endboss/endboss-impact.wav', 0.34);
}

/**
 * Attaches blur-on-pointer-release behavior to interactive shell buttons.
 *
 * @returns {void}
 */
function attachButtonFocusResets() {
    [muteButton, fullscreenButton, helpButton, helpCloseButton, ...restartButtons, ...homeButtons]
        .forEach((button) => attachPointerFocusReset(button));
}

/**
 * Attaches listeners that refresh the responsive interaction hint text.
 *
 * @returns {void}
 */
function attachResponsiveHintListeners() {
    window.addEventListener('resize', updateInteractionHints);
    window.addEventListener('orientationchange', updateInteractionHints);
}

/**
 * Updates the start hint text based on the primary input mode.
 *
 * @returns {void}
 */
function updateInteractionHints() {
    let usesTouchPrimary = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (startHintText) {
        startHintText.textContent = usesTouchPrimary ? 'Tap to Start' : 'Press Enter / Space to Start';
    }
}

/**
 * Prevents unwanted native interactions on core game surface elements.
 *
 * @returns {void}
 */
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
    ];

    guardedElements.filter(Boolean).forEach((element) => {
        element.addEventListener('contextmenu', preventTouchControlDefault);
        element.addEventListener('dragstart', preventTouchControlDefault);
        element.addEventListener('selectstart', preventTouchControlDefault);
    });
}
