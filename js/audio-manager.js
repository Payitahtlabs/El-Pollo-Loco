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
}
