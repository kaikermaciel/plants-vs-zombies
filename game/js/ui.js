/* ==========================================
   1. UI RENDERER
   ========================================== */

// Atualiza todos os elementos de texto do HUD com base no gameState atual
function updateUI(state) {
    const energyCount = document.getElementById('energy-count');
    const livesCount = document.getElementById('lives-count');
    const waveCount = document.getElementById('wave-count');

    if (energyCount) energyCount.innerText = state.energy;
    if (livesCount) livesCount.innerText = state.lives;
    if (waveCount) waveCount.innerText = state.wave;

    // Atualiza visualmente a seleção de pacotes (opcional: escurecer se não tiver sol suficiente)
    renderSeedPackets(state.energy);
}

function renderSeedPackets(currentEnergy) {
    const packets = document.querySelectorAll('.seed-packet');
    packets.forEach(packet => {
        const cost = parseInt(packet.dataset.cost);
        if (currentEnergy < cost) {
            packet.style.opacity = '0.5';
            packet.style.cursor = 'not-allowed';
        } else {
            packet.style.opacity = '1';
            packet.style.cursor = 'pointer';
        }
    });
}