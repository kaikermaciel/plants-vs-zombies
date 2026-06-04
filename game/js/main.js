/* ==========================================
   1. THE MODEL (Global Game State)
   ========================================== */
const gameState = {
    isRunning: false,
    isPaused: false,
    energy: 50,
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
    restart: document.getElementById('btn-restart')
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
    // Reset Game State
    gameState.difficulty = difficultySelect.value;
    gameState.energy = 50;
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
    if (audioController.bgmInstance) audioController.bgmInstance.resume();
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
        // We pass deltaTime so animations/movement can be smooth regardless of lag
        if (typeof updateZombies === 'function') updateZombies(deltaTime);
        if (typeof updatePlants === 'function') updatePlants(deltaTime);
        if (typeof checkCollisions === 'function') checkCollisions(gameState);
        
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

// Initialize High Score display on first page load
window.addEventListener('DOMContentLoaded', () => {
    if (typeof loadHighScore === 'function') {
        loadHighScore();
    }
});