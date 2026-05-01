/**
 * Represents a fixed-width background tile used to assemble the scrolling scenery.
 */
class BackgroundObject extends MovableObject {

	width = 720;
	height = 480;
	/**
	 * Creates a background tile at a fixed horizontal position.
	 *
	 * @param {string} imagePath File path of the background image.
	 * @param {number} x Horizontal world position.
	 */
	constructor(imagePath, x) {
		super();
		this.loadImage(imagePath);
		this.x = x;
		this.y = 480 - this.height;
	}
}