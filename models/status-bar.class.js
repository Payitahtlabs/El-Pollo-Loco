class StatusBar extends DrawableObject {
    width = 200;
    height = 60;
    percentage = 100;

    constructor(images, x, y) {
        super();
        this.IMAGES = images;
        this.x = x;
        this.y = y;
        this.loadImages(this.IMAGES);
        this.setPercentage(100);
    }

    setPercentage(percentage) {
        this.percentage = percentage;
        this.img = this.imageCache[this.IMAGES[this.resolveImageIndex()]];
    }

    resolveImageIndex() {
        if (this.percentage >= 100) return 5;
        if (this.percentage >= 80) return 4;
        if (this.percentage >= 60) return 3;
        if (this.percentage >= 40) return 2;
        if (this.percentage >= 20) return 1;
        return 0;
    }
}