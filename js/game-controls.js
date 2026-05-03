/**
 * Handles the primary action keys on the start screen.
 *
 * @param {KeyboardEvent} event Browser keyboard event.
 * @returns {void}
 */
function handleStartKeydown(event) {
    if (!isPrimaryActionKey(event)) {
        return;
    }

    event.preventDefault();
    startGame();
}

/**
 * Handles restart hotkeys while preventing immediate restarts from a held action key.
 *
 * @param {KeyboardEvent} event Browser keyboard event.
 * @returns {void}
 */
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

/**
 * Rearms the restart hotkey after the primary action key is released.
 *
 * @param {KeyboardEvent} event Browser keyboard event.
 * @returns {void}
 */
function handleRestartKeyup(event) {
    if (!isPrimaryActionKey(event)) {
        return;
    }

    restartPrimaryActionArmed = true;
}

/**
 * Checks whether a keyboard event matches the primary action keys.
 *
 * @param {KeyboardEvent} event Browser keyboard event.
 * @returns {boolean} True when Enter or Space was pressed.
 */
function isPrimaryActionKey(event) {
    return event.code === 'Enter' || event.code === 'Space';
}

/**
 * Determines whether the restart hotkey may trigger for the current event.
 *
 * @param {KeyboardEvent} event Browser keyboard event.
 * @returns {boolean} True when the restart action should fire.
 */
function canHandleRestartPrimaryAction(event) {
    if (!restartPrimaryActionArmed || event.repeat) {
        return false;
    }

    restartPrimaryActionArmed = false;
    return true;
}

/**
 * Enables the restart input path after a run has ended.
 *
 * @returns {void}
 */
function enableRestart() {
    hideTouchControls();
    restartPrimaryActionArmed = false;
    attachRestartListeners();
}

/**
 * Attaches all touch-control input listeners.
 *
 * @returns {void}
 */
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

/**
 * Prevents the browser's default interaction for touch controls.
 *
 * @param {Event} event Triggering browser event.
 * @returns {void}
 */
function preventTouchControlDefault(event) {
    event.preventDefault();
}

/**
 * Applies the matching keyboard state when a touch button is pressed.
 *
 * @param {PointerEvent} event Pointer event from the touch button.
 * @returns {void}
 */
function handleTouchControlPress(event) {
    if (!keyboard) {
        return;
    }

    event.preventDefault();
    let button = event.currentTarget;
    let action = getTouchControlAction(button.dataset.action);

    if (!isKeyboardAction(action)) {
        return;
    }

    setKeyboardActionState(action, true);
    button.classList.add('is-pressed');
}

/**
 * Clears the matching keyboard state when a touch button is released.
 *
 * @param {PointerEvent} event Pointer event from the touch button.
 * @returns {void}
 */
function handleTouchControlRelease(event) {
    let button = event.currentTarget;
    let action = getTouchControlAction(button.dataset.action);

    if (keyboard && isKeyboardAction(action)) {
        setKeyboardActionState(action, false);
    }

    button.classList.remove('is-pressed');
}

/**
 * Checks whether an action name maps to a tracked keyboard property.
 *
 * @param {string} action Action name to test.
 * @returns {boolean} True when the action maps to keyboard state.
 */
function isKeyboardAction(action) {
    return !!action && keyboard && action in keyboard;
}

/**
 * Maps touch button action names to internal keyboard state keys.
 *
 * @param {string} action Raw action value from the button dataset.
 * @returns {string} Normalized keyboard state key.
 */
function getTouchControlAction(action) {
    let actionMap = {
        LEFT: 'left',
        RIGHT: 'right',
        UP: 'up',
        DOWN: 'down',
        SPACE: 'space',
        D: 'throwKey',
    };

    return actionMap[action] || action;
}

/**
 * Applies a pressed state to the tracked keyboard action.
 *
 * @param {string} action Keyboard state key to update.
 * @param {boolean} isPressed Whether the action is currently pressed.
 * @returns {void}
 */
function setKeyboardActionState(action, isPressed) {
    keyboard[action] = isPressed;
}

/**
 * Clears all active touch-control press states.
 *
 * @returns {void}
 */
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

/**
 * Shows the mobile touch-control overlay.
 *
 * @returns {void}
 */
function showTouchControls() {
    if (!touchControls) {
        return;
    }

    touchControls.classList.remove('hidden');
    touchControls.setAttribute('aria-hidden', 'false');
}

/**
 * Hides the mobile touch-control overlay and clears active input.
 *
 * @returns {void}
 */
function hideTouchControls() {
    if (!touchControls) {
        return;
    }

    resetTouchInputState();
    touchControls.classList.add('hidden');
    touchControls.setAttribute('aria-hidden', 'true');
}

/**
 * Attaches the start-screen input listeners.
 *
 * @returns {void}
 */
function attachStartListeners() {
    if (!startListenersAttached) {
        window.addEventListener('keydown', handleStartKeydown);
        toggleStartScreenClickListener('add');
        startListenersAttached = true;
    }
}

/**
 * Removes the start-screen input listeners.
 *
 * @returns {void}
 */
function detachStartListeners() {
    if (!startListenersAttached) {
        return;
    }

    window.removeEventListener('keydown', handleStartKeydown);
    toggleStartScreenClickListener('remove');
    startListenersAttached = false;
}

/**
 * Adds or removes the start-screen click listener.
 *
 * @param {'add'|'remove'} action Listener operation to perform.
 * @returns {void}
 */
function toggleStartScreenClickListener(action) {
    if (!startScreen) {
        return;
    }

    startScreen[`${action}EventListener`]('click', handleStartScreenClick);
}

/**
 * Starts the game when the start screen itself is activated.
 *
 * @param {MouseEvent} event Browser click event.
 * @returns {void}
 */
function handleStartScreenClick(event) {
    if (!shouldIgnoreStartScreenClick(event)) {
        startGame();
    }
}

/**
 * Determines whether a start-screen click should be ignored.
 *
 * @param {MouseEvent} event Browser click event.
 * @returns {boolean} True when the click should not start the game.
 */
function shouldIgnoreStartScreenClick(event) {
    return wasHelpOverlayJustOpened() || !!event.target.closest('button, a, [role="dialog"]');
}

/**
 * Attaches keyboard and button listeners for the restart state.
 *
 * @returns {void}
 */
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

/**
 * Removes keyboard and button listeners for the restart state.
 *
 * @returns {void}
 */
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

/**
 * Adds or removes overlay button listeners as a batch.
 *
 * @param {HTMLButtonElement[]} buttons Buttons to update.
 * @param {string} eventName Browser event name to bind.
 * @param {Function} handler Listener callback.
 * @param {'add'|'remove'} action Listener operation to perform.
 * @returns {void}
 */
function toggleOverlayButtonListeners(buttons, eventName, handler, action) {
    buttons.forEach((button) => button[`${action}EventListener`](eventName, handler));
}
