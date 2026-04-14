class Keyboard {
    LEFT = false;
    RIGHT = false;
    UP = false;
    DOWN = false;
    SPACE = false;
    D = false;

    constructor() {
        window.addEventListener('keydown', (event) => this.handleKeyChange(event, true));
        window.addEventListener('keyup', (event) => this.handleKeyChange(event, false));
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
}