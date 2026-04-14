class CounterDisplay extends DrawableObject {
    width = 52;
    height = 52;
    value = 0;
    font = '32px Boogaloo, sans-serif';
    color = '#ffffff';

    constructor(iconPath, x, y) {
        super();
        this.x = x;
        this.y = y;
        this.loadImage(iconPath);
    }

    setValue(value) {
        this.value = value;
    }

    draw(ctx) {
        if (this.img) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }

        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.textBaseline = 'middle';
        ctx.fillText(`${this.value}`, this.x + this.width + 5, this.y + this.height / 2 + 1);
    }
}