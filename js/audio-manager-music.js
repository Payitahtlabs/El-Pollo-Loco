/**
 * Starts the regular background music track.
 *
 * @returns {void}
 */
AudioManager.prototype.playBackgroundMusic = function () {
    this.clearMusicFade();
    this.backgroundMusic.volume = this.backgroundMusicTargetVolume;
    this.playMusicTrack(this.backgroundMusic, 'backgroundMusicStarted');
};

/**
 * Starts the boss music track at the requested initial volume.
 *
 * @param {number} [initialVolume=0] Initial boss track volume.
 * @returns {void}
 */
AudioManager.prototype.playBossMusic = function (initialVolume = 0) {
    if (!this.bossMusic) {
        return;
    }

    this.bossMusic.volume = initialVolume;
    this.playMusicTrack(this.bossMusic, 'bossMusicStarted');
};

/**
 * Crossfades from the background track into the boss track.
 *
 * @param {number} [durationMs=900] Fade duration in milliseconds.
 * @returns {void}
 */
AudioManager.prototype.crossfadeToBossMusic = function (durationMs = 900) {
    if (!this.bossMusic) {
        return;
    }

    this.clearMusicFade();
    this.prepareBossMusicCrossfade();

    let fadeState = this.createCrossfadeState(durationMs);
    this.musicFadeInterval = window.setInterval(() => {
        this.advanceBossMusicCrossfade(fadeState);
    }, fadeState.stepMs);
};

/**
 * Starts both music tracks in preparation for a crossfade.
 *
 * @returns {void}
 */
AudioManager.prototype.prepareBossMusicCrossfade = function () {
    this.playBackgroundMusic();
    this.playBossMusic(0);
};

/**
 * Creates the timing state used by the boss crossfade.
 *
 * @param {number} durationMs Fade duration in milliseconds.
 * @returns {{stepMs: number, totalSteps: number, currentStep: number, backgroundStartVolume: number, bossStartVolume: number}} Crossfade timing state.
 */
AudioManager.prototype.createCrossfadeState = function (durationMs) {
    let stepMs = 50;

    return {
        stepMs,
        totalSteps: Math.max(1, Math.ceil(durationMs / stepMs)),
        currentStep: 0,
        backgroundStartVolume: this.backgroundMusic.volume,
        bossStartVolume: this.bossMusic.volume,
    };
};

/**
 * Advances the current boss music crossfade by one step.
 *
 * @param {{stepMs: number, totalSteps: number, currentStep: number, backgroundStartVolume: number, bossStartVolume: number}} fadeState Active crossfade state.
 * @returns {void}
 */
AudioManager.prototype.advanceBossMusicCrossfade = function (fadeState) {
    fadeState.currentStep++;

    let progress = Math.min(1, fadeState.currentStep / fadeState.totalSteps);
    this.applyCrossfadeProgress(progress, fadeState);

    if (progress >= 1) {
        this.finishBossMusicCrossfade();
    }
};

/**
 * Applies the computed crossfade progress to both music tracks.
 *
 * @param {number} progress Current fade progress between 0 and 1.
 * @param {{backgroundStartVolume: number, bossStartVolume: number}} fadeState Active crossfade state.
 * @returns {void}
 */
AudioManager.prototype.applyCrossfadeProgress = function (progress, fadeState) {
    this.backgroundMusic.volume = fadeState.backgroundStartVolume * (1 - progress);
    this.bossMusic.volume = fadeState.bossStartVolume + (this.bossMusicTargetVolume - fadeState.bossStartVolume) * progress;
};

/**
 * Finalizes the boss music crossfade and resets track volumes.
 *
 * @returns {void}
 */
AudioManager.prototype.finishBossMusicCrossfade = function () {
    this.clearMusicFade();
    this.pauseTrack(this.backgroundMusic, 'backgroundMusicStarted');
    this.backgroundMusic.currentTime = 0;
    this.backgroundMusic.volume = this.backgroundMusicTargetVolume;
    this.bossMusic.volume = this.bossMusicTargetVolume;
};

