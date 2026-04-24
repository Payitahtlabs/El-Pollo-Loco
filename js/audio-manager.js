class AudioManager {
    backgroundMusic;
    backgroundMusicStarted = false;
    soundEffects = new Map();

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

    registerSound(name, soundPath, volume = 1) {
        let sound = new Audio(soundPath);
        sound.preload = 'auto';
        sound.volume = volume;
        sound.muted = this.backgroundMusic.muted;
        this.soundEffects.set(name, sound);
    }

    playSound(name) {
        let sound = this.soundEffects.get(name);
        if (!sound) {
            return;
        }

        let soundInstance = sound.cloneNode();
        soundInstance.volume = sound.volume;
        soundInstance.muted = sound.muted;
        soundInstance.play().catch(() => {});
    }

    setMuted(isMuted) {
        this.backgroundMusic.muted = isMuted;
        this.soundEffects.forEach((sound) => {
            sound.muted = isMuted;
        });
    }

    toggleMuted() {
        this.setMuted(!this.backgroundMusic.muted);
        return this.backgroundMusic.muted;
    }
}
