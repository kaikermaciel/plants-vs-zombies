/* ==========================================
   1. BOARD CONFIGURATION & STATE
   ========================================== */
const ROWS = 5;
const COLS = 9;

// This array acts as the Data Model for our grid. 
// It tracks what is sitting in each cell (null means the cell is empty).
const gridModel = Array(ROWS).fill().map(() => Array(COLS).fill(null));

/* ==========================================
   2. DOM GENERATION (The View)
   ========================================== */
function initBoard() {
    const lawn = document.getElementById('lawn');
    
    // Clear the lawn. This ensures that if the player hits "Restart", 
    // we don't accidentally stack a new grid on top of the old one.
    lawn.innerHTML = ''; 

    // Loop to build the 5 lanes
    for (let r = 0; r < ROWS; r++) {
        const laneDiv = document.createElement('div');
        laneDiv.classList.add('lane');
        
        // Save the row number in the HTML for easy access later
        laneDiv.dataset.row = r; 
        // Give it an ID so zombies.js can easily find where to append zombies
        laneDiv.id = `lane-${r}`; 

        // Loop to build the 9 cells inside each lane
        for (let c = 0; c < COLS; c++) {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');
            
            // Save the exact coordinates in the HTML
            cellDiv.dataset.row = r;
            cellDiv.dataset.col = c;
            cellDiv.id = `cell-${r}-${c}`;

            // Add the click listener for when the player tries to place a plant
            cellDiv.addEventListener('click', handleCellClick);

            // Append the cell into the lane
            laneDiv.appendChild(cellDiv);
        }

        // Append the completed lane into the main lawn
        lawn.appendChild(laneDiv);
    }
}

/* ==========================================
   3. INTERACTION LOGIC (The Controller)
   ========================================== */
function handleCellClick(event) {
    // Prevent planting if the game isn't actively running
    if (!gameState.isRunning || gameState.isPaused) return;

    const clickedCell = event.currentTarget;
    const r = parseInt(clickedCell.dataset.row);
    const c = parseInt(clickedCell.dataset.col);

    // 1. Check if the cell is already occupied in our Model
    if (gridModel[r][c] !== null) {
        console.log("This cell is already occupied!");
        // Extra Polish: You could flash the cell red here to indicate an error
        return;
    }

    // 2. Delegate the actual planting logic to Developer 3 (plants.js).
    // We use defensive coding here. If Developer 3 hasn't finished writing
    // attemptPlacePlant() yet, the game won't crash when you click a square.
    if (typeof attemptPlacePlant === 'function') {
        
        // Pass the coordinates and the specific DOM element to plants.js
        const success = attemptPlacePlant(r, c, clickedCell);
        
        // If planting was successful (they had enough energy, etc.), update the Model
        if (success) {
            gridModel[r][c] = 'plant'; // We can make this more specific later
        }

    } else {
        console.warn("plants.js is not hooked up yet. Cannot place plant at", r, c);
    }
}