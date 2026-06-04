/* ==========================================
   1. AUDIO CONFIGURATION & SOURCE MAP
   ========================================== */
const AUDIO_SOURCES = {
    // Background Music
    bgm: 'assets/sounds/background_music.mp3',
    
    // Sound Effects (SFX)
    seedSelect: 'assets/sounds/seed_select.mp3',
    plant: 'assets/sounds/plant.mp3',
    shoot: 'assets/sounds/shoot.mp3',
    points: 'assets/sounds/sun_pickup.mp3',
    zombieSpawn: 'assets/sounds/zombie_spawn.mp3',
    zombieGulp: 'assets/sounds/zombie_gulp.mp3',
    zombieInvasion: 'assets/sounds/zombie_invasion.mp3',
    gameOver: 'assets/sounds/game_over.mp3'
};

const audioController = {
    bgmInstance: null,
    isMuted: false,
    effectsVolume: 0.6,
    bgmVolume: 0.4
};

/* ==========================================
   2. CORE AUDIO CONTROLLER FUNCTIONS
   ========================================== */

/**
 * Initializes and starts the background loop music.
 * Modern browsers require user interaction (like clicking "Iniciar Jogo") 
 * before playing audio, so this must be triggered inside startGame().
 */
function initBackgroundMusic() {
    if (audioController.isMuted) return;

    // Prevent duplicating the music track if it's already running
    if (audioController.bgmInstance) {
        audioController.bgmInstance.pause();
    }

    try {
        audioController.bgmInstance = new Audio(AUDIO_SOURCES.bgm);
        audioController.bgmInstance.loop = true;
        audioController.bgmInstance.volume = audioController.bgmVolume;
        audioController.bgmInstance.play().catch(err => {
            console.warn("Autoplay block prevented background music from starting automatically:", err);
        });
    } catch (error) {
        console.error("Failed to load background music file:", error);
    }
}

/**
 * Stops the background music track completely.
 */
function stopBackgroundMusic() {
    if (audioController.bgmInstance) {
        audioController.bgmInstance.pause();
        audioController.bgmInstance.currentTime = 0;
    }
}

/**
 * Plays a short sound effect dynamically.
 * Creates an independent clone to allow overlapping sound effects.
 * @param {string} soundKey - The key from AUDIO_SOURCES dictionary
 */
function playSFX(soundKey) {
    if (audioController.isMuted || !AUDIO_SOURCES[soundKey]) return;

    try {
        const sfxClone = new Audio(AUDIO_SOURCES[soundKey]);
        sfxClone.volume = audioController.effectsVolume;
        sfxClone.play().catch(err => console.log(`SFX play interrupted: ${err}`));
        
        // Garbage collection: remove element reference after playback ends
        sfxClone.addEventListener('ended', () => {
            sfxClone.remove();
        });
    } catch (error) {
        console.warn(`Audio track could not play or asset is missing: ${soundKey}`, error);
    }
}

/**
 * Master mute toggle. Connect this to a button if your UI expands.
 */
function toggleMute() {
    audioController.isMuted = !audioController.isMuted;
    
    if (audioController.isMuted) {
        if (audioController.bgmInstance) audioController.bgmInstance.pause();
    } else {
        if (audioController.bgmInstance) audioController.bgmInstance.play();
    }
    
    console.log(`Master Mute Status: ${audioController.isMuted}`);
}