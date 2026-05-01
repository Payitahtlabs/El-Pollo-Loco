let helpOverlayCloseTimeout;
let lastHelpOverlayOpenAt = 0;
const HELP_OVERLAY_ANIMATION_DURATION_MS = 180;
const HELP_OVERLAY_INTERACTION_GUARD_MS = 400;

/**
 * Attaches all help overlay open, close, backdrop, and keyboard listeners.
 *
 * @returns {void}
 */
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

/**
 * Opens the help overlay and reveals the dialog after the next animation frame.
 *
 * @param {Event} [event] Triggering browser event.
 * @returns {void}
 */
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

/**
 * Starts closing the help overlay and schedules the final hide step.
 *
 * @param {Event} [event] Triggering browser event.
 * @returns {void}
 */
function closeHelpOverlay(event) {
    preventOverlayEventDefault(event);
    if (!helpOverlay) {
        return;
    }

    blurFocusedHelpElement();
    hideHelpOverlay();
    scheduleHelpOverlayHide();
}

/**
 * Closes the help overlay when the semi-transparent backdrop itself is clicked.
 *
 * @param {MouseEvent} event Click event on the overlay container.
 * @returns {void}
 */
function handleHelpOverlayBackdropClick(event) {
    event.stopPropagation();

    if (event.target !== helpOverlay) {
        return;
    }

    closeHelpOverlay();
}

/**
 * Closes the help overlay when Escape is pressed.
 *
 * @param {KeyboardEvent} event Browser keyboard event.
 * @returns {void}
 */
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

/**
 * Indicates whether the help overlay was opened recently enough to ignore follow-up interactions.
 *
 * @returns {boolean} True while the short interaction guard window is active.
 */
function wasHelpOverlayJustOpened() {
    return Date.now() - lastHelpOverlayOpenAt < HELP_OVERLAY_INTERACTION_GUARD_MS;
}