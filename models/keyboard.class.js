class Keyboard {
    LEFT = false;
    RIGHT = false;
    UP = false;
    DOWN = false;
    SPACE = false;
    D = false;

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
            ArrowLeft: 'LEFT',
            ArrowRight: 'RIGHT',
            ArrowUp: 'UP',
            ArrowDown: 'DOWN',
            Space: 'SPACE',
            KeyD: 'D',
        };

        return keyMap[code];
    }

    destroy() {
        window.removeEventListener('keydown', this.keydownHandler);
        window.removeEventListener('keyup', this.keyupHandler);
    }
}