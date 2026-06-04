/* ==========================================
   1. THE MODEL (Global Game State)
   ========================================== */
const gameState = {
    isRunning: false,
    isPaused: false,
    energy: 150, // BALANCE: Começo turbinado para defesa inicial
    lives: 3,
    wave: 1,
    score: 0,
    lastFrameTime: 0,
    difficulty: 'normal'
};

/* ==========================================
   2. DOM ELEMENTS (The View Hooks)
   ========================================== */
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    pause: document.getElementById('pause-screen'),
    gameOver: document.getElementById('game-over-screen')
};

const buttons = {
    start: document.getElementById('btn-start'),
    pause: document.getElementById('btn-pause'),
    resume: document.getElementById('btn-resume'),
    restart: document.getElementById('btn-restart'),
    pauseRestart: document.getElementById('btn-pause-restart') // NOVO: Mapeamento do botão de reiniciar na pausa
};

const difficultySelect = document.getElementById('difficulty');

/* ==========================================
   3. STATE MANAGEMENT FUNCTIONS (The Controller)
   ========================================== */
function switchScreen(screenToShow) {
    // Hide all screens completely
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });

    // If showing an overlay (Pause or Game Over), keep the game board visible underneath
    if (screenToShow === screens.pause || screenToShow === screens.gameOver) {
        screens.game.classList.remove('hidden');
        screens.game.classList.add('active'); 
    }
    
    screenToShow.classList.remove('hidden');
    screenToShow.classList.add('active');
}

function startGame() {
    // BUG FIX (Memória Fantasma): Limpa os arrays globais e o modelo do tabuleiro antes de iniciar/reiniciar
    if (typeof activeZombies !== 'undefined') activeZombies.length = 0;
    if (typeof activePlants !== 'undefined') activePlants.length = 0;
    if (typeof activeProjectiles !== 'undefined') activeProjectiles.length = 0;
    if (typeof gridModel !== 'undefined') gridModel.forEach(row => row.fill(null));

    // BALANCE (Tempo de Respiro): Adiciona um intervalo de 15 segundos antes do primeiro zumbi surgir
    if (typeof lastSpawnTime !== 'undefined') lastSpawnTime = performance.now() + 15000;

    // Reset Game State
    gameState.difficulty = difficultySelect.value;
    gameState.energy = 150; 
    gameState.lives = 3;
    gameState.wave = 1;
    gameState.isRunning = true;
    gameState.isPaused = false;

    // Call UI update if ui.js is ready
    if (typeof updateUI === 'function') updateUI(gameState);

    // Call Board initialization if board.js is ready
    if (typeof initBoard === 'function') initBoard();

    switchScreen(screens.game);

    // Start the core loop
    gameState.lastFrameTime = performance.now();
    requestAnimationFrame(gameLoop);
    initBackgroundMusic();
}

function pauseGame() {
    if (!gameState.isRunning) return;
    gameState.isPaused = true;
    switchScreen(screens.pause);
    if (audioController.bgmInstance) audioController.bgmInstance.pause();
}

function resumeGame() {
    gameState.isPaused = false;
    switchScreen(screens.game);
    // Reset frame time to avoid a massive jump in logic after resuming
    gameState.lastFrameTime = performance.now(); 
    requestAnimationFrame(gameLoop);
    
    // BUG FIX: Usa o método .play() nativo da API Web Audio
    if (audioController.bgmInstance) audioController.bgmInstance.play();
}

function gameOver() {
    gameState.isRunning = false;
    document.getElementById('final-wave').innerText = gameState.wave;
    switchScreen(screens.gameOver);

    // Extra Feature: Save to LocalStorage if storage.js is ready
    if (typeof saveHighScore === 'function') saveHighScore(gameState.wave);
    stopBackgroundMusic();
    playSFX('gameOver');
}

/* ==========================================
   4. THE CORE GAME LOOP
   ========================================== */
function gameLoop(currentTime) {
    // Stop the loop if game is over or paused
    if (!gameState.isRunning || gameState.isPaused) return;

    // Calculate time elapsed since the last frame
    const deltaTime = currentTime - gameState.lastFrameTime;

    // Cap the update logic to roughly 60 frames per second (every ~16ms)
    if (deltaTime >= 16) {
        
        // --- DELEGATE TO OTHER MODULES ---
        if (typeof updateZombies === 'function') updateZombies(deltaTime);
        if (typeof updatePlants === 'function') updatePlants(deltaTime);
        if (typeof checkCollisions === 'function') checkCollisions(gameState, deltaTime); // Passando deltaTime corrigido
        
        gameState.lastFrameTime = currentTime;
    }

    // Check lose condition
    if (gameState.lives <= 0) {
        gameOver();
        return; // End the loop entirely
    }

    // Tell the browser to call gameLoop again before the next repaint
    requestAnimationFrame(gameLoop);
}

/* ==========================================
   5. EVENT LISTENERS
   ========================================== */
buttons.start.addEventListener('click', startGame);
buttons.pause.addEventListener('click', pauseGame);
buttons.resume.addEventListener('click', resumeGame);
buttons.restart.addEventListener('click', startGame);

// NOVO: Vincula a ação de reiniciar ao clique do botão na tela de pausa
if (buttons.pauseRestart) {
    buttons.pauseRestart.addEventListener('click', startGame);
}

// Initialize High Score display on first page load
window.addEventListener('DOMContentLoaded', () => {
    if (typeof loadHighScore === 'function') {
        loadHighScore();
    }
});