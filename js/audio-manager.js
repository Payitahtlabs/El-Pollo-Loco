class AudioManager {
    backgroundMusic;
    backgroundMusicStarted = false;

    constructor(backgroundMusicPath) {
        this.backgroundMusic = new Audio(backgroundMusicPath);
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.2;
        this.backgroundMusic.preload = 'auto';
    }

    playBackgroundMusic() {
        if (this.backgroundMusicStarted) {
            return;
        }

        let playPromise = this.backgroundMusic.play();
        if (!playPromise || typeof playPromise.then !== 'function') {
            this.backgroundMusicStarted = true;
            return;
        }

        playPromise
            .then(() => {
                this.backgroundMusicStarted = true;
            })
            .catch(() => {});
    }

    pauseBackgroundMusic() {
        this.backgroundMusic.pause();
        this.backgroundMusicStarted = false;
    }

    stopBackgroundMusic() {
        this.pauseBackgroundMusic();
        this.backgroundMusic.currentTime = 0;
    }

    setMuted(isMuted) {
        this.backgroundMusic.muted = isMuted;
    }

    toggleMuted() {
        this.setMuted(!this.backgroundMusic.muted);
        return this.backgroundMusic.muted;
    }
}
