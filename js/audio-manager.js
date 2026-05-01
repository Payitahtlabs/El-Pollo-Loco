class AudioManager {
    backgroundMusic;
    bossMusic;
    backgroundMusicStarted = false;
    bossMusicStarted = false;
    backgroundMusicTargetVolume = 0.2;
    bossMusicTargetVolume = 0.24;
    musicFadeInterval = null;
    soundEffects = new Map();
    loopingSoundEffects = new Map();
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
        this.prepareBossMusicCrossfade();

        let fadeState = this.createCrossfadeState(durationMs);
        this.musicFadeInterval = window.setInterval(() => {
            this.advanceBossMusicCrossfade(fadeState);
        }, fadeState.stepMs);
    }

    prepareBossMusicCrossfade() {
        this.playBackgroundMusic();
        this.playBossMusic(0);
    }

    createCrossfadeState(durationMs) {
        let stepMs = 50;

        return {
            stepMs,
            totalSteps: Math.max(1, Math.ceil(durationMs / stepMs)),
            currentStep: 0,
            backgroundStartVolume: this.backgroundMusic.volume,
            bossStartVolume: this.bossMusic.volume,
        };
    }

    advanceBossMusicCrossfade(fadeState) {
        fadeState.currentStep++;

        let progress = Math.min(1, fadeState.currentStep / fadeState.totalSteps);
        this.applyCrossfadeProgress(progress, fadeState);

        if (progress >= 1) {
            this.finishBossMusicCrossfade();
        }
    }

    applyCrossfadeProgress(progress, fadeState) {
        this.backgroundMusic.volume = fadeState.backgroundStartVolume * (1 - progress);
        this.bossMusic.volume = fadeState.bossStartVolume + (this.bossMusicTargetVolume - fadeState.bossStartVolume) * progress;
    }

    finishBossMusicCrossfade() {
        this.clearMusicFade();
        this.pauseTrack(this.backgroundMusic, 'backgroundMusicStarted');
        this.backgroundMusic.currentTime = 0;
        this.backgroundMusic.volume = this.backgroundMusicTargetVolume;
        this.bossMusic.volume = this.bossMusicTargetVolume;
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
        if (!this.isPromiseLike(playPromise)) {
            this.markTrackStarted(startedFlagName);
            return;
        }

        this.attachTrackStartHandler(playPromise, startedFlagName);
    }

    attachTrackStartHandler(playPromise, startedFlagName) {
        playPromise
            .then(() => {
                this.markTrackStarted(startedFlagName);
            })
            .catch(() => {});
    }

    isPromiseLike(value) {
        return !!value && typeof value.then === 'function';
    }

    markTrackStarted(startedFlagName) {
        this[startedFlagName] = true;
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

    registerLoopingSound(name, soundPath, volume = 1) {
        let sound = this.createSoundElement(soundPath, volume);
        sound.loop = true;
        this.loopingSoundEffects.set(name, sound);
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

    startLoopingSound(name) {
        let sound = this.loopingSoundEffects.get(name);
        if (!sound || !sound.paused) {
            return;
        }

        sound.play().catch(() => {});
    }

    stopLoopingSound(name) {
        let sound = this.loopingSoundEffects.get(name);
        if (!sound) {
            return;
        }

        sound.pause();
        sound.currentTime = 0;
    }

    stopAllLoopingSounds() {
        this.loopingSoundEffects.forEach((sound, name) => {
            this.stopLoopingSound(name);
        });
    }

    setMuted(isMuted) {
        this.backgroundMusic.muted = isMuted;

        if (this.bossMusic) {
            this.bossMusic.muted = isMuted;
        }

        this.setMutedOnSoundEffects(isMuted);
        this.setMutedOnLoopingSoundEffects(isMuted);
    }

    setMutedOnSoundEffects(isMuted) {
        this.soundEffects.forEach((soundEntry) => {
            soundEntry.sounds.forEach((sound) => {
                sound.muted = isMuted;
            });
        });
    }

    setMutedOnLoopingSoundEffects(isMuted) {
        this.loopingSoundEffects.forEach((sound) => {
            sound.muted = isMuted;
        });
    }

    unlockAudio() {
        if (this.audioUnlocked) {
            return;
        }

        this.loadMusicTracks();
        this.loadSoundEffects();
        this.loadLoopingSoundEffects();
        this.audioUnlocked = true;
    }

    loadMusicTracks() {
        this.backgroundMusic.load();

        if (this.bossMusic) {
            this.bossMusic.load();
        }
    }

    loadSoundEffects() {
        this.soundEffects.forEach((soundEntry) => {
            soundEntry.sounds.forEach((sound) => {
                sound.load();
            });
        });
    }

    loadLoopingSoundEffects() {
        this.loopingSoundEffects.forEach((sound) => {
            sound.load();
        });
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
