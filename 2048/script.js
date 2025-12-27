let board = new Array(16).fill(0);
let score = 0;
let bestScore = 0;
let history = [];
let gameWon = false;
let isMoving = false; // Prevent key spam

// Initialize best score from localStorage
function loadBestScore() {
    const saved = localStorage.getItem('bestScore');
    bestScore = saved ? parseInt(saved, 10) : 0;
    updateBestScoreUI();
}

function saveBestScore() {
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
        updateBestScoreUI();
    }
}

function updateBestScoreUI() {
    const bestScoreElement = document.getElementById('best-score');
    if (bestScoreElement) {
        bestScoreElement.textContent = bestScore;
    }
}

function getRandomEmptyCell() {
    const emptyCells = board.map((val, idx) => val === 0 ? idx : null).filter(v => v !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function spawnRandomTile() {
    const idx = getRandomEmptyCell();
    if (idx !== undefined) {
        board[idx] = Math.random() < 0.9 ? 2 : 4;
        // Add animation class
        setTimeout(() => {
            const cell = document.getElementById(`cell-${idx}`);
            if (cell) {
                cell.classList.add('new-tile');
                setTimeout(() => cell.classList.remove('new-tile'), 200);
            }
        }, 10);
    }
}

function initializeBoard() {
    board.fill(0);
    score = 0;
    gameWon = false;
    history = [];
    spawnRandomTile();
    spawnRandomTile();
    updateBoardUI();
    updateScoreUI();
    hideModal();
}

function updateBoardUI() {
    board.forEach((val, idx) => {
        const cell = document.getElementById(`cell-${idx}`);
        if (cell) {
            cell.textContent = val === 0 ? '' : val;
            cell.style.backgroundColor = getTileColor(val);
            cell.style.color = val > 4 ? '#f9f6f2' : '#776e65';
            cell.setAttribute('data-value', val);
        }
    });
}

function getTileColor(val) {
    const colors = {
        0: '#cdc1b4',
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e',
        4096: '#3c3a32',
        8192: '#3c3a32'
    };
    return colors[val] || '#3c3a32';
}

function updateScoreUI() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = score;
    }
    saveBestScore();
}

function arraysEqual(a, b) {
    return a.every((val, idx) => val === b[idx]);
}

function slideAndCombineRow(row) {
    // Remove zeros
    row = row.filter(val => val !== 0);

    // Combine tiles
    for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) {
            row[i] *= 2;
            score += row[i]; // Add combined value to score
            
            // Check for win condition
            if (row[i] === 2048 && !gameWon) {
                gameWon = true;
                setTimeout(() => showWinModal(), 300);
            }
            
            row[i + 1] = 0;
        }
    }

    // Remove zeros again
    row = row.filter(val => val !== 0);

    // Fill the rest with zeros
    while (row.length < 4) {
        row.push(0);
    }

    return row;
}

function makeMove(moveFunction) {
    if (isMoving) return; // Prevent key spam
    isMoving = true;
    
    saveHistory();
    moveFunction();
    
    setTimeout(() => {
        isMoving = false;
    }, 200);
}

function moveLeft() {
    let moved = false;
    for (let r = 0; r < 4; r++) {
        const row = board.slice(r * 4, r * 4 + 4);
        const newRow = slideAndCombineRow([...row]);
        if (!arraysEqual(row, newRow)) moved = true;
        board.splice(r * 4, 4, ...newRow);
    }
    if (moved) {
        spawnRandomTile();
        updateBoardUI();
        updateScoreUI();
        saveGame();
        checkGameOver();
    } else {
        history.pop(); // Remove the history entry if no move was made
    }
}

function moveRight() {
    let moved = false;
    for (let r = 0; r < 4; r++) {
        const row = board.slice(r * 4, r * 4 + 4).reverse();
        const newRow = slideAndCombineRow([...row]).reverse();
        if (!arraysEqual(row.reverse(), newRow)) moved = true;
        board.splice(r * 4, 4, ...newRow);
    }
    if (moved) {
        spawnRandomTile();
        updateBoardUI();
        updateScoreUI();
        saveGame();
        checkGameOver();
    } else {
        history.pop(); // Remove the history entry if no move was made
    }
}

function moveUp() {
    let moved = false;
    for (let c = 0; c < 4; c++) {
        const col = [];
        for (let r = 0; r < 4; r++) {
            col.push(board[r * 4 + c]);
        }
        const newCol = slideAndCombineRow([...col]);
        if (!arraysEqual(col, newCol)) moved = true;
        for (let r = 0; r < 4; r++) {
            board[r * 4 + c] = newCol[r];
        }
    }
    if (moved) {
        spawnRandomTile();
        updateBoardUI();
        updateScoreUI();
        saveGame();
        checkGameOver();
    } else {
        history.pop(); // Remove the history entry if no move was made
    }
}

function moveDown() {
    let moved = false;
    for (let c = 0; c < 4; c++) {
        const col = [];
        for (let r = 0; r < 4; r++) {
            col.push(board[r * 4 + c]);
        }
        const newCol = slideAndCombineRow([...col].reverse()).reverse();
        if (!arraysEqual(col, newCol)) moved = true;
        for (let r = 0; r < 4; r++) {
            board[r * 4 + c] = newCol[r];
        }
    }
    if (moved) {
        spawnRandomTile();
        updateBoardUI();
        updateScoreUI();
        saveGame();
        checkGameOver();
    } else {
        history.pop(); // Remove the history entry if no move was made
    }
}

