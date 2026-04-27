class AudioManager {
    backgroundMusic;
    bossMusic;
    backgroundMusicStarted = false;
    bossMusicStarted = false;
    backgroundMusicTargetVolume = 0.2;
    bossMusicTargetVolume = 0.24;
    musicFadeInterval = null;
    soundEffects = new Map();
    audioUnlocked = false;

    constructor(backgroundMusicPath, bossMusicPath = null) {
        this.backgroundMusic = this.createMusicTrack(backgroundMusicPath, this.backgroundMusicTargetVolume);

        if (bossMusicPath) {
            this.bossMusic = this.createMusicTrack(bossMusicPath, 0);
        }
    }

    playBackgroundMusic() {
        this.clearMusicFade();
        this.backgroundMusic.volume = this.backgroundMusicTargetVolume;
        this.playMusicTrack(this.backgroundMusic, 'backgroundMusicStarted');
    }

    playBossMusic(initialVolume = 0) {
        if (!this.bossMusic) {
            return;
        }

        this.bossMusic.volume = initialVolume;
        this.playMusicTrack(this.bossMusic, 'bossMusicStarted');
    }

    crossfadeToBossMusic(durationMs = 900) {
        if (!this.bossMusic) {
            return;
        }

        this.clearMusicFade();
        this.playBackgroundMusic();
        this.playBossMusic(0);

        let stepMs = 50;
        let totalSteps = Math.max(1, Math.ceil(durationMs / stepMs));
        let currentStep = 0;
        let backgroundStartVolume = this.backgroundMusic.volume;
        let bossStartVolume = this.bossMusic.volume;

        this.musicFadeInterval = window.setInterval(() => {
            currentStep++;

            let progress = Math.min(1, currentStep / totalSteps);
            this.backgroundMusic.volume = backgroundStartVolume * (1 - progress);
            this.bossMusic.volume = bossStartVolume + (this.bossMusicTargetVolume - bossStartVolume) * progress;

            if (progress < 1) {
                return;
            }

            this.clearMusicFade();
            this.pauseTrack(this.backgroundMusic, 'backgroundMusicStarted');
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic.volume = this.backgroundMusicTargetVolume;
            this.bossMusic.volume = this.bossMusicTargetVolume;
        }, stepMs);
    }

    resetMusicBlend() {
        this.clearMusicFade();
        this.pauseTrack(this.bossMusic, 'bossMusicStarted');
        this.pauseTrack(this.backgroundMusic, 'backgroundMusicStarted');

        if (this.bossMusic) {
            this.bossMusic.currentTime = 0;
            this.bossMusic.volume = 0;
        }

        this.backgroundMusic.currentTime = 0;
        this.backgroundMusic.volume = this.backgroundMusicTargetVolume;
    }

    stopAllMusic() {
        this.resetMusicBlend();
    }

    playMusicTrack(track, startedFlagName) {
        if (!track || this[startedFlagName]) {
            return;
        }

        let playPromise = track.play();
        if (!playPromise || typeof playPromise.then !== 'function') {
            this[startedFlagName] = true;
            return;
        }

        playPromise
            .then(() => {
                this[startedFlagName] = true;
            })
            .catch(() => {});
    }

    pauseBackgroundMusic() {
        this.pauseTrack(this.backgroundMusic, 'backgroundMusicStarted');
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

        if (this.bossMusic) {
            this.bossMusic.muted = isMuted;
        }

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

        if (this.bossMusic) {
            this.bossMusic.load();
        }

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

    createMusicTrack(soundPath, volume) {
        let track = new Audio(soundPath);
        track.loop = true;
        track.volume = volume;
        track.preload = 'auto';
        return track;
    }

    pauseTrack(track, startedFlagName) {
        if (!track) {
            return;
        }

        track.pause();
        this[startedFlagName] = false;
    }

    clearMusicFade() {
        if (!this.musicFadeInterval) {
            return;
        }

        window.clearInterval(this.musicFadeInterval);
        this.musicFadeInterval = null;
    }
}
