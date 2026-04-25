class AudioManager {
    backgroundMusic;
    backgroundMusicStarted = false;
    soundEffects = new Map();
    audioUnlocked = false;

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

    registerSound(name, soundPath, volume = 1, poolSize = 4) {
        let sounds = Array.from({ length: poolSize }, () => this.createSoundElement(soundPath, volume));

        this.soundEffects.set(name, {
            sounds,
            nextIndex: 0,
        });
    }

    playSound(name) {
        let soundEntry = this.soundEffects.get(name);
        if (!soundEntry || soundEntry.sounds.length === 0) {
            return;
        }

        let sound = soundEntry.sounds[soundEntry.nextIndex];
        soundEntry.nextIndex = (soundEntry.nextIndex + 1) % soundEntry.sounds.length;

        sound.currentTime = 0;
        sound.play().catch(() => {});
    }

    setMuted(isMuted) {
        this.backgroundMusic.muted = isMuted;
        this.soundEffects.forEach((soundEntry) => {
            soundEntry.sounds.forEach((sound) => {
                sound.muted = isMuted;
            });
        });
    }

    unlockAudio() {
        if (this.audioUnlocked) {
            return;
        }

        this.backgroundMusic.load();
        this.soundEffects.forEach((soundEntry) => {
            soundEntry.sounds.forEach((sound) => {
                sound.load();
            });
        });

        this.audioUnlocked = true;
    }

    toggleMuted() {
        this.setMuted(!this.backgroundMusic.muted);
        return this.backgroundMusic.muted;
    }

    createSoundElement(soundPath, volume) {
        let sound = new Audio(soundPath);
        sound.preload = 'auto';
        sound.volume = volume;
        sound.muted = this.backgroundMusic.muted;
        return sound;
    }
}