/**
 * Restores both music tracks to their default idle state.
 *
 * @returns {void}
 */
AudioManager.prototype.resetMusicBlend = function () {
    this.clearMusicFade();
    this.pauseTrack(this.bossMusic, 'bossMusicStarted');
    this.pauseTrack(this.backgroundMusic, 'backgroundMusicStarted');

    if (this.bossMusic) {
        this.bossMusic.currentTime = 0;
        this.bossMusic.volume = 0;
    }

    this.backgroundMusic.currentTime = 0;
    this.backgroundMusic.volume = this.backgroundMusicTargetVolume;
};

/**
 * Stops all active music playback.
 *
 * @returns {void}
 */
AudioManager.prototype.stopAllMusic = function () {
    this.resetMusicBlend();
};

/**
 * Starts a music track if it is not already marked as playing.
 *
 * @param {HTMLAudioElement} track Music track to start.
 * @param {string} startedFlagName Property name that tracks playback state.
 * @returns {void}
 */
AudioManager.prototype.playMusicTrack = function (track, startedFlagName) {
    if (!track || this[startedFlagName]) {
        return;
    }

    let playPromise = track.play();
    if (!this.isPromiseLike(playPromise)) {
        this.markTrackStarted(startedFlagName);
        return;
    }

    this.attachTrackStartHandler(playPromise, startedFlagName);
};

/**
 * Marks a track as started once its play promise resolves.
 *
 * @param {Promise<void>} playPromise Playback promise from the audio element.
 * @param {string} startedFlagName Property name that tracks playback state.
 * @returns {void}
 */
AudioManager.prototype.attachTrackStartHandler = function (playPromise, startedFlagName) {
    playPromise
        .then(() => {
            this.markTrackStarted(startedFlagName);
        })
        .catch(() => {});
};

/**
 * Checks whether a value behaves like a promise.
 *
 * @param {*} value Value to inspect.
 * @returns {boolean} True when the value exposes a then function.
 */
AudioManager.prototype.isPromiseLike = function (value) {
    return !!value && typeof value.then === 'function';
};

/**
 * Sets the started flag for a track.
 *
 * @param {string} startedFlagName Property name that tracks playback state.
 * @returns {void}
 */
AudioManager.prototype.markTrackStarted = function (startedFlagName) {
    this[startedFlagName] = true;
};

/**
 * Pauses the regular background music.
 *
 * @returns {void}
 */
AudioManager.prototype.pauseBackgroundMusic = function () {
    this.pauseTrack(this.backgroundMusic, 'backgroundMusicStarted');
};

/**
 * Stops the background music and rewinds it to the start.
 *
 * @returns {void}
 */
AudioManager.prototype.stopBackgroundMusic = function () {
    this.pauseBackgroundMusic();
    this.backgroundMusic.currentTime = 0;
};

/**
 * Creates a configured looping music track.
 *
 * @param {string} soundPath File path for the track asset.
 * @param {number} volume Initial playback volume.
 * @returns {HTMLAudioElement} Configured audio element.
 */
AudioManager.prototype.createMusicTrack = function (soundPath, volume) {
    let track = new Audio(soundPath);
    track.loop = true;
    track.volume = volume;
    track.preload = 'auto';
    return track;
};

/**
 * Pauses a track and clears its started flag.
 *
 * @param {?HTMLAudioElement} track Track to pause.
 * @param {string} startedFlagName Property name that tracks playback state.
 * @returns {void}
 */
AudioManager.prototype.pauseTrack = function (track, startedFlagName) {
    if (!track) {
        return;
    }

    track.pause();
    this[startedFlagName] = false;
};

/**
 * Clears the active music fade interval if one exists.
 *
 * @returns {void}
 */
AudioManager.prototype.clearMusicFade = function () {
    if (!this.musicFadeInterval) {
        return;
    }

    window.clearInterval(this.musicFadeInterval);
    this.musicFadeInterval = null;
};
