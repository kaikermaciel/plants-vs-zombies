/* ==========================================
   1. SELECTION & ACTIVE PLANTS
   ========================================== */
let selectedPlantType = null;
let selectedPlantCost = 0;
const activePlants = []; 
const activeProjectiles = []; 

// Controle de tempo para os Sóis do Céu
let nextSkySunTime = Date.now() + 4000; // O primeiro sol cai após 4 segundos de jogo

document.addEventListener('DOMContentLoaded', () => {
    const packets = document.querySelectorAll('.seed-packet');
    packets.forEach(packet => {
        packet.addEventListener('click', () => {
            packets.forEach(p => p.style.borderColor = '#fff');
            const cost = parseInt(packet.dataset.cost);
            
            if (gameState.energy >= cost) {
                selectedPlantType = packet.dataset.plantType;
                selectedPlantCost = cost;
                packet.style.borderColor = '#76ff03'; 
            }
        });
    });
});

/* ==========================================
   2. PLANTING LOGIC
   ========================================== */
function attemptPlacePlant(row, col, cellDiv) {
    if (!selectedPlantType) return false;
    if (gameState.energy < selectedPlantCost) return false;

    gameState.energy -= selectedPlantCost;
    if (typeof updateUI === 'function') updateUI(gameState);

    const plantDiv = document.createElement('div');
    let plantHealth = 100; 

    if (selectedPlantType === 'peashooter') {
        plantDiv.classList.add('plant', 'peashooter'); 
    } else if (selectedPlantType === 'wallnut') {
        plantDiv.classList.add('plant', 'wallnut', 'wallnut-healthy');
        plantHealth = 300; 
    } else if (selectedPlantType === 'sunflower') {
        plantDiv.classList.add('plant', 'sunflower');
        plantHealth = 100;
    }

    cellDiv.appendChild(plantDiv);

    activePlants.push({
        id: `plant-${Date.now()}`,
        type: selectedPlantType,
        row: row,
        col: col,
        element: plantDiv,
        healthPool: plantHealth,
        maxHealth: plantHealth,
        lastShot: 0,
        cooldown: 2000,
        lastSun: performance.now(), 
        sunCooldown: 12000 // Girassol gera sol a cada 12 segundos
    });

    selectedPlantType = null;
    selectedPlantCost = 0;
    document.querySelectorAll('.seed-packet').forEach(p => p.style.borderColor = '#fff');
    playSFX('plant');
    return true;
}

/* ==========================================
   3. ENGINE LOOP (Tiros, Projeteis e Sóis)
   ========================================== */
function updatePlants(deltaTime) {
    const currentTime = performance.now();
    const now = Date.now();

    // 🌤️ GERADOR DE SOL DO CÉU
    if (now >= nextSkySunTime) {
        spawnSkySun();
        // Sorteia o próximo intervalo de queda entre 8 e 12 segundos
        nextSkySunTime = now + (Math.random() * 4000 + 8000);
    }

    // Atualiza o comportamento de cada planta instalada
    activePlants.forEach(plant => {
        if (plant.type === 'peashooter') {
            const lane = document.getElementById(`lane-${plant.row}`);
            const hasZombieInLane = lane && lane.querySelector('.zombie') !== null;

            if (hasZombieInLane && (currentTime - plant.lastShot >= plant.cooldown)) {
                spawnProjectile(plant.row, plant.col);
                plant.lastShot = currentTime;
            }
        } 
        else if (plant.type === 'sunflower') {
            // Girassol gerando Sol Extra
            if (currentTime - plant.lastSun >= plant.sunCooldown) {
                spawnSunflowerSun(plant.row, plant.col);
                plant.lastSun = currentTime; 
            }
        }
    });

    // Move as ervilhas
    for (let i = activeProjectiles.length - 1; i >= 0; i--) {
        const proj = activeProjectiles[i];
        proj.leftPercent += proj.speed * (deltaTime / 16);
        proj.element.style.left = `${proj.leftPercent}%`;

        if (proj.leftPercent >= 100) {
            proj.element.remove();
            activeProjectiles.splice(i, 1);
        }
    }
}

/* ==========================================
   4. SPAWNERS (Ervilhas e Sóis)
   ========================================== */
function spawnProjectile(row, col) {
    const lane = document.getElementById(`lane-${row}`);
    if (!lane) return;

    const projectileDiv = document.createElement('div');
    projectileDiv.classList.add('projectile');
    
    const grassStart = 22;  
    const grassWidth = 78;  
    const cellWidth = grassWidth / 9; 
    
    const startLeft = grassStart + (col * cellWidth) + 5;
    projectileDiv.style.left = `${startLeft}%`;

    lane.appendChild(projectileDiv);

    activeProjectiles.push({
        element: projectileDiv,
        row: row,
        leftPercent: startLeft,
        speed: 0.4
    });
    playSFX('shoot');
}

// 🌻 Sol Extra gerado rente ao Girassol
function spawnSunflowerSun(row, col) {
    const lane = document.getElementById(`lane-${row}`);
    if (!lane) return;

    const sunDiv = document.createElement('div');
    sunDiv.classList.add('sun');
    
    const grassStart = 22;
    const grassWidth = 78;
    const cellWidth = grassWidth / 9;
    const startLeft = grassStart + (col * cellWidth) + (cellWidth / 4);
    
    sunDiv.style.left = `${startLeft}%`;
    sunDiv.style.top = '15%'; // Brota certinho na altura da planta

    sunDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        gameState.energy += 25; 
        if (typeof updateUI === 'function') updateUI(gameState);
        sunDiv.remove();
    });

    lane.appendChild(sunDiv);
    playSFX('points');
    setTimeout(() => { if (sunDiv.parentNode) sunDiv.remove(); }, 8000);
}

// ☁️ Sol que cai aleatoriamente do céu do mapa
function spawnSkySun() {
    const lawn = document.getElementById('lawn');
    if (!lawn) return;

    const sunDiv = document.createElement('div');
    sunDiv.classList.add('sun');

    // Sorteia uma posição horizontal na grama (entre 25% e 85% de largura)
    const randomLeft = Math.random() * 60 + 25;
    // Sorteia onde ele vai parar de cair (entre 15% e 80% de altura do mapa)
    const targetTop = Math.random() * 65 + 15;

    sunDiv.style.left = `${randomLeft}%`;
    sunDiv.style.top = '-60px'; // Começa escondido acima do mapa

    sunDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        gameState.energy += 25;
        if (typeof updateUI === 'function') updateUI(gameState);
        sunDiv.remove();
    });

    lawn.appendChild(sunDiv);
    playSFX('points');
    // Ativa a queda através do CSS transition na próxima atualização visual
    setTimeout(() => {
        sunDiv.style.top = `${targetTop}%`;
    }, 50);

    // Dá tempo para o sol cair e sumir caso o jogador o ignore
    setTimeout(() => {
        if (sunDiv.parentNode) sunDiv.remove();
    }, 11000);
}