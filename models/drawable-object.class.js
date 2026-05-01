/**
 * Base class for objects that can load and display image assets.
 */
class DrawableObject {
    x = 120;
    y = 280;
    height = 150;
    width = 100;
    img;
    imageCache = {};
    currentImage = 0;

    /**
     * Loads a single image and assigns it as the currently displayed sprite.
     *
     * @param {string} path File path of the image asset.
     * @returns {void}
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * Preloads multiple images into the local image cache.
     *
     * @param {string[]} arr Image paths to cache.
     * @returns {void}
     */
    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    /**
     * Advances to the next animation frame from the supplied image list.
     *
     * @param {string[]} images Animation frame paths.
     * @returns {void}
     */
    playAnimation(images) {
        let i = this.currentImage % images.length;
        this.img = this.imageCache[images[i]];
        this.currentImage++;
    }
}