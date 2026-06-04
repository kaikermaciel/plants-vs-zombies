import { gameState, resetGameState } from './state.js';
import { updateUI, showFinalWave } from './ui.js';
import { initBackgroundMusic, pauseAllAudio, resumeAllAudio, stopBackgroundMusic, playSFX } from './audio.js';
import { loadHighScore, saveHighScore } from './storage.js';
import { initBoard } from './board.js';
import { initPlantSelector } from './plants.js';
import { updateZombies, resetZombieSpawnTime } from './zombies.js';
import { updatePlants } from './plants.js';
import { checkCollisions } from './collision.js';

/* ==========================================
   DOM ELEMENTS
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
    pauseRestart: document.getElementById('btn-pause-restart')
};

const difficultySelect = document.getElementById('difficulty');

/* ==========================================
   STATE MANAGEMENT FUNCTIONS
   ========================================== */
function switchScreen(screenToShow) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });

    if (screenToShow === screens.pause || screenToShow === screens.gameOver) {
        screens.game.classList.remove('hidden');
        screens.game.classList.add('active'); 
    }
    
    screenToShow.classList.remove('hidden');
    screenToShow.classList.add('active');
}

function startGame() {
    resetGameState();
    resetZombieSpawnTime();

    gameState.difficulty = difficultySelect.value;
    updateUI(gameState);
    initBoard();

    switchScreen(screens.game);

    gameState.lastFrameTime = performance.now();
    requestAnimationFrame(gameLoop);
    initBackgroundMusic();
}

function pauseGame() {
    if (!gameState.isRunning) return;
    gameState.isPaused = true;
    switchScreen(screens.pause);
    pauseAllAudio();
}

function resumeGame() {
    gameState.isPaused = false;
    switchScreen(screens.game);
    gameState.lastFrameTime = performance.now(); 
    requestAnimationFrame(gameLoop);
    resumeAllAudio();
}

function gameOver() {
    gameState.isRunning = false;
    showFinalWave(gameState.wave);
    switchScreen(screens.gameOver);
    saveHighScore(gameState.wave);
    stopBackgroundMusic();
    playSFX('gameOver');
}

/* ==========================================
   THE CORE GAME LOOP
   ========================================== */
function gameLoop(currentTime) {
    if (!gameState.isRunning || gameState.isPaused) return;

    const deltaTime = currentTime - gameState.lastFrameTime;

    if (deltaTime >= 16) {
        updateZombies(deltaTime);
        updatePlants(deltaTime);
        checkCollisions(gameState, deltaTime);
        
        gameState.lastFrameTime = currentTime;
    }

    if (gameState.lives <= 0) {
        gameOver();
        return;
    }

    requestAnimationFrame(gameLoop);
}

/* ==========================================
   INITIALIZATION
   ========================================== */
buttons.start.addEventListener('click', startGame);
buttons.pause.addEventListener('click', pauseGame);
buttons.resume.addEventListener('click', resumeGame);
buttons.restart.addEventListener('click', startGame);
if (buttons.pauseRestart) {
    buttons.pauseRestart.addEventListener('click', startGame);
}

window.addEventListener('DOMContentLoaded', () => {
    loadHighScore();
    initPlantSelector();
});