function checkGameOver() {
    if (board.includes(0)) return false; // Still empty spaces

    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const idx = r * 4 + c;
            const val = board[idx];
            if ((c < 3 && board[idx + 1] === val) || (r < 3 && board[idx + 4] === val)) {
                return false; // Merge possible
            }
        }
    }

    setTimeout(() => showGameOverModal(), 300);
    return true;
}

function showGameOverModal() {
    const modal = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const message = document.getElementById('modal-message');
    const finalScore = document.getElementById('modal-final-score');
    const bestScoreModal = document.getElementById('modal-best-score');

    if (modal && title && message && finalScore && bestScoreModal) {
        title.textContent = 'Game Over!';
        message.textContent = 'No more moves available. Try again!';
        finalScore.textContent = score;
        bestScoreModal.textContent = bestScore;
        modal.classList.add('show');
    }
}

function showWinModal() {
    const modal = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const message = document.getElementById('modal-message');
    const finalScore = document.getElementById('modal-final-score');
    const bestScoreModal = document.getElementById('modal-best-score');

    if (modal && title && message && finalScore && bestScoreModal) {
        title.textContent = 'You Win!';
        message.textContent = 'Congratulations! You reached 2048!';
        finalScore.textContent = score;
        bestScoreModal.textContent = bestScore;
        modal.classList.add('show');
    }
}

function hideModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) {
        modal.classList.remove('show');
    }
}

function saveHistory() {
    history.push({
        board: [...board],   // Copy of current board
        score: score
    });

    if (history.length > 10) history.shift(); // Limit history size
}

function undoMove() {
    if (history.length === 0) return;
    const lastState = history.pop();
    board = [...lastState.board];
    score = lastState.score;
    updateBoardUI();
    updateScoreUI();
    saveGame();
}

function saveGame() {
    localStorage.setItem('board', JSON.stringify(board));
    localStorage.setItem('score', score);
}

function loadGame() {
    loadBestScore();
    const savedBoard = JSON.parse(localStorage.getItem('board'));
    const savedScore = parseInt(localStorage.getItem('score'), 10);

    if (savedBoard && savedBoard.length === 16) {
        board = savedBoard;
        score = savedScore || 0;
        updateBoardUI();
        updateScoreUI();
    } else {
        initializeBoard(); // No saved game, start fresh
    }
}

// Event Listeners
document.addEventListener('keydown', function(event) {
    if (isMoving) return; // Prevent key spam
    
    switch(event.key) {
        case 'ArrowUp':
            event.preventDefault();
            makeMove(moveUp);
            break;
        case 'ArrowDown':
            event.preventDefault();
            makeMove(moveDown);
            break;
        case 'ArrowLeft':
            event.preventDefault();
            makeMove(moveLeft);
            break;
        case 'ArrowRight':
            event.preventDefault();
            makeMove(moveRight);
            break;
    }
});

let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
}, { passive: true });

document.addEventListener('touchend', e => {
    if (isMoving) return;
    
    const touchEndTime = Date.now();
    if (touchEndTime - touchStartTime > 300) return; // Ignore long presses
    
    let dx = e.changedTouches[0].clientX - touchStartX;
    let dy = e.changedTouches[0].clientY - touchStartY;
    const minSwipeDistance = 30;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > minSwipeDistance) {
            if (dx > 0) makeMove(moveRight);
            else makeMove(moveLeft);
        }
    } else {
        if (Math.abs(dy) > minSwipeDistance) {
            if (dy > 0) makeMove(moveDown);
            else makeMove(moveUp);
        }
    }
}, { passive: true });

// Button event listeners
const restartBtn = document.getElementById('restart-btn');
if (restartBtn) {
    restartBtn.addEventListener('click', () => {
        board.fill(0);
        score = 0;
        gameWon = false;
        history = [];
        initializeBoard();
        saveGame();
    });
}

const newGameBtn = document.getElementById('new-game');
if (newGameBtn) {
    newGameBtn.addEventListener('click', () => {
        initializeBoard();
        saveGame();
    });
}

const undoBtn = document.getElementById('undo-btn');
if (undoBtn) {
    undoBtn.addEventListener('click', () => {
        if (!isMoving) {
            undoMove();
        }
    });
}

// Modal close button
const modalClose = document.getElementById('modal-close');
if (modalClose) {
    modalClose.addEventListener('click', hideModal);
}

// How to Play modal
const howToPlayBtn = document.getElementById('how-to-play-btn');
const howToPlayModal = document.getElementById('how-to-play-modal');
const closeInstructions = document.getElementById('close-instructions');

if (howToPlayBtn && howToPlayModal) {
    howToPlayBtn.addEventListener('click', () => {
        howToPlayModal.classList.add('show');
    });
}

if (closeInstructions && howToPlayModal) {
    closeInstructions.addEventListener('click', () => {
        howToPlayModal.classList.remove('show');
    });
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    const modalOverlay = document.getElementById('modal-overlay');
    const howToPlayModal = document.getElementById('how-to-play-modal');
    
    if (e.target === modalOverlay) {
        hideModal();
    }
    if (e.target === howToPlayModal) {
        howToPlayModal.classList.remove('show');
    }
});

// Load game on page load
window.addEventListener('load', loadGame);
