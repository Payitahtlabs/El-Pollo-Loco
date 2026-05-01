/**
 * Displays an icon with a numeric HUD counter beside it.
 */
class CounterDisplay extends DrawableObject {
    width = 52;
    height = 52;
    value = 0;
    font = '32px Boogaloo, sans-serif';
    color = '#ffffff';

    /**
     * Creates a counter display with a fixed icon and screen position.
     *
     * @param {string} iconPath File path for the counter icon.
     * @param {number} x Horizontal canvas position.
     * @param {number} y Vertical canvas position.
     */
    constructor(iconPath, x, y) {
        super();
        this.x = x;
        this.y = y;
        this.loadImage(iconPath);
    }

    /**
     * Updates the currently displayed numeric value.
     *
     * @param {number} value New counter value.
     * @returns {void}
     */
    setValue(value) {
        this.value = value;
    }

    /**
     * Draws the counter icon and current numeric value onto the HUD.
     *
     * @param {CanvasRenderingContext2D} ctx Canvas rendering context.
     * @returns {void}
     */
    draw(ctx) {
        if (this.img) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }

        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.strokeText(`${this.value}`, this.x + this.width + 8, this.y + this.height / 2 + 1);
        ctx.fillText(`${this.value}`, this.x + this.width + 8, this.y + this.height / 2 + 1);
    }
}