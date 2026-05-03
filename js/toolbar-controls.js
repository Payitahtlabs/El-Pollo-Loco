const MUTE_STORAGE_KEY = 'el-pollo-loco-audio-muted';

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