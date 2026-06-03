/* ==========================================
   1. ZOMBIE STATE & CONFIGURATION
   ========================================== */
const activeZombies = []; // Lista global de zumbis na tela
let lastSpawnTime = 0;
let spawnInterval = 5000; // Tempo inicial de spawn (5 segundos)

// Configurações de atributos por tipo de zumbi (Funcionalidade Adicional!)
const ZOMBIE_TYPES = {
    normal: { health: 3, speed: 0.05, class: 'zombie-normal', damage: 1 },
    conehead: { health: 6, speed: 0.03, class: 'zombie-conehead', damage: 1.5 }
};

/* ==========================================
   2. SPAWN LOGIC (Gerador de Hordas)
   ========================================== */
function spawnZombie() {
    const rows = 5;
    const randomRow = Math.floor(Math.random() * rows);
    const lane = document.getElementById(`lane-${randomRow}`);
    if (!lane) return;

    // Decide o tipo com base na Onda atual
    const typeKey = (gameState.wave > 2 && Math.random() > 0.6) ? 'conehead' : 'normal';
    const config = ZOMBIE_TYPES[typeKey];

    // Criação dinâmica do elemento no DOM
    const zombieDiv = document.createElement('div');
    zombieDiv.classList.add('zombie', config.class);
    
    // Configuração visual inicial (nascendo na extrema direita da pista)
    let startLeftPercent = 100;
    zombieDiv.style.left = `${startLeftPercent}%`;
    
    // Se quiser aplicar cores diferentes enquanto não tem sprites:
    if (typeKey === 'conehead') {
        zombieDiv.style.backgroundColor = 'brown'; 
    }

    lane.appendChild(zombieDiv);

    // Registra o zumbi logicamente
    activeZombies.push({
        id: `zombie-${Date.now()}-${Math.random()}`,
        row: randomRow,
        health: config.health,
        speed: config.speed,
        damage: config.damage,
        leftPercent: startLeftPercent,
        element: zombieDiv,
        isEating: false
    });
}

/* ==========================================
   3. ZOMBIE LOOP (Chamado pelo main.js)
   ========================================== */
function updateZombies(deltaTime) {
    const currentTime = performance.now();

    // 1. Controle de Dificuldade progressiva por Fase/Onda
    // Ajusta o intervalo de spawn dinamicamente baseado na onda e dificuldade
    const baseModifier = gameState.difficulty === 'hard' ? 0.7 : gameState.difficulty === 'easy' ? 1.3 : 1.0;
    spawnInterval = Math.max(2000, (6000 - (gameState.wave * 400)) * baseModifier);

    if (currentTime - lastSpawnTime >= spawnInterval) {
        spawnZombie();
        lastSpawnTime = currentTime;

        // A cada 5 zumbis spawnados, há uma chance de subir a onda
        if (activeZombies.length % 5 === 0) {
            gameState.wave++;
            if (typeof updateUI === 'function') updateUI(gameState);
        }
    }

    // 2. Movimentação dos Zumbis vivos
    for (let i = activeZombies.length - 1; i >= 0; i--) {
        const zombie = activeZombies[i];

        // Se o zumbi não estiver travado comendo uma planta, ele anda para a esquerda
        if (!zombie.isEating) {
            zombie.leftPercent -= zombie.speed * (deltaTime / 16);
            zombie.element.style.left = `${zombie.leftPercent}%`;
        }

        // Condição de Derrota: Zumbi invadiu a casa (passou do limite esquerdo 0%)
        if (zombie.leftPercent <= 0) {
            gameState.lives -= 1; // Deduz uma vida do jogador
            if (typeof updateUI === 'function') updateUI(gameState);

            // Remove do DOM e do Array
            zombie.element.remove();
            activeZombies.splice(i, 1);
        }
    }
}