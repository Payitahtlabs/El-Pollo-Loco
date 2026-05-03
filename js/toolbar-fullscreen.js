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
