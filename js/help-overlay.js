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

/**
 * Prevents default browser handling for help overlay interactions.
 *
 * @param {Event} [event] Triggering browser event.
 * @returns {void}
 */
function preventOverlayEventDefault(event) {
    if (!event) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
}

/**
 * Removes focus from the help trigger button.
 *
 * @returns {void}
 */
function blurHelpButton() {
    if (helpButton) {
        helpButton.blur();
    }
}

/**
 * Clears any scheduled help overlay close timeout.
 *
 * @returns {void}
 */
function resetHelpOverlayCloseTimeout() {
    window.clearTimeout(helpOverlayCloseTimeout);
}

/**
 * Makes the help overlay visible before the opening animation starts.
 *
 * @returns {void}
 */
function showHelpOverlay() {
    helpOverlay.classList.remove('hidden');
    helpOverlay.classList.remove('is-closing');
    helpOverlay.setAttribute('aria-hidden', 'false');
}

/**
 * Applies the visible help overlay state and focuses the close button.
 *
 * @returns {void}
 */
function revealHelpOverlay() {
    helpOverlay.classList.add('is-visible');

    if (helpCloseButton) {
        helpCloseButton.focus({ preventScroll: true });
    }
}

/**
 * Removes focus from any currently focused help overlay element.
 *
 * @returns {void}
 */
function blurFocusedHelpElement() {
    if (helpOverlay.contains(document.activeElement)) {
        document.activeElement.blur();
    }
}

/**
 * Starts the visual closing state for the help overlay.
 *
 * @returns {void}
 */
function hideHelpOverlay() {
    helpOverlay.classList.remove('is-visible');
    helpOverlay.classList.add('is-closing');
    helpOverlay.setAttribute('aria-hidden', 'true');
}

/**
 * Schedules the final hidden state after the close animation completes.
 *
 * @returns {void}
 */
function scheduleHelpOverlayHide() {
    resetHelpOverlayCloseTimeout();
    helpOverlayCloseTimeout = window.setTimeout(finalizeHelpOverlayHide, HELP_OVERLAY_ANIMATION_DURATION_MS);
}

/**
 * Applies the fully hidden state to the help overlay.
 *
 * @returns {void}
 */
function finalizeHelpOverlayHide() {
    if (!helpOverlay) {
        return;
    }

    helpOverlay.classList.add('hidden');
    helpOverlay.classList.remove('is-closing');
}

/**
 * Checks whether the help overlay is currently hidden.
 *
 * @returns {boolean} True when the help overlay is hidden.
 */
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