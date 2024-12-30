// Variáveis globais
let board = [];
let rows = 9;         // Padrão iniciante
let cols = 9;         // Padrão iniciante
let minesCount = 10;  // Padrão iniciante
let minesLeft = minesCount;
let timerInterval = null;
let secondsPassed = 0;
let gameOver = false;

// Referências dos elementos
const boardEl = document.getElementById('board');
const timerEl = document.getElementById('timer');
const minesLeftEl = document.getElementById('minesLeft');
const difficultySelect = document.getElementById('difficultySelect');
const resetButton = document.getElementById('resetButton');
const themeSelect = document.getElementById('themeSelect');
const colorSelect = document.getElementById('colorSelect');

window.onload = () => {
  // Inicializa o jogo
  initializeGame();

  // Muda a dificuldade ao selecionar
  difficultySelect.addEventListener('change', (e) => {
    setDifficulty(e.target.value);
    initializeGame();
  });

  // Botão de reset
  resetButton.addEventListener('click', () => {
    initializeGame();
  });

  // Modo claro/escuro
  themeSelect.addEventListener('change', (e) => {
    changeTheme(e.target.value);
  });

  // Cor de acentuação
  colorSelect.addEventListener('change', (e) => {
    changeAccentColor(e.target.value);
  });
};

// Define parâmetros de dificuldade
function setDifficulty(difficulty) {
  if (difficulty === 'beginner') {
    rows = 9;
    cols = 9;
    minesCount = 10;
  } else if (difficulty === 'intermediate') {
    rows = 16;
    cols = 16;
    minesCount = 40;
  } else if (difficulty === 'expert') {
    rows = 30;
    cols = 16;
    minesCount = 99;
  }
}

// Inicializa o tabuleiro
function initializeGame() {
  // Reinicia variáveis
  clearInterval(timerInterval);
  timerInterval = null;
  timerEl.textContent = "0";
  secondsPassed = 0;
  gameOver = false;
  minesLeft = minesCount;
  minesLeftEl.textContent = minesLeft;

  // Limpa o DOM
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  boardEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  // Cria a estrutura do tabuleiro (matriz de objetos)
  board = [];
  for (let r = 0; r < rows; r++) {
    let row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        r,
        c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        minesAround: 0
      });
    }
    board.push(row);
  }

  // Coloca minas aleatórias
  placeMines();

  // Calcula minas adjacentes
  calculateMinesAround();

  // Renderiza
  renderBoard();
}

// Coloca minas aleatoriamente
function placeMines() {
  let minesPlaced = 0;
  while (minesPlaced < minesCount) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * cols);
    if (!board[r][c].isMine) {
      board[r][c].isMine = true;
      minesPlaced++;
    }
  }
}

// Calcula quantas minas há em volta de cada célula
function calculateMinesAround() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].isMine) {
        let mineCount = 0;
        for (let rr = -1; rr <= 1; rr++) {
          for (let cc = -1; cc <= 1; cc++) {
            if (isValidCell(r + rr, c + cc)) {
              if (board[r + rr][c + cc].isMine) {
                mineCount++;
              }
            }
          }
        }
        board[r][c].minesAround = mineCount;
      }
    }
  }
}

// Verifica se célula está dentro dos limites
function isValidCell(r, c) {
  return r >= 0 && r < rows && c >= 0 && c < cols;
}

// Renderiza o tabuleiro
function renderBoard() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellData = board[r][c];
      
      const cellEl = document.createElement('div');
      cellEl.classList.add('cell');
      cellEl.setAttribute('data-row', r);
      cellEl.setAttribute('data-col', c);

      // Clique esquerdo
      cellEl.addEventListener('click', () => {
        if (gameOver) return;
        // Inicia o timer no primeiro clique
        if (secondsPassed === 0 && !timerInterval) {
          startTimer();
        }
        revealCell(r, c);
      });

      // Clique direito (bandeira)
      cellEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (gameOver) return;
        // Inicia o timer no primeiro clique
        if (secondsPassed === 0 && !timerInterval) {
          startTimer();
        }
        toggleFlag(r, c);
      });

      boardEl.appendChild(cellEl);
    }
  }
}

// Inicia o cronômetro
function startTimer() {
  timerInterval = setInterval(() => {
    secondsPassed++;
    timerEl.textContent = secondsPassed;
  }, 1000);
}

// Revela célula
function revealCell(r, c) {
  const cell = board[r][c];
  if (cell.isFlagged || cell.isRevealed) return;
  
  cell.isRevealed = true;
  const cellEl = getCellElement(r, c);
  cellEl.classList.add('revealed');

  // Se for mina, game over
  if (cell.isMine) {
    cellEl.classList.add('mine');
    gameOver = true;
    showAllMines();
    clearInterval(timerInterval);
    alert("💥 BOOM! Você perdeu!");
    return;
  }

  // Se há minas ao redor, mostra o número
  if (cell.minesAround > 0) {
    cellEl.textContent = cell.minesAround;
    cellEl.classList.add(`num${cell.minesAround}`);
  } else {
    // Se não há minas ao redor, revela adjacentes
    revealAdjacent(r, c);
  }

  checkWinCondition();
}

// Mostra todas as minas no final
function showAllMines() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (cell.isMine) {
        const cellEl = getCellElement(r, c);
        cellEl.classList.add('mine', 'revealed');
      }
    }
  }
}

// Revela as células adjacentes (se não houver minas ao redor)
function revealAdjacent(r, c) {
  for (let rr = -1; rr <= 1; rr++) {
    for (let cc = -1; cc <= 1; cc++) {
      if (rr === 0 && cc === 0) continue;
      const newR = r + rr;
      const newC = c + cc;
      if (isValidCell(newR, newC)) {
        const neighbor = board[newR][newC];
        if (!neighbor.isRevealed && !neighbor.isMine && !neighbor.isFlagged) {
          revealCell(newR, newC);
        }
      }
    }
  }
}

// Alterna bandeira
function toggleFlag(r, c) {
  const cell = board[r][c];
  if (cell.isRevealed) return;
  
  cell.isFlagged = !cell.isFlagged;
  const cellEl = getCellElement(r, c);

  if (cell.isFlagged) {
    cellEl.classList.add('flag');
    minesLeft--;
  } else {
    cellEl.classList.remove('flag');
    minesLeft++;
  }

  minesLeftEl.textContent = minesLeft;
  checkWinCondition();
}

// Verifica condição de vitória
function checkWinCondition() {
  let revealedCount = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isRevealed) {
        revealedCount++;
      }
    }
  }
  // Se todas as células não-minadas foram reveladas
  if (revealedCount === (rows * cols - minesCount)) {
    gameOver = true;
    clearInterval(timerInterval);
    alert("🎉 Parabéns, você venceu!");
    showAllMines(); // mostra onde as minas estavam
  }
}

// Retorna o elemento de uma célula
function getCellElement(r, c) {
  return document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
}

/*
  ------------------------------------------------------
  MUDANÇA DE TEMA (CLARO/ESCURO) E COR DE ACENTUAÇÃO
  ------------------------------------------------------
*/
function changeTheme(themeValue) {
  document.body.classList.remove('theme-light', 'theme-dark');
  document.body.classList.add(`theme-${themeValue}`);
}

function changeAccentColor(colorValue) {
  document.body.classList.remove('accent-blue', 'accent-green', 'accent-pink');
  document.body.classList.add(`accent-${colorValue}`);
}
