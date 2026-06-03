/* ==========================================
   1. LOCAL STORAGE MANAGER
   ========================================== */

const STORAGE_KEY = 'lawn_defense_high_wave';

function saveHighScore(waveSurvived) {
    const currentHighScore = localStorage.getItem(STORAGE_KEY) ? parseInt(localStorage.getItem(STORAGE_KEY)) : 0;
    
    // Se a onda atual for maior que o recorde antigo, atualiza
    if (waveSurvived > currentHighScore) {
        localStorage.setItem(STORAGE_KEY, waveSurvived);
        console.log(`Novo Recorde Salvo: Onda ${waveSurvived}`);
    }
}

function loadHighScore() {
    const displayElement = document.getElementById('highest-wave');
    const storedScore = localStorage.getItem(STORAGE_KEY);
    
    if (displayElement) {
        displayElement.innerText = storedScore ? storedScore : '0';
    }
}