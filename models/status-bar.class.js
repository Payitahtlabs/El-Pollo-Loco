/**
 * Displays a percentage-based status bar by switching between pre-rendered images.
 */
class StatusBar extends DrawableObject {
    width = 180;
    height = 50;
    percentage = 100;

    /**
     * Creates a status bar at a fixed screen position.
     *
     * @param {string[]} images Ordered bar images from empty to full.
     * @param {number} x Horizontal canvas position.
     * @param {number} y Vertical canvas position.
     */
    constructor(images, x, y) {
        super();
        this.IMAGES = images;
        this.x = x;
        this.y = y;
        this.loadImages(this.IMAGES);
        this.setPercentage(100);
    }

    /**
     * Updates the displayed percentage and swaps to the matching status image.
     *
     * @param {number} percentage Current percentage value.
     * @returns {void}
     */
    setPercentage(percentage) {
        this.percentage = percentage;
        this.img = this.imageCache[this.IMAGES[this.resolveImageIndex()]];
    }

    /**
     * Resolves the image index for the current percentage.
     *
     * @returns {number} Matching status bar image index.
     */
    resolveImageIndex() {
        if (this.percentage >= 100) return 5;
        if (this.percentage >= 80) return 4;
        if (this.percentage >= 60) return 3;
        if (this.percentage >= 40) return 2;
        if (this.percentage >= 20) return 1;
        return 0;
    }
}