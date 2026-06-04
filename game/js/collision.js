/* ==========================================
   1. COLLISION DETECTION ENGINE
   ========================================== */

function checkCollisions(state) {
    if (!state.isRunning || state.isPaused) return;

    // Arrays globais mapeados de plants.js e zombies.js
    const projectiles = typeof activeProjectiles !== 'undefined' ? activeProjectiles : [];
    const plants = typeof activePlants !== 'undefined' ? activePlants : [];
    const zombies = activeZombies;

    /* ------------------------------------------
       MECÂNICA A: Projéteis vs Zumbis
       ------------------------------------------ */
    for (let pIdx = projectiles.length - 1; pIdx >= 0; pIdx--) {
        const proj = projectiles[pIdx];
        const projRect = proj.element.getBoundingClientRect();

        for (let zIdx = zombies.length - 1; zIdx >= 0; zIdx--) {
            const zombie = zombies[zIdx];

            // Otimização: Só checa colisão se estiverem EXATAMENTE na mesma linha (row)
            if (proj.row === zombie.row) {
                const zombieRect = zombie.element.getBoundingClientRect();

                // Teste de intersecção AABB clássico de 2D
                if (
                    projRect.right >= zombieRect.left &&
                    projRect.left <= zombieRect.right
                ) {
                    // 1. Remove o projétil da tela e do array
                    proj.element.remove();
                    projectiles.splice(pIdx, 1);

                    // 2. Aplica dano ao Zumbi
                    zombie.health -= 1;

                    // Efeito visual de feedback de dano (piscar vermelho rápido)
                    zombie.element.style.filter = 'brightness(1.8) sepia(1) hue-rotate(-50deg)';
                    setTimeout(() => {
                        if (zombie.element) zombie.element.style.filter = 'none';
                    }, 100);

                    // 3. Verifica morte do Zumbi
                    if (zombie.health <= 0) {
                        // Recompensa o jogador com pontos e energia extra
                        state.score += 100;
                        state.energy += 25; // Ganha sóis ao derrotar ameaças!
                        if (typeof updateUI === 'function') updateUI(state);

                        zombie.element.remove();
                        zombies.splice(zIdx, 1);
                    }
                    break; // Para de testar este projétil específico já destruído
                }
            }
        }
    }

    /* ------------------------------------------
       MECÂNICA B: Zumbis vs Plantas (Interação Dinâmica)
       ------------------------------------------ */
    // Reseta o estado de "comendo" e remove a imagem de mordida de todos antes da nova checagem
    zombies.forEach(z => {
        z.isEating = false;
        if (z.element) z.element.classList.remove('eating');
    });

    zombies.forEach(zombie => {
        const zombieRect = zombie.element.getBoundingClientRect();

        for (let plIdx = plants.length - 1; plIdx >= 0; plIdx--) {
            const plant = plants[plIdx];

            if (zombie.row === plant.row) {
                const plantRect = plant.element.getBoundingClientRect();

                // Checa se o zumbi encostou na frente da planta
                if (
                    zombieRect.left <= plantRect.right &&
                    zombieRect.right >= plantRect.left
                ) {
                    zombie.isEating = true; // Zumbi para de andar
                    zombie.element.classList.add('eating'); // ATIVA O PNG DELE COMENDO!
                    playSFX('zombieGulp');
                    // Aplica decaimento de "vida" na planta baseado no tempo (frame)
                    if (!plant.healthPool) plant.healthPool = 100; // Vida interna da planta
                    
                    plant.healthPool -= zombie.damage * (deltaTime / 1000);

                    // === O CÓDIGO DA NOZ ENTRA AQUI ===
                    // Se for uma Wall-nut, muda o frame do sprite baseado na porcentagem de vida restante
                    if (plant.type === 'wallnut') {
                        const lifePercent = (plant.healthPool / plant.maxHealth) * 100;

                        if (lifePercent <= 33) {
                            // Estado Crítico (Muito Rachada)
                            plant.element.classList.remove('wallnut-healthy', 'wallnut-damaged');
                            plant.element.classList.add('wallnut-broken');
                        } else if (lifePercent <= 66) {
                            // Estado Médio (Rachada)
                            plant.element.classList.remove('wallnut-healthy', 'wallnut-broken');
                            plant.element.classList.add('wallnut-damaged');
                        }
                    }
                    // ==================================

                    // Feedback visual da planta sendo comida (piscar opacidade)
                    plant.element.style.opacity = (Math.sin(performance.now() / 50) > 0) ? '0.5' : '1';

                    // Se a planta quebrar/morrer
                    if (plant.healthPool <= 0) {
                        // 1. Limpa o modelo de dados do tabuleiro (board.js) para permitir replantar
                        if (typeof gridModel !== 'undefined') {
                            gridModel[plant.row][plant.col] = null;
                        }

                        // 2. Remove o elemento visual do DOM
                        plant.element.remove();
                        plants.splice(plIdx, 1);
                        
                        zombie.isEating = false; // Zumbi volta a andar no próximo frame
                        zombie.element.classList.remove('eating'); // Garante que ele mude a imagem de volta imediatamente
                    }
                    break;
                }
            }
        }
    });
}