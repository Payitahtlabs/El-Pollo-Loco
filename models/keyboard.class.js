class Keyboard {
    left = false;
    right = false;
    up = false;
    down = false;
    space = false;
    throwKey = false;

    keydownHandler;
    keyupHandler;

    constructor() {
        this.keydownHandler = (event) => this.handleKeyChange(event, true);
        this.keyupHandler = (event) => this.handleKeyChange(event, false);

        window.addEventListener('keydown', this.keydownHandler);
        window.addEventListener('keyup', this.keyupHandler);
    }

    handleKeyChange(event, isPressed) {
        let keyName = this.getTrackedKeyName(event.code);
        if (!keyName) {
            return;
        }

        this[keyName] = isPressed;
        event.preventDefault();
    }

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

    destroy() {
        window.removeEventListener('keydown', this.keydownHandler);
        window.removeEventListener('keyup', this.keyupHandler);
    }
}