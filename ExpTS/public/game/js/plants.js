import { gameState, activePlants, activeProjectiles } from './state.js';
import { updateUI } from './ui.js';
import { playSFX } from './audio.js';

/* ==========================================
   1. SELECTION & ACTIVE PLANTS
   ========================================== */
export let selectedPlantType = null;
export let selectedPlantCost = 0;
export let isShovelSelected = false;

let nextSkySunTime = Date.now() + 4000;

export function initPlantSelector() {
    const packets = document.querySelectorAll('.seed-packet');
    const shovel = document.getElementById('shovel');

    packets.forEach(packet => {
        packet.addEventListener('click', () => {
            clearSelection();
            const cost = parseInt(packet.dataset.cost);
            
            if (gameState.energy >= cost) {
                selectedPlantType = packet.dataset.plantType;
                selectedPlantCost = cost;
                packet.style.borderColor = '#76ff03'; 
            }
        });
    });

    if (shovel) {
        shovel.addEventListener('click', () => {
            const wasShovel = isShovelSelected;
            clearSelection();
            if (!wasShovel) {
                isShovelSelected = true;
                shovel.classList.add('selected');
            }
        });
    }
}

export function clearSelection() {
    selectedPlantType = null;
    selectedPlantCost = 0;
    isShovelSelected = false;
    document.querySelectorAll('.seed-packet').forEach(p => p.style.borderColor = '#fff');
    const shovel = document.getElementById('shovel');
    if (shovel) shovel.classList.remove('selected');
}

/* ==========================================
   2. PLANTING & REMOVING LOGIC
   ========================================== */
export function attemptRemovePlant(row, col) {
    const plantIndex = activePlants.findIndex(p => p.row === row && p.col === col);
    if (plantIndex !== -1) {
        const plant = activePlants[plantIndex];
        plant.element.remove();
        activePlants.splice(plantIndex, 1);
        playSFX('plant'); // Reutiliza som de planta para feedback
        return true;
    }
    return false;
}
export function attemptPlacePlant(row, col, cellDiv) {
    if (!selectedPlantType) return false;
    if (gameState.energy < selectedPlantCost) return false;

    gameState.energy -= selectedPlantCost;
    updateUI(gameState);

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
        leftPercent: 22 + (col * 8.66),
        widthPercent: 8.66,
        element: plantDiv,
        healthPool: plantHealth,
        maxHealth: plantHealth,
        lastShot: 0,
        cooldown: 2000,
        lastSun: performance.now(), 
        sunCooldown: 8000 
    });

    clearSelection();
    playSFX('plant');
    return true;
}

/* ==========================================
   3. ENGINE LOOP
   ========================================== */
export function updatePlants(deltaTime) {
    const currentTime = performance.now();
    const now = Date.now();

    if (now >= nextSkySunTime) {
        spawnSkySun();
        nextSkySunTime = now + (Math.random() * 3000 + 5000);
    }

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
            if (currentTime - plant.lastSun >= plant.sunCooldown) {
                spawnSunflowerSun(plant.row, plant.col);
                plant.lastSun = currentTime; 
            }
        }
    });

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
   4. SPAWNERS
   ========================================== */
export function spawnProjectile(row, col) {
    const lane = document.getElementById(`lane-${row}`);
    if (!lane) return;

    const projectileDiv = document.createElement('div');
    projectileDiv.classList.add('projectile');
    
    const startLeft = 22 + (col * 8.66) + 5;
    projectileDiv.style.left = `${startLeft}%`;

    lane.appendChild(projectileDiv);

    activeProjectiles.push({
        element: projectileDiv,
        row: row,
        leftPercent: startLeft,
        widthPercent: 1.76,
        speed: 0.4
    });
    playSFX('shoot');
}

function spawnSunflowerSun(row, col) {
    const lane = document.getElementById(`lane-${row}`);
    if (!lane) return;

    const sunDiv = document.createElement('div');
    sunDiv.classList.add('sun');
    
    const startLeft = 22 + (col * 8.66) + (8.66 / 4);
    
    sunDiv.style.left = `${startLeft}%`;
    sunDiv.style.top = '15%'; 

    sunDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        gameState.energy += 25; 
        updateUI(gameState);
        sunDiv.remove();
    });

    lane.appendChild(sunDiv);
    playSFX('points');
    setTimeout(() => { if (sunDiv.parentNode) sunDiv.remove(); }, 8000);
}

function spawnSkySun() {
    const lawn = document.getElementById('lawn');
    if (!lawn) return;

    const sunDiv = document.createElement('div');
    sunDiv.classList.add('sun');

    const randomLeft = Math.random() * 60 + 25;
    const targetTop = Math.random() * 65 + 15;

    sunDiv.style.left = `${randomLeft}%`;
    sunDiv.style.top = '-60px'; 

    sunDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        gameState.energy += 25;
        updateUI(gameState);
        sunDiv.remove();
    });

    lawn.appendChild(sunDiv);
    playSFX('points');
    setTimeout(() => {
        sunDiv.style.top = `${targetTop}%`;
    }, 50);

    setTimeout(() => {
        if (sunDiv.parentNode) sunDiv.remove();
    }, 11000);
}
