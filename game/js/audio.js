import { gameState } from './state.js';

/* ==========================================
   AUDIO CONTROLLER (ES6 Module)
   ========================================== */

const audioFiles = {
    bgm: 'assets/sounds/background_music.mp3',
    plant: 'assets/sounds/plant.mp3',
    shoot: 'assets/sounds/shoot.mp3',
    zombieSpawn: 'assets/sounds/zombie_spawn.mp3',
    zombieGulp: 'assets/sounds/zombie_gulp.mp3',
    points: 'assets/sounds/sun_pickup.mp3',
    gameOver: 'assets/sounds/game_over.mp3'
};

const audioCache = {};
const activeSFX = new Set();

// Limites e Controle de Volume para evitar "cacofonia"
const SFX_LIMIT = 6; // Reduzido de 8 para 6 para maior clareza
const SFX_COOLDOWN = 200; // Aumentado para 200ms para evitar sobreposição rápida
const lastPlayed = {};

export function playSFX(name) {
    if (!gameState.isRunning || gameState.isPaused) return;
    if (!audioFiles[name]) return;

    // 1. Limite de instâncias simultâneas
    if (activeSFX.size >= SFX_LIMIT) return;

    // 2. Cooldown por tipo de som
    const now = Date.now();
    if (lastPlayed[name] && (now - lastPlayed[name] < SFX_COOLDOWN)) {
        return;
    }
    lastPlayed[name] = now;
    
    if (!audioCache[name]) {
        audioCache[name] = new Audio(audioFiles[name]);
    }
    
    const sound = audioCache[name].cloneNode();
    
    // Volume drasticamente reduzido para o tiro, já que é muito frequente
    sound.volume = name === 'shoot' ? 0.1 : 0.25;
    
    activeSFX.add(sound);
    sound.play().catch(e => console.warn("Audio blocked:", e));
    
    sound.onended = () => {
        activeSFX.delete(sound);
    };
}

let bgmInstance = null;

export function initBackgroundMusic() {
    if (!bgmInstance) {
        bgmInstance = new Audio(audioFiles.bgm);
        bgmInstance.loop = true;
        bgmInstance.volume = 0.15; // Volume de fundo suave
    }
    bgmInstance.play().catch(e => console.warn("BGM blocked:", e));
}

export function pauseAllAudio() {
    if (bgmInstance) bgmInstance.pause();
    activeSFX.forEach(sound => {
        if (!sound.paused) sound.pause();
    });
}

export function resumeAllAudio() {
    if (gameState.isRunning && !gameState.isPaused) {
        if (bgmInstance) bgmInstance.play();
        activeSFX.forEach(sound => {
            if (sound.paused && sound.currentTime > 0) {
                sound.play();
            }
        });
    }
}

export function stopBackgroundMusic() {
    if (bgmInstance) {
        bgmInstance.pause();
        bgmInstance.currentTime = 0;
    }
    activeSFX.forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
    });
    activeSFX.clear();
}
