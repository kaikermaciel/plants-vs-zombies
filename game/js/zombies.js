import { gameState, activeZombies } from './state.js';
import { updateUI } from './ui.js';
import { playSFX } from './audio.js';
import { saveHighScore } from './storage.js';

/* ==========================================
   1. CONFIGURATION CONSTANTS
   ========================================== */
const BALANCE = {
    BASE_SPAWN_INTERVAL: 6000,
    MIN_SPAWN_INTERVAL: 800,
    WAVE_SCALING_FACTOR: 0.65,
    HORD_CHANCE_PER_WAVE: 0.15,
    RANDOM_SPEED_MAX_BONUS: 0.02,
    CONEHEAD_SPAWN_CHANCE_BASE: 0.2
};

let lastSpawnTime = 0;
let zombiesSpawnedInCurrentWave = 0;

const ZOMBIE_TYPES = {
    normal: { health: 3, speed: 0.025, class: 'zombie-normal', damage: 1 },
    conehead: { health: 7, speed: 0.018, class: 'zombie-conehead', damage: 1.5 }
};

/* ==========================================
   2. SPAWN LOGIC
   ========================================== */
export function spawnZombie() {
    const rows = 5;
    const randomRow = Math.floor(Math.random() * rows);
    const lane = document.getElementById(`lane-${randomRow}`);
    if (!lane) return;

    const coneheadChance = BALANCE.CONEHEAD_SPAWN_CHANCE_BASE + (gameState.wave * 0.05);
    const typeKey = (Math.random() < coneheadChance && gameState.wave > 1) ? 'conehead' : 'normal';
    const config = ZOMBIE_TYPES[typeKey];

    // DIFICULDADE DINÂMICA: Escala a vida dos zumbis levemente conforme a onda
    const healthBonus = Math.floor(gameState.wave / 5);
    const finalHealth = config.health + healthBonus;

    const randomSpeedBonus = (Math.random() * BALANCE.RANDOM_SPEED_MAX_BONUS) - (BALANCE.RANDOM_SPEED_MAX_BONUS / 2);
    const finalSpeed = Math.max(0.01, config.speed + randomSpeedBonus);

    const zombieDiv = document.createElement('div');
    zombieDiv.classList.add('zombie', config.class);
    zombieDiv.style.left = '100%';
    
    // if (typeKey === 'conehead') {
    //    zombieDiv.style.backgroundColor = 'brown'; 
    // }

    lane.appendChild(zombieDiv);

    activeZombies.push({
        id: `zombie-${Date.now()}-${Math.random()}`,
        row: randomRow,
        health: finalHealth,
        speed: finalSpeed, 
        damage: config.damage,
        leftPercent: 100,
        widthPercent: 7.64,
        element: zombieDiv,
        isEating: false
    });
    
    playSFX('zombieSpawn');
}

/* ==========================================
   3. CORE LOOP
   ========================================== */
export function updateZombies(deltaTime) {
    const currentTime = performance.now();

    const difficultyModifier = gameState.difficulty === 'hard' ? 0.7 : gameState.difficulty === 'easy' ? 1.3 : 1.0;
    let spawnInterval = BALANCE.BASE_SPAWN_INTERVAL / Math.pow(gameState.wave, BALANCE.WAVE_SCALING_FACTOR);
    spawnInterval = Math.max(BALANCE.MIN_SPAWN_INTERVAL, spawnInterval) * difficultyModifier;

    if (currentTime - lastSpawnTime >= spawnInterval) {
        spawnZombie();
        
        if (Math.random() < (BALANCE.HORD_CHANCE_PER_WAVE * (gameState.wave / 2))) {
            setTimeout(() => spawnZombie(), 300); 
        }

        lastSpawnTime = currentTime;
        zombiesSpawnedInCurrentWave++;

        if (zombiesSpawnedInCurrentWave >= (5 + gameState.wave * 2)) { 
            gameState.wave++;
            zombiesSpawnedInCurrentWave = 0;
            updateUI(gameState);
            saveHighScore(gameState.wave);
        }
    }

    for (let i = activeZombies.length - 1; i >= 0; i--) {
        const zombie = activeZombies[i];

        if (!zombie.isEating) {
            zombie.leftPercent -= zombie.speed * (deltaTime / 16);
            zombie.element.style.left = `${zombie.leftPercent}%`;
        }

        if (zombie.leftPercent <= 0) {
            gameState.lives -= 1; 
            updateUI(gameState);
            zombie.element.remove();
            activeZombies.splice(i, 1);
        }
    }
}

export function resetZombieSpawnTime() {
    lastSpawnTime = performance.now() + 15000;
    zombiesSpawnedInCurrentWave = 0;
}
