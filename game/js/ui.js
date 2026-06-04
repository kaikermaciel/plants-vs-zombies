/* ==========================================
   UI CONTROLLER (ES6 Module)
   ========================================== */

export function updateUI(state) {
    const energyDisplay = document.getElementById('energy-count');
    const livesDisplay = document.getElementById('lives-count');
    const waveDisplay = document.getElementById('wave-count');

    if (energyDisplay) energyDisplay.innerText = state.energy;
    if (livesDisplay) livesDisplay.innerText = state.lives;
    if (waveDisplay) waveDisplay.innerText = state.wave;
}

export function showFinalWave(wave) {
    const finalWaveDisplay = document.getElementById('final-wave');
    if (finalWaveDisplay) finalWaveDisplay.innerText = wave;
}

// Any other UI-specific manipulations can go here
