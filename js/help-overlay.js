let helpOverlayCloseTimeout;
let lastHelpOverlayOpenAt = 0;
const HELP_OVERLAY_ANIMATION_DURATION_MS = 180;
const HELP_OVERLAY_INTERACTION_GUARD_MS = 400;

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

function wasHelpOverlayJustOpened() {
    return Date.now() - lastHelpOverlayOpenAt < HELP_OVERLAY_INTERACTION_GUARD_MS;
}