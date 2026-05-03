/**
 * Registers a pooled one-shot sound effect.
 *
 * @param {string} name Lookup key for later playback.
 * @param {string} soundPath File path to the sound asset.
 * @param {number} [volume=1] Initial playback volume.
 * @param {number} [poolSize=4] Number of reusable audio elements in the pool.
 * @returns {void}
 */
AudioManager.prototype.registerSound = function (name, soundPath, volume = 1, poolSize = 4) {
    let sounds = Array.from({ length: poolSize }, () => this.createSoundElement(soundPath, volume));
    this.soundEffects.set(name, {
        sounds,
        nextIndex: 0,
    });
};

/**
 * Registers a looping sound effect that can be started and stopped by name.
 *
 * @param {string} name Lookup key for later playback.
 * @param {string} soundPath File path to the sound asset.
 * @param {number} [volume=1] Initial playback volume.
 * @returns {void}
 */
AudioManager.prototype.registerLoopingSound = function (name, soundPath, volume = 1) {
    let sound = this.createSoundElement(soundPath, volume);
    sound.loop = true;
    this.loopingSoundEffects.set(name, sound);
};

/**
 * Plays a registered one-shot sound effect by name.
 *
 * @param {string} name Registered sound lookup key.
 * @returns {void}
 */
AudioManager.prototype.playSound = function (name) {
    let soundEntry = this.soundEffects.get(name);
    if (!soundEntry || soundEntry.sounds.length === 0) {
        return;
    }

    let sound = soundEntry.sounds[soundEntry.nextIndex];
    soundEntry.nextIndex = (soundEntry.nextIndex + 1) % soundEntry.sounds.length;

    sound.currentTime = 0;
    sound.play().catch(() => {});
};

/**
 * Starts a registered looping sound effect.
 *
 * @param {string} name Registered sound lookup key.
 * @returns {void}
 */
AudioManager.prototype.startLoopingSound = function (name) {
    let sound = this.loopingSoundEffects.get(name);
    if (!sound || !sound.paused) {
        return;
    }

    sound.play().catch(() => {});
};

/**
 * Stops and rewinds a registered looping sound effect.
 *
 * @param {string} name Registered sound lookup key.
 * @returns {void}
 */
AudioManager.prototype.stopLoopingSound = function (name) {
    let sound = this.loopingSoundEffects.get(name);
    if (!sound) {
        return;
    }

    sound.pause();
    sound.currentTime = 0;
};

/**
 * Stops all registered looping sound effects.
 *
 * @returns {void}
 */
AudioManager.prototype.stopAllLoopingSounds = function () {
    this.loopingSoundEffects.forEach((sound, name) => {
        this.stopLoopingSound(name);
    });
};

/**
 * Applies the mute state to all managed music and sound-effect channels.
 *
 * @param {boolean} isMuted Whether all audio should be muted.
 * @returns {void}
 */
AudioManager.prototype.setMuted = function (isMuted) {
    this.backgroundMusic.muted = isMuted;

    if (this.bossMusic) {
        this.bossMusic.muted = isMuted;
    }

    this.setMutedOnSoundEffects(isMuted);
    this.setMutedOnLoopingSoundEffects(isMuted);
};

/**
 * Applies the mute state to all pooled one-shot sound effects.
 *
 * @param {boolean} isMuted Whether sound effects should be muted.
 * @returns {void}
 */
AudioManager.prototype.setMutedOnSoundEffects = function (isMuted) {
    this.soundEffects.forEach((soundEntry) => {
        soundEntry.sounds.forEach((sound) => {
            sound.muted = isMuted;
        });
    });
};

/**
 * Applies the mute state to all looping sound effects.
 *
 * @param {boolean} isMuted Whether looping effects should be muted.
 * @returns {void}
 */
AudioManager.prototype.setMutedOnLoopingSoundEffects = function (isMuted) {
    this.loopingSoundEffects.forEach((sound) => {
        sound.muted = isMuted;
    });
};

/**
 * Preloads audio assets after the first user interaction unlocks playback.
 *
 * @returns {void}
 */
AudioManager.prototype.unlockAudio = function () {
    if (this.audioUnlocked) {
        return;
    }

    this.loadMusicTracks();
    this.loadSoundEffects();
    this.loadLoopingSoundEffects();
    this.audioUnlocked = true;
};

/**
 * Preloads the managed music tracks.
 *
 * @returns {void}
 */
AudioManager.prototype.loadMusicTracks = function () {
    this.backgroundMusic.load();

    if (this.bossMusic) {
        this.bossMusic.load();
    }
};

/**
 * Preloads all pooled one-shot sound effects.
 *
 * @returns {void}
 */
AudioManager.prototype.loadSoundEffects = function () {
    this.soundEffects.forEach((soundEntry) => {
        soundEntry.sounds.forEach((sound) => {
            sound.load();
        });
    });
};

/**
 * Preloads all registered looping sound effects.
 *
 * @returns {void}
 */
AudioManager.prototype.loadLoopingSoundEffects = function () {
    this.loopingSoundEffects.forEach((sound) => {
        sound.load();
    });
};

/**
 * Toggles the current mute state and returns the new muted flag.
 *
 * @returns {boolean} The updated mute state.
 */
AudioManager.prototype.toggleMuted = function () {
    this.setMuted(!this.backgroundMusic.muted);
    return this.backgroundMusic.muted;
};

/**
 * Creates a configured sound effect audio element.
 *
 * @param {string} soundPath File path for the sound asset.
 * @param {number} volume Initial playback volume.
 * @returns {HTMLAudioElement} Configured audio element.
 */
AudioManager.prototype.createSoundElement = function (soundPath, volume) {
    let sound = new Audio(soundPath);
    sound.preload = 'auto';
    sound.volume = volume;
    sound.muted = this.backgroundMusic.muted;
    return sound;
};
