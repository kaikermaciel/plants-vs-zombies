/* ==========================================
   GLOBAL GAME STATE (Shared across modules)
   ========================================== */

export const gameState = {
    isRunning: false,
    isPaused: false,
    energy: 150,
    lives: 3,
    wave: 1,
    score: 0,
    lastFrameTime: 0,
    difficulty: 'normal'
};

export const activePlants = [];
export const activeProjectiles = [];
export const activeZombies = [];

export const ROWS = 5;
export const COLS = 9;
export const gridModel = Array(ROWS).fill().map(() => Array(COLS).fill(null));

export function resetGameState() {
    activeZombies.length = 0;
    activePlants.length = 0;
    activeProjectiles.length = 0;
    gridModel.forEach(row => row.fill(null));
    
    gameState.energy = 150;
    gameState.lives = 3;
    gameState.wave = 1;
    gameState.score = 0;
    gameState.isRunning = true;
    gameState.isPaused = false;
}
