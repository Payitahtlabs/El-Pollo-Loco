/**
 * Centralizes background music and sound-effect playback for the game.
 */
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

    /**
     * Creates the shared audio manager with the configured music tracks.
     *
     * @param {string} backgroundMusicPath File path for the standard background music.
     * @param {?string} [bossMusicPath=null] Optional file path for the boss music track.
     */
    constructor(backgroundMusicPath, bossMusicPath = null) {
        this.backgroundMusic = this.createMusicTrack(backgroundMusicPath, this.backgroundMusicTargetVolume);

        if (bossMusicPath) {
            this.bossMusic = this.createMusicTrack(bossMusicPath, 0);
        }
    }

    /**
     * Starts the regular background music track.
     *
     * @returns {void}
     */
    playBackgroundMusic() {
        this.clearMusicFade();
        this.backgroundMusic.volume = this.backgroundMusicTargetVolume;
        this.playMusicTrack(this.backgroundMusic, 'backgroundMusicStarted');
    }

    /**
     * Starts the boss music track at the requested initial volume.
     *
     * @param {number} [initialVolume=0] Initial boss track volume.
     * @returns {void}
     */
    playBossMusic(initialVolume = 0) {
        if (!this.bossMusic) {
            return;
        }

        this.bossMusic.volume = initialVolume;
        this.playMusicTrack(this.bossMusic, 'bossMusicStarted');
    }

    /**
     * Crossfades from the background track into the boss track.
     *
     * @param {number} [durationMs=900] Fade duration in milliseconds.
     * @returns {void}
     */
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

    /**
     * Starts both music tracks in preparation for a crossfade.
     *
     * @returns {void}
     */
    prepareBossMusicCrossfade() {
        this.playBackgroundMusic();
        this.playBossMusic(0);
    }

    /**
     * Creates the timing state used by the boss crossfade.
     *
     * @param {number} durationMs Fade duration in milliseconds.
     * @returns {{stepMs: number, totalSteps: number, currentStep: number, backgroundStartVolume: number, bossStartVolume: number}} Crossfade timing state.
     */
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

    /**
     * Advances the current boss music crossfade by one step.
     *
     * @param {{stepMs: number, totalSteps: number, currentStep: number, backgroundStartVolume: number, bossStartVolume: number}} fadeState Active crossfade state.
     * @returns {void}
     */
    advanceBossMusicCrossfade(fadeState) {
        fadeState.currentStep++;

        let progress = Math.min(1, fadeState.currentStep / fadeState.totalSteps);
        this.applyCrossfadeProgress(progress, fadeState);

        if (progress >= 1) {
            this.finishBossMusicCrossfade();
        }
    }

    /**
     * Applies the computed crossfade progress to both music tracks.
     *
     * @param {number} progress Current fade progress between 0 and 1.
     * @param {{backgroundStartVolume: number, bossStartVolume: number}} fadeState Active crossfade state.
     * @returns {void}
     */
    applyCrossfadeProgress(progress, fadeState) {
        this.backgroundMusic.volume = fadeState.backgroundStartVolume * (1 - progress);
        this.bossMusic.volume = fadeState.bossStartVolume + (this.bossMusicTargetVolume - fadeState.bossStartVolume) * progress;
    }

    /**
     * Finalizes the boss music crossfade and resets track volumes.
     *
     * @returns {void}
     */
    finishBossMusicCrossfade() {
        this.clearMusicFade();
        this.pauseTrack(this.backgroundMusic, 'backgroundMusicStarted');
        this.backgroundMusic.currentTime = 0;
        this.backgroundMusic.volume = this.backgroundMusicTargetVolume;
        this.bossMusic.volume = this.bossMusicTargetVolume;
    }

    /**
     * Restores both music tracks to their default idle state.
     *
     * @returns {void}
     */
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

    /**
     * Stops all active music playback.
     *
     * @returns {void}
     */
    stopAllMusic() {
        this.resetMusicBlend();
    }

    /**
     * Starts a music track if it is not already marked as playing.
     *
     * @param {HTMLAudioElement} track Music track to start.
     * @param {string} startedFlagName Property name that tracks playback state.
     * @returns {void}
     */
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

    /**
     * Marks a track as started once its play promise resolves.
     *
     * @param {Promise<void>} playPromise Playback promise from the audio element.
     * @param {string} startedFlagName Property name that tracks playback state.
     * @returns {void}
     */
    attachTrackStartHandler(playPromise, startedFlagName) {
        playPromise
            .then(() => {
                this.markTrackStarted(startedFlagName);
            })
            .catch(() => {});
    }

    /**
     * Checks whether a value behaves like a promise.
     *
     * @param {*} value Value to inspect.
     * @returns {boolean} True when the value exposes a then function.
     */
    isPromiseLike(value) {
        return !!value && typeof value.then === 'function';
    }

    /**
     * Sets the started flag for a track.
     *
     * @param {string} startedFlagName Property name that tracks playback state.
     * @returns {void}
     */
    markTrackStarted(startedFlagName) {
        this[startedFlagName] = true;
    }

    /**
     * Pauses the regular background music.
     *
     * @returns {void}
     */
    pauseBackgroundMusic() {
        this.pauseTrack(this.backgroundMusic, 'backgroundMusicStarted');
    }

    /**
     * Stops the background music and rewinds it to the start.
     *
     * @returns {void}
     */
    stopBackgroundMusic() {
        this.pauseBackgroundMusic();
        this.backgroundMusic.currentTime = 0;
    }

    /**
     * Registers a pooled one-shot sound effect.
     *
     * @param {string} name Lookup key for later playback.
     * @param {string} soundPath File path to the sound asset.
     * @param {number} [volume=1] Initial playback volume.
     * @param {number} [poolSize=4] Number of reusable audio elements in the pool.
     * @returns {void}
     */
    registerSound(name, soundPath, volume = 1, poolSize = 4) {
        let sounds = Array.from({ length: poolSize }, () => this.createSoundElement(soundPath, volume));

        this.soundEffects.set(name, {
            sounds,
            nextIndex: 0,
        });
    }

    /**
     * Registers a looping sound effect that can be started and stopped by name.
     *
     * @param {string} name Lookup key for later playback.
     * @param {string} soundPath File path to the sound asset.
     * @param {number} [volume=1] Initial playback volume.
     * @returns {void}
     */
    registerLoopingSound(name, soundPath, volume = 1) {
        let sound = this.createSoundElement(soundPath, volume);
        sound.loop = true;
        this.loopingSoundEffects.set(name, sound);
    }

    /**
     * Plays a registered one-shot sound effect by name.
     *
     * @param {string} name Registered sound lookup key.
     * @returns {void}
     */
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

    /**
     * Starts a registered looping sound effect.
     *
     * @param {string} name Registered sound lookup key.
     * @returns {void}
     */
    startLoopingSound(name) {
        let sound = this.loopingSoundEffects.get(name);
        if (!sound || !sound.paused) {
            return;
        }

        sound.play().catch(() => {});
    }

    /**
     * Stops and rewinds a registered looping sound effect.
     *
     * @param {string} name Registered sound lookup key.
     * @returns {void}
     */
    stopLoopingSound(name) {
        let sound = this.loopingSoundEffects.get(name);
        if (!sound) {
            return;
        }

        sound.pause();
        sound.currentTime = 0;
    }

    /**
     * Stops all registered looping sound effects.
     *
     * @returns {void}
     */
    stopAllLoopingSounds() {
        this.loopingSoundEffects.forEach((sound, name) => {
            this.stopLoopingSound(name);
        });
    }

    /**
     * Applies the mute state to all managed music and sound-effect channels.
     *
     * @param {boolean} isMuted Whether all audio should be muted.
     * @returns {void}
     */
    setMuted(isMuted) {
        this.backgroundMusic.muted = isMuted;

        if (this.bossMusic) {
            this.bossMusic.muted = isMuted;
        }

        this.setMutedOnSoundEffects(isMuted);
        this.setMutedOnLoopingSoundEffects(isMuted);
    }

    /**
     * Applies the mute state to all pooled one-shot sound effects.
     *
     * @param {boolean} isMuted Whether sound effects should be muted.
     * @returns {void}
     */
    setMutedOnSoundEffects(isMuted) {
        this.soundEffects.forEach((soundEntry) => {
            soundEntry.sounds.forEach((sound) => {
                sound.muted = isMuted;
            });
        });
    }

    /**
     * Applies the mute state to all looping sound effects.
     *
     * @param {boolean} isMuted Whether looping effects should be muted.
     * @returns {void}
     */
    setMutedOnLoopingSoundEffects(isMuted) {
        this.loopingSoundEffects.forEach((sound) => {
            sound.muted = isMuted;
        });
    }

    /**
     * Preloads audio assets after the first user interaction unlocks playback.
     *
     * @returns {void}
     */
    unlockAudio() {
        if (this.audioUnlocked) {
            return;
        }

        this.loadMusicTracks();
        this.loadSoundEffects();
        this.loadLoopingSoundEffects();
        this.audioUnlocked = true;
    }

    /**
     * Preloads the managed music tracks.
     *
     * @returns {void}
     */
    loadMusicTracks() {
        this.backgroundMusic.load();

        if (this.bossMusic) {
            this.bossMusic.load();
        }
    }

    /**
     * Preloads all pooled one-shot sound effects.
     *
     * @returns {void}
     */
    loadSoundEffects() {
        this.soundEffects.forEach((soundEntry) => {
            soundEntry.sounds.forEach((sound) => {
                sound.load();
            });
        });
    }

    /**
     * Preloads all registered looping sound effects.
     *
     * @returns {void}
     */
    loadLoopingSoundEffects() {
        this.loopingSoundEffects.forEach((sound) => {
            sound.load();
        });
    }

    /**
     * Toggles the current mute state and returns the new muted flag.
     *
     * @returns {boolean} The updated mute state.
     */
    toggleMuted() {
        this.setMuted(!this.backgroundMusic.muted);
        return this.backgroundMusic.muted;
    }

    /**
     * Creates a configured sound effect audio element.
     *
     * @param {string} soundPath File path for the sound asset.
     * @param {number} volume Initial playback volume.
     * @returns {HTMLAudioElement} Configured audio element.
     */
    createSoundElement(soundPath, volume) {
        let sound = new Audio(soundPath);
        sound.preload = 'auto';
        sound.volume = volume;
        sound.muted = this.backgroundMusic.muted;
        return sound;
    }

    /**
     * Creates a configured looping music track.
     *
     * @param {string} soundPath File path for the track asset.
     * @param {number} volume Initial playback volume.
     * @returns {HTMLAudioElement} Configured audio element.
     */
    createMusicTrack(soundPath, volume) {
        let track = new Audio(soundPath);
        track.loop = true;
        track.volume = volume;
        track.preload = 'auto';
        return track;
    }

    /**
     * Pauses a track and clears its started flag.
     *
     * @param {?HTMLAudioElement} track Track to pause.
     * @param {string} startedFlagName Property name that tracks playback state.
     * @returns {void}
     */
    pauseTrack(track, startedFlagName) {
        if (!track) {
            return;
        }

        track.pause();
        this[startedFlagName] = false;
    }

    /**
     * Clears the active music fade interval if one exists.
     *
     * @returns {void}
     */
    clearMusicFade() {
        if (!this.musicFadeInterval) {
            return;
        }

        window.clearInterval(this.musicFadeInterval);
        this.musicFadeInterval = null;
    }
}
