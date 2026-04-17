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
        switch (event.code) {
            case 'ArrowLeft':
                this.LEFT = isPressed;
                break;
            case 'ArrowRight':
                this.RIGHT = isPressed;
                break;
            case 'ArrowUp':
                this.UP = isPressed;
                break;
            case 'ArrowDown':
                this.DOWN = isPressed;
                break;
            case 'Space':
                this.SPACE = isPressed;
                break;
            case 'KeyD':
                this.D = isPressed;
                break;
            default:
                return;
        }

        event.preventDefault();
    }

    destroy() {
        window.removeEventListener('keydown', this.keydownHandler);
        window.removeEventListener('keyup', this.keyupHandler);
    }
}