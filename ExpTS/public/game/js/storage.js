/* ==========================================
   STORAGE MANAGER (ES6 Module)
   ========================================== */

const HIGH_SCORE_KEY = 'lawnDefense_highScore';

export function saveHighScore(wave) {
    const currentHigh = getHighScore();
    if (wave > currentHigh) {
        localStorage.setItem(HIGH_SCORE_KEY, wave);
        updateHighScoreDisplay(wave);
    }
}

export function getHighScore() {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
}

export function loadHighScore() {
    const high = getHighScore();
    updateHighScoreDisplay(high);
}

function updateHighScoreDisplay(score) {
    const display = document.getElementById('highest-wave');
    if (display) display.innerText = score;
}
