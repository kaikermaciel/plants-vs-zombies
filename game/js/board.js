import { gameState, gridModel, ROWS, COLS } from './state.js';
import { attemptPlacePlant, isShovelSelected, attemptRemovePlant, clearSelection } from './plants.js';

/* ==========================================
   DOM GENERATION (The View)
   ========================================== */
export function initBoard() {
    const lawn = document.getElementById('lawn');
    lawn.innerHTML = ''; 

    for (let r = 0; r < ROWS; r++) {
        const laneDiv = document.createElement('div');
        laneDiv.classList.add('lane');
        laneDiv.dataset.row = r; 
        laneDiv.id = `lane-${r}`; 

        for (let c = 0; c < COLS; c++) {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');
            cellDiv.dataset.row = r;
            cellDiv.dataset.col = c;
            cellDiv.id = `cell-${r}-${c}`;
            cellDiv.addEventListener('click', handleCellClick);
            laneDiv.appendChild(cellDiv);
        }

        lawn.appendChild(laneDiv);
    }
}

/* ==========================================
   INTERACTION LOGIC
   ========================================== */
function handleCellClick(event) {
    if (!gameState.isRunning || gameState.isPaused) return;

    const clickedCell = event.currentTarget;
    const r = parseInt(clickedCell.dataset.row);
    const c = parseInt(clickedCell.dataset.col);

    // MECÂNICA DE REMOÇÃO (PÁ)
    if (isShovelSelected) {
        if (gridModel[r][c] !== null) {
            const success = attemptRemovePlant(r, c);
            if (success) {
                gridModel[r][c] = null;
            }
        }
        clearSelection();
        return;
    }

    // MECÂNICA DE PLANTIO
    if (gridModel[r][c] !== null) {
        return;
    }

    const success = attemptPlacePlant(r, c, clickedCell);
    if (success) {
        gridModel[r][c] = 'plant'; 
    }
}
