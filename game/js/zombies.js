/* ==========================================
   1. CONFIGURATION CONSTANTS (Central de Balanço)
   ========================================== */
const BALANCE = {
    BASE_SPAWN_INTERVAL: 6000,      // Tempo inicial entre zumbis (6s)
    MIN_SPAWN_INTERVAL: 800,        // No late game, zumbis podem vir a cada 0.8s!
    WAVE_SCALING_FACTOR: 0.65,      // Quanto menor, mais rápido o jogo acelera por onda
    HORD_CHANCE_PER_WAVE: 0.15,     // Chance (15%) de spawnar um zumbi extra instantâneo
    RANDOM_SPEED_MAX_BONUS: 0.02,   // Variável máxima de velocidade aleatória
    CONEHEAD_SPAWN_CHANCE_BASE: 0.2 // Chance base do zumbi de cone aparecer
};

const activeZombies = [];
let lastSpawnTime = 0;
let spawnInterval = BALANCE.BASE_SPAWN_INTERVAL;
let zombiesSpawnedInCurrentWave = 0;

const ZOMBIE_TYPES = {
    normal: { health: 3, speed: 0.025, class: 'zombie-normal', damage: 1 },
    conehead: { health: 7, speed: 0.018, class: 'zombie-conehead', damage: 1.5 }
};

/* ==========================================
   2. SPAWN LOGIC WITH RANDOMNESS
   ========================================== */
function spawnZombie() {
    const rows = 5;
    const randomRow = Math.floor(Math.random() * rows); // ALEATORIEDADE: Escolha da pista
    const lane = document.getElementById(`lane-${randomRow}`);
    if (!lane) return;

    // ALEATORIEDADE 1: Chance de vir Conehead escala dinamicamente com a onda atual
    const coneheadChance = BALANCE.CONEHEAD_SPAWN_CHANCE_BASE + (gameState.wave * 0.05);
    const typeKey = (Math.random() < coneheadChance && gameState.wave > 1) ? 'conehead' : 'normal';
    const config = ZOMBIE_TYPES[typeKey];

    // ALEATORIEDADE 2: Desvia ligeiramente a velocidade padrão de cada zumbi individualmente
    // Isso faz com que alguns zumbis ultrapassem outros na mesma pista, quebrando formações!
    const randomSpeedBonus = (Math.random() * BALANCE.RANDOM_SPEED_MAX_BONUS) - (BALANCE.RANDOM_SPEED_MAX_BONUS / 2);
    const finalSpeed = Math.max(0.01, config.speed + randomSpeedBonus);

    const zombieDiv = document.createElement('div');
    zombieDiv.classList.add('zombie', config.class);
    zombieDiv.style.left = '100%';
    
    if (typeKey === 'conehead') {
        zombieDiv.style.backgroundColor = 'brown'; 
    }

    lane.appendChild(zombieDiv);

    activeZombies.push({
        id: `zombie-${Date.now()}-${Math.random()}`,
        row: randomRow,
        health: config.health,
        speed: finalSpeed, // Aplicado aqui
        damage: config.damage,
        leftPercent: 100,
        element: zombieDiv,
        isEating: false
    });
    
    playSFX('zombieSpawn');
}

/* ==========================================
   3. CORE LOOP & DYNAMIC DIFFICULT
   ========================================== */
function updateZombies(deltaTime) {
    const currentTime = performance.now();

    // CONSTANTES + MATEMÁTICA: Redução não-linear do tempo de spawn.
    // Conforme a onda sobre, o intervalo cai drasticamente usando potência, impedindo estabilização do jogador.
    const difficultyModifier = gameState.difficulty === 'hard' ? 0.7 : gameState.difficulty === 'easy' ? 1.3 : 1.0;
    spawnInterval = BALANCE.BASE_SPAWN_INTERVAL / Math.pow(gameState.wave, BALANCE.WAVE_SCALING_FACTOR);
    spawnInterval = Math.max(BALANCE.MIN_SPAWN_INTERVAL, spawnInterval) * difficultyModifier;

    if (currentTime - lastSpawnTime >= spawnInterval) {
        spawnZombie();
        
        // ALEATORIEDADE 3: Mecânica de "Horda Surpresa"
        // Existe uma chance de nascer um segundo zumbi imediatamente em outra pista
        if (Math.random() < (BALANCE.HORD_CHANCE_PER_WAVE * (gameState.wave / 2))) {
            setTimeout(() => spawnZombie(), 300); 
        }

        lastSpawnTime = currentTime;
        zombiesSpawnedInCurrentWave++;

        // Avanço de Onda equilibrado por quantidade gerada
        if (zombiesSpawnedInCurrentWave >= (5 + gameState.wave * 2)) { 
            gameState.wave++;
            zombiesSpawnedInCurrentWave = 0;
            if (typeof updateUI === 'function') updateUI(gameState);
        }
    }

    // Movimentação
    for (let i = activeZombies.length - 1; i >= 0; i--) {
        const zombie = activeZombies[i];

        if (!zombie.isEating) {
            zombie.leftPercent -= zombie.speed * (deltaTime / 16);
            zombie.element.style.left = `${zombie.leftPercent}%`;
        }

        if (zombie.leftPercent <= 0) {
            gameState.lives -= 1; 
            if (typeof updateUI === 'function') updateUI(gameState);
            zombie.element.remove();
            activeZombies.splice(i, 1);
        }
    }
}