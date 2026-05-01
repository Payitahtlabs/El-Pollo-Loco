const MUTE_STORAGE_KEY = 'el-pollo-loco-audio-muted';

/**
 * Attaches fullscreen listeners and keeps the toolbar icon state in sync.
 *
 * @returns {void}
 */
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

/**
 * Attaches the mute button click handler.
 *
 * @returns {void}
 */
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

/**
 * Toggles the global audio mute state and persists the updated preference.
 *
 * @returns {void}
 */
function toggleMutedAudio() {
    if (!audioManager) {
        return;
    }

    persistMutedState(audioManager.toggleMuted());
    updateMuteButtonState();
}

/**
 * Applies the stored mute preference to the shared audio manager.
 *
 * @returns {void}
 */
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

/**
 * Toggles native fullscreen mode for the game shell when supported.
 *
 * @returns {void}
 */
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

/**
 * Refreshes the toolbar icon and accessible label for the fullscreen button.
 *
 * @returns {void}
 */
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

/**
 * Refreshes the toolbar icon and accessible label for the mute button.
 *
 * @returns {void}
 */
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