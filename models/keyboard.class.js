/**
 * Tracks the current pressed state of gameplay-relevant keyboard inputs.
 */
class Keyboard {
    left = false;
    right = false;
    up = false;
    down = false;
    space = false;
    throwKey = false;

    keydownHandler;
    keyupHandler;

    /**
     * Registers global key listeners and keeps the tracked key states up to date.
     */
    constructor() {
        this.keydownHandler = (event) => this.handleKeyChange(event, true);
        this.keyupHandler = (event) => this.handleKeyChange(event, false);

        window.addEventListener('keydown', this.keydownHandler);
        window.addEventListener('keyup', this.keyupHandler);
    }

    /**
     * Applies a key state change when the pressed key is relevant for gameplay.
     *
     * @param {KeyboardEvent} event Browser keyboard event.
     * @param {boolean} isPressed Whether the key is currently pressed.
     * @returns {void}
     */
    handleKeyChange(event, isPressed) {
        let keyName = this.getTrackedKeyName(event.code);
        if (!keyName) {
            return;
        }

        this[keyName] = isPressed;
        event.preventDefault();
    }

    /**
     * Maps a browser key code to the tracked gameplay key name.
     *
     * @param {string} code Browser keyboard code.
     * @returns {string|undefined} Matching tracked key name.
     */
    getTrackedKeyName(code) {
        let keyMap = {
            ArrowLeft: 'left',
            ArrowRight: 'right',
            ArrowUp: 'up',
            ArrowDown: 'down',
            Space: 'space',
            KeyD: 'throwKey',
        };

        return keyMap[code];
    }

    /**
     * Removes the global keyboard listeners when the input handler is disposed.
     *
     * @returns {void}
     */
    destroy() {
        window.removeEventListener('keydown', this.keydownHandler);
        window.removeEventListener('keyup', this.keyupHandler);
    }
}