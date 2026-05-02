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

/**
 * Checks whether the fullscreen button can bind its click handler.
 *
 * @returns {boolean} True when fullscreen is supported and the button exists.
 */
function canAttachFullscreenListener() {
    return !!fullscreenButton && canUseNativeFullscreen();
}

/**
 * Updates whether the fullscreen button should be visible.
 *
 * @returns {void}
 */
function updateFullscreenAvailability() {
    if (!fullscreenButton) {
        return;
    }

    setButtonAvailability(fullscreenButton, canUseNativeFullscreen());
}

/**
 * Applies a visible or hidden state to a toolbar button.
 *
 * @param {HTMLElement} button Button element to update.
 * @param {boolean} isAvailable Whether the button should be visible.
 * @returns {void}
 */
function setButtonAvailability(button, isAvailable) {
    button.classList.toggle('hidden', !isAvailable);
    button.setAttribute('aria-hidden', String(!isAvailable));
}

/**
 * Checks whether the browser supports native fullscreen for the game shell.
 *
 * @returns {boolean} True when fullscreen can be used.
 */
function canUseNativeFullscreen() {
    if (!gameShellFrame || isStandaloneMode()) {
        return false;
    }

    return typeof gameShellFrame.requestFullscreen === 'function'
        || typeof gameShellFrame.webkitRequestFullscreen === 'function';
}

/**
 * Checks whether the page already runs in standalone display mode.
 *
 * @returns {boolean} True when the page runs standalone.
 */
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

/**
 * Removes focus from a button after pointer interaction.
 *
 * @param {?HTMLButtonElement} button Button to update.
 * @returns {void}
 */
function attachPointerFocusReset(button) {
    if (!button) {
        return;
    }

    button.addEventListener('pointerup', () => button.blur());
}

/**
 * Attaches listeners that track whether input came from keyboard or pointer.
 *
 * @returns {void}
 */
function attachInputModalityListeners() {
    document.addEventListener('keydown', handleInputModalityKeydown);
    document.addEventListener('pointerdown', handlePointerInputMode);
}

/**
 * Enables keyboard-navigation styles after a Tab key press.
 *
 * @param {KeyboardEvent} event Browser keyboard event.
 * @returns {void}
 */
function handleInputModalityKeydown(event) {
    if (event.key !== 'Tab') {
        return;
    }

    document.body.classList.add('using-keyboard-navigation');
}

/**
 * Disables keyboard-navigation styles after pointer input.
 *
 * @returns {void}
 */
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

/**
 * Reads the persisted mute preference from local storage.
 *
 * @returns {boolean} Stored mute preference.
 */
function readStoredMutedState() {
    try {
        return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
}

/**
 * Persists the mute preference in local storage.
 *
 * @param {boolean} isMuted Whether audio is currently muted.
 * @returns {void}
 */
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

/**
 * Checks whether fullscreen toggling is currently allowed.
 *
 * @returns {boolean} True when fullscreen may be toggled.
 */
function canToggleFullscreen() {
    return !!gameShellFrame && canUseNativeFullscreen();
}

/**
 * Checks whether the game shell is currently the fullscreen element.
 *
 * @returns {boolean} True when the game shell is fullscreen.
 */
function isGameInFullscreen() {
    return getFullscreenElement() === gameShellFrame;
}

/**
 * Requests fullscreen mode for the game shell.
 *
 * @returns {void}
 */
function enterFullscreenMode() {
    let requestFullscreen = getFullscreenRequestMethod();

    if (!requestFullscreen) {
        return;
    }

    handleFullscreenRequestResult(requestFullscreen.call(gameShellFrame));
}

/**
 * Resolves the supported fullscreen request method.
 *
 * @returns {Function|undefined} Fullscreen request function when available.
 */
function getFullscreenRequestMethod() {
    return gameShellFrame.requestFullscreen || gameShellFrame.webkitRequestFullscreen;
}

/**
 * Exits native fullscreen mode.
 *
 * @returns {void}
 */
function exitFullscreenMode() {
    let exitFullscreen = getExitFullscreenMethod();

    if (!exitFullscreen) {
        return;
    }

    handleFullscreenRequestResult(exitFullscreen.call(document));
}

/**
 * Resolves the supported fullscreen exit method.
 *
 * @returns {Function|undefined} Fullscreen exit function when available.
 */
function getExitFullscreenMethod() {
    return document.exitFullscreen || document.webkitExitFullscreen;
}

/**
 * Silences rejected fullscreen promise results.
 *
 * @param {*} fullscreenResult Result returned by the fullscreen API.
 * @returns {void}
 */
function handleFullscreenRequestResult(fullscreenResult) {
    if (fullscreenResult && typeof fullscreenResult.catch === 'function') {
        fullscreenResult.catch(() => {});
    }
}

/**
 * Returns the current fullscreen element across browser variants.
 *
 * @returns {?Element} Active fullscreen element.
 */
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

/**
 * Checks whether the fullscreen button state can be updated.
 *
 * @returns {boolean} True when the required fullscreen UI elements exist.
 */
function canUpdateFullscreenButtonState() {
    return !!fullscreenButton && !!fullscreenIcon && canUseNativeFullscreen();
}

/**
 * Resolves the accessible fullscreen button label.
 *
 * @param {boolean} isFullscreen Whether the game shell is fullscreen.
 * @returns {string} Fullscreen button label.
 */
function getFullscreenButtonLabel(isFullscreen) {
    return isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';
}

/**
 * Resolves the correct fullscreen toolbar icon path.
 *
 * @param {boolean} isFullscreen Whether the game shell is fullscreen.
 * @returns {string} Toolbar icon asset path.
 */
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

/**
 * Checks whether the mute button state can be updated.
 *
 * @returns {boolean} True when the required mute UI elements exist.
 */
function canUpdateMuteButtonState() {
    return !!audioManager && !!muteButton && !!muteIcon;
}

/**
 * Reads the current mute state from the audio manager.
 *
 * @returns {boolean} True when audio is muted.
 */
function isAudioMuted() {
    return audioManager.backgroundMusic.muted;
}

/**
 * Resolves the accessible mute button label.
 *
 * @param {boolean} isMuted Whether audio is muted.
 * @returns {string} Mute button label.
 */
function getMuteButtonLabel(isMuted) {
    return isMuted ? 'Unmute audio' : 'Mute audio';
}

/**
 * Resolves the correct mute toolbar icon path.
 *
 * @param {boolean} isMuted Whether audio is muted.
 * @returns {string} Toolbar icon asset path.
 */
function getMuteIconPath(isMuted) {
    return isMuted
        ? 'img/icons/toolbar-volume-mute.svg'
        : 'img/icons/toolbar-volume.svg';
}

/**
 * Applies an accessible label and title to a button.
 *
 * @param {HTMLElement} button Button element to update.
 * @param {string} label Accessible label text.
 * @returns {void}
 */
function setAccessibleButtonLabel(button, label) {
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
}