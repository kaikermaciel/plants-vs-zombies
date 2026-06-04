import { activeProjectiles, activePlants, activeZombies, gridModel } from './state.js';
import { updateUI } from './ui.js';
import { playSFX } from './audio.js';

/* ==========================================
   1. COLLISION DETECTION ENGINE (LOGICAL)
   ========================================== */

export function checkCollisions(state, deltaTime) {
    if (!state.isRunning || state.isPaused) return;

    const projectiles = activeProjectiles;
    const plants = activePlants;
    const zombies = activeZombies;

    /* ------------------------------------------
       MECÂNICA A: Projeteis vs Zumbis
       ------------------------------------------ */
    for (let pIdx = projectiles.length - 1; pIdx >= 0; pIdx--) {
        const proj = projectiles[pIdx];
        const projLeft = proj.leftPercent;
        const projRight = proj.leftPercent + (proj.widthPercent || 1.76);

        for (let zIdx = zombies.length - 1; zIdx >= 0; zIdx--) {
            const zombie = zombies[zIdx];

            if (proj.row === zombie.row) {
                const zombieLeft = zombie.leftPercent;
                const zombieRight = zombie.leftPercent + (zombie.widthPercent || 7.64);

                if (projRight >= zombieLeft && projLeft <= zombieRight) {
                    proj.element.remove();
                    projectiles.splice(pIdx, 1);

                    zombie.health -= 1;
                    zombie.element.style.filter = 'brightness(1.8) sepia(1) hue-rotate(-50deg)';
                    setTimeout(() => {
                        if (zombie.element) zombie.element.style.filter = 'none';
                    }, 100);

                    if (zombie.health <= 0) {
                        state.score += 100;
                        state.energy += 25;
                        updateUI(state);
                        zombie.element.remove();
                        zombies.splice(zIdx, 1);
                    }
                    break; 
                }
            }
        }
    }

    /* ------------------------------------------
       MECÂNICA B: Zumbis vs Plantas
       ------------------------------------------ */
    zombies.forEach(zombie => {
        zombie.isEating = false;
        if (zombie.element) zombie.element.classList.remove('eating');

        const zombieLeft = zombie.leftPercent;
        const zombieRight = zombie.leftPercent + (zombie.widthPercent || 7.64);

        for (let plIdx = plants.length - 1; plIdx >= 0; plIdx--) {
            const plant = plants[plIdx];

            if (zombie.row === plant.row) {
                const plantLeft = plant.leftPercent;
                const plantRight = plant.leftPercent + (plant.widthPercent || 8.66);

                if (zombieLeft <= plantRight && zombieRight >= plantLeft) {
                    zombie.isEating = true; 
                    zombie.element.classList.add('eating'); 

                    // FIX: O som de mordida agora é controlado pelo sistema de cooldown do audio.js
                    // e não dispara mais a cada frame (o que causava o aumento de volume).
                    playSFX('zombieGulp');

                    plant.healthPool -= zombie.damage * (deltaTime / 1000);

                    if (plant.type === 'wallnut') {
                        const lifePercent = (plant.healthPool / plant.maxHealth) * 100;
                        if (lifePercent <= 33) {
                            plant.element.classList.remove('wallnut-healthy', 'wallnut-damaged');
                            plant.element.classList.add('wallnut-broken');
                        } else if (lifePercent <= 66) {
                            plant.element.classList.remove('wallnut-healthy', 'wallnut-broken');
                            plant.element.classList.add('wallnut-damaged');
                        }
                    }

                    plant.element.style.opacity = (Math.sin(performance.now() / 50) > 0) ? '0.5' : '1';

                    if (plant.healthPool <= 0) {
                        gridModel[plant.row][plant.col] = null;
                        plant.element.remove();
                        plants.splice(plIdx, 1);
                        zombie.isEating = false;
                        zombie.element.classList.remove('eating');
                    }
                    break;
                }
            }
        }
    });
}
