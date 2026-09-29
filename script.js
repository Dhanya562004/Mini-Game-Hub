/* ==========================================================================
   MINI GAME HUB - CORE ENGINE & GAME LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Systems
  AudioEngine.init();
  ConfettiEngine.init();
  StorageSystem.init();
  Navigation.init();

  // Initialize Game Engines
  TicTacToe.init();
  MemoryGame.init();
  ColorGame.init();
});

/* ==========================================================================
   1. LOCAL STORAGE & STATS SYSTEM
   ========================================================================== */

const StorageSystem = {
  stats: {
    totalPlayed: 0,
    tttWinsX: 0,
    tttWinsO: 0,
    tttDraws: 0,
    memoryBestTime: null, // in seconds
    memoryBestMoves: null,
    colorStreak: 0,
    colorHighStreak: 0,
    soundMuted: false
  },

  init() {
    const saved = localStorage.getItem('mini_game_hub_stats');
    if (saved) {
      try {
        this.stats = { ...this.stats, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse saved stats:', e);
      }
    }
    this.updateUI();
  },

  save() {
    localStorage.setItem('mini_game_hub_stats', JSON.stringify(this.stats));
    this.updateUI();
  },

  incrementPlayed() {
    this.stats.totalPlayed++;
    this.save();
  },

  updateUI() {
    const elTotal = document.getElementById('stat-total-played');
    const elTTT = document.getElementById('stat-ttt-wins');
    const elMem = document.getElementById('stat-mem-best');
    const elColor = document.getElementById('stat-color-streak');

    if (elTotal) elTotal.textContent = this.stats.totalPlayed;
    if (elTTT) elTTT.textContent = this.stats.tttWinsX;
    if (elMem) {
      elMem.textContent = this.stats.memoryBestTime !== null ? `${this.stats.memoryBestTime}s` : '--';
    }
    if (elColor) elColor.textContent = `${this.stats.colorHighStreak} 🔥`;
  }
};

/* ==========================================================================
   2. WEB AUDIO SYNTHESIZER
   ========================================================================== */

const AudioEngine = {
  ctx: null,
  isMuted: false,

  init() {
    this.isMuted = StorageSystem.stats.soundMuted;
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      this.updateBtnUI(soundBtn);
      soundBtn.addEventListener('click', () => {
        this.isMuted = !this.isMuted;
        StorageSystem.stats.soundMuted = this.isMuted;
        StorageSystem.save();
        this.updateBtnUI(soundBtn);
        if (!this.isMuted) this.playTone(523.25, 'sine', 0.1, 0.1);
      });
    }
  },

  updateBtnUI(btn) {
    btn.innerHTML = this.isMuted ? '🔇' : '🔊';
    btn.classList.toggle('active', !this.isMuted);
  },

  getAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  },

  playTone(freq, type = 'sine', duration = 0.15, vol = 0.15) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context might be blocked prior to user gesture
    }
  },

  playClick() {
    this.playTone(400, 'sine', 0.08, 0.1);
  },

  playFlip() {
    this.playTone(300, 'triangle', 0.12, 0.15);
  },

  playMatch() {
    if (this.isMuted) return;
    const now = performance.now();
    setTimeout(() => this.playTone(523.25, 'sine', 0.1, 0.15), 0);
    setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.15), 100);
    setTimeout(() => this.playTone(783.99, 'sine', 0.2, 0.2), 200);
  },

  playWin() {
    if (this.isMuted) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.2, 0.2), idx * 120);
    });
  },

  playWrong() {
    if (this.isMuted) return;
    this.playTone(220, 'sawtooth', 0.2, 0.15);
  }
};

/* ==========================================================================
   3. CONFETTI ENGINE
   ========================================================================== */

const ConfettiEngine = {
  canvas: null,
  ctx: null,
  particles: [],
  animId: null,

  init() {
    this.canvas = document.getElementById('confetti-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  launch() {
    if (!this.canvas || !this.ctx) return;
    this.particles = [];
    const colors = ['#00f2fe', '#ff0844', '#b224ef', '#00b09b', '#f6d365', '#ffffff'];

    for (let i = 0; i < 100; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2 + 50,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.8) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    if (this.animId) cancelAnimationFrame(this.animId);
    this.animate();
  },

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let activeCount = 0;
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rotation += p.rSpeed;
      p.opacity -= 0.008;

      if (p.opacity > 0) {
        activeCount++;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        this.ctx.restore();
      }
    });

    if (activeCount > 0) {
      this.animId = requestAnimationFrame(() => this.animate());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
};

/* ==========================================================================
   4. NAVIGATION CONTROLLER
   ========================================================================== */

const Navigation = {
  currentView: 'home',

  init() {
    // Nav buttons
    document.querySelectorAll('[data-target-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = btn.getAttribute('data-target-view');
        this.switchView(target);
      });
    });

    // Modal close
    const modalCloseBtn = document.getElementById('modal-close-btn');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        document.getElementById('game-modal').classList.remove('active');
      });
    }
  },

  switchView(viewId) {
    AudioEngine.playClick();
    this.currentView = viewId;

    // Update nav bar active state
    document.querySelectorAll('.nav-btn').forEach(btn => {
      const target = btn.getAttribute('data-target-view');
      btn.classList.toggle('active', target === viewId);
    });

    // Hide all view sections, show target
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const targetSection = document.getElementById(`view-${viewId}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  showModal(title, desc, icon = '🎉') {
    const modal = document.getElementById('game-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalIcon = document.getElementById('modal-icon');

    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    if (modalIcon) modalIcon.textContent = icon;

    if (modal) modal.classList.add('active');
  }
};

/* ==========================================================================
   5. GAME 1: TIC TAC TOE
   ========================================================================== */

const TicTacToe = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  isGameActive: true,
  gameMode: 'pvp', // 'pvp', 'ai-easy', 'ai-minimax'
  scores: { X: 0, O: 0, draws: 0 },

  winningCombos: [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ],

  init() {
    this.bindEvents();
    this.resetBoard();
  },

  bindEvents() {
    const cells = document.querySelectorAll('.ttt-cell');
    cells.forEach(cell => {
      cell.addEventListener('click', () => {
        const index = parseInt(cell.getAttribute('data-index'), 10);
        this.handleCellClick(index);
      });
    });

    const restartBtn = document.getElementById('ttt-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        AudioEngine.playClick();
        this.resetBoard();
      });
    }

    const resetScoreBtn = document.getElementById('ttt-reset-score-btn');
    if (resetScoreBtn) {
      resetScoreBtn.addEventListener('click', () => {
        AudioEngine.playClick();
        this.scores = { X: 0, O: 0, draws: 0 };
        this.updateScoreUI();
        this.resetBoard();
      });
    }

    // Mode selectors
    document.querySelectorAll('[data-ttt-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioEngine.playClick();
        document.querySelectorAll('[data-ttt-mode]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.gameMode = btn.getAttribute('data-ttt-mode');
        this.resetBoard();
      });
    });
  },

  handleCellClick(index) {
    if (!this.isGameActive || this.board[index] !== null) return;

    this.makeMove(index, this.currentPlayer);

    if (this.isGameActive && this.currentPlayer === 'O' && this.gameMode.startsWith('ai')) {
      setTimeout(() => this.makeAIMove(), 400);
    }
  },

  makeMove(index, player) {
    this.board[index] = player;
    AudioEngine.playTone(player === 'X' ? 440 : 587.33, 'sine', 0.1, 0.15);

    const cell = document.querySelector(`.ttt-cell[data-index="${index}"]`);
    if (cell) {
      cell.textContent = player;
      cell.classList.add('taken', player === 'X' ? 'x-mark' : 'o-mark');
    }

    const winnerInfo = this.checkWinner();

    if (winnerInfo) {
      this.isGameActive = false;
      this.highlightWinner(winnerInfo.combo);
      this.scores[player]++;
      if (player === 'X') StorageSystem.stats.tttWinsX++;
      else StorageSystem.stats.tttWinsO++;
      StorageSystem.incrementPlayed();
      this.updateScoreUI();

      AudioEngine.playWin();
      ConfettiEngine.launch();
      this.updateStatus(`Player ${player} Wins! 🎉`);
      Navigation.showModal(`Player ${player} Victory!`, `Awesome strategy! Player ${player} took the match.`, '🏆');
    } else if (this.board.every(cell => cell !== null)) {
      this.isGameActive = false;
      this.scores.draws++;
      StorageSystem.stats.tttDraws++;
      StorageSystem.incrementPlayed();
      this.updateScoreUI();
      this.updateStatus("It's a Draw! 🤝");
      AudioEngine.playWrong();
    } else {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      this.updateStatus(`Player ${this.currentPlayer}'s Turn`);
    }
  },

  makeAIMove() {
    if (!this.isGameActive) return;

    let move;
    if (this.gameMode === 'ai-easy') {
      const emptyIndices = this.board.map((v, i) => v === null ? i : null).filter(v => v !== null);
      move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    } else {
      // Unbeatable Minimax
      move = this.getBestMinimaxMove();
    }

    if (move !== undefined && move !== null) {
      this.makeMove(move, 'O');
    }
  },

  getBestMinimaxMove() {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
      if (this.board[i] === null) {
        this.board[i] = 'O';
        let score = this.minimax(this.board, 0, false);
        this.board[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  },

  minimax(board, depth, isMaximizing) {
    const winnerInfo = this.checkWinner();
    if (winnerInfo) {
      return winnerInfo.winner === 'O' ? 10 - depth : depth - 10;
    }
    if (board.every(cell => cell !== null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          let score = this.minimax(board, depth + 1, false);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          let score = this.minimax(board, depth + 1, true);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  },

  checkWinner() {
    for (let combo of this.winningCombos) {
      const [a, b, c] = combo;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return { winner: this.board[a], combo };
      }
    }
    return null;
  },

  highlightWinner(combo) {
    combo.forEach(idx => {
      const cell = document.querySelector(`.ttt-cell[data-index="${idx}"]`);
      if (cell) cell.classList.add('winning-cell');
    });
  },

  resetBoard() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.isGameActive = true;

    const cells = document.querySelectorAll('.ttt-cell');
    cells.forEach(cell => {
      cell.textContent = '';
      cell.className = 'ttt-cell';
    });

    this.updateStatus("Player X's Turn");
  },

  updateStatus(msg) {
    const statusEl = document.getElementById('ttt-status');
    if (statusEl) statusEl.textContent = msg;
  },

  updateScoreUI() {
    const elX = document.getElementById('score-ttt-x');
    const elO = document.getElementById('score-ttt-o');
    const elDraw = document.getElementById('score-ttt-draw');

    if (elX) elX.textContent = this.scores.X;
    if (elO) elO.textContent = this.scores.O;
    if (elDraw) elDraw.textContent = this.scores.draws;
  }
};

/* ==========================================================================
   6. GAME 2: MEMORY CARD GAME
   ========================================================================== */

const MemoryGame = {
  difficulty: 'easy', // 'easy' (6 pairs), 'medium' (8 pairs), 'hard' (12 pairs)
  theme: 'gaming',
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  totalPairs: 6,
  moves: 0,
  timer: 0,
  timerInterval: null,
  isTimerRunning: false,
  isProcessing: false,

  cardSets: {
    gaming: ['👾', '🎮', '🕹️', '🎯', '🎲', '🎰', '🚀', '🛸', '💎', '⚔️', '🛡️', '👑'],
    emojis: ['🦄', '🦊', '🦁', '🐯', '🐼', '🐨', '🐙', '🦋', '🐬', '🦩', '🦚', '🐉'],
    food: ['🍕', '🍔', '🍟', '🍩', '🍦', '🍓', '🍣', '🌮', '🥨', '🍿', '🍇', '🥑']
  },

  init() {
    this.bindEvents();
    this.startNewGame();
  },

  bindEvents() {
    const resetBtn = document.getElementById('memory-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        AudioEngine.playClick();
        this.startNewGame();
      });
    }

    // Difficulty buttons
    document.querySelectorAll('[data-mem-diff]').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioEngine.playClick();
        document.querySelectorAll('[data-mem-diff]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.difficulty = btn.getAttribute('data-mem-diff');
        this.startNewGame();
      });
    });

    // Theme selector
    const themeSelect = document.getElementById('memory-theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        this.theme = e.target.value;
        this.startNewGame();
      });
    }
  },

  startNewGame() {
    this.stopTimer();
    this.timer = 0;
    this.moves = 0;
    this.matchedPairs = 0;
    this.flippedCards = [];
    this.isProcessing = false;
    this.isTimerRunning = false;

    this.updateStatsUI();

    // Determine grid size based on difficulty
    const iconList = this.cardSets[this.theme] || this.cardSets.gaming;
    if (this.difficulty === 'easy') this.totalPairs = 6;
    else if (this.difficulty === 'medium') this.totalPairs = 8;
    else if (this.difficulty === 'hard') this.totalPairs = 12;

    const selectedIcons = iconList.slice(0, this.totalPairs);
    const cardDeck = [...selectedIcons, ...selectedIcons];
    
    // Fisher-Yates Shuffle
    for (let i = cardDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardDeck[i], cardDeck[j]] = [cardDeck[j], cardDeck[i]];
    }

    this.renderGrid(cardDeck);
  },

  renderGrid(deck) {
    const grid = document.getElementById('memory-grid');
    if (!grid) return;

    grid.className = `memory-grid ${this.difficulty}`;
    grid.innerHTML = '';

    deck.forEach((icon, index) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.setAttribute('data-index', index);
      card.setAttribute('data-icon', icon);

      card.innerHTML = `
        <div class="card-face card-front">❓</div>
        <div class="card-face card-back">${icon}</div>
      `;

      card.addEventListener('click', () => this.handleCardClick(card));
      grid.appendChild(card);
    });
  },

  handleCardClick(card) {
    if (
      this.isProcessing ||
      card.classList.contains('flipped') ||
      card.classList.contains('matched') ||
      this.flippedCards.length >= 2
    ) {
      return;
    }

    if (!this.isTimerRunning) {
      this.startTimer();
    }

    card.classList.add('flipped');
    AudioEngine.playFlip();
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.moves++;
      this.updateStatsUI();
      this.checkMatch();
    }
  },

  checkMatch() {
    this.isProcessing = true;
    const [card1, card2] = this.flippedCards;
    const icon1 = card1.getAttribute('data-icon');
    const icon2 = card2.getAttribute('data-icon');

    if (icon1 === icon2) {
      // Match found
      setTimeout(() => {
        card1.classList.add('matched');
        card2.classList.add('matched');
        AudioEngine.playMatch();
        this.matchedPairs++;
        this.flippedCards = [];
        this.isProcessing = false;

        if (this.matchedPairs === this.totalPairs) {
          this.handleWin();
        }
      }, 400);
    } else {
      // No match
      setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        AudioEngine.playWrong();
        this.flippedCards = [];
        this.isProcessing = false;
      }, 900);
    }
  },

  handleWin() {
    this.stopTimer();
    StorageSystem.incrementPlayed();

    // Check Best Time
    if (
      StorageSystem.stats.memoryBestTime === null ||
      this.timer < StorageSystem.stats.memoryBestTime
    ) {
      StorageSystem.stats.memoryBestTime = this.timer;
      StorageSystem.stats.memoryBestMoves = this.moves;
      StorageSystem.save();
    }

    AudioEngine.playWin();
    ConfettiEngine.launch();

    const stars = this.moves <= this.totalPairs + 4 ? '⭐⭐⭐' : this.moves <= this.totalPairs + 8 ? '⭐⭐' : '⭐';
    Navigation.showModal(
      'Memory Master! 🎴',
      `You matched all ${this.totalPairs} pairs in ${this.moves} moves and ${this.timer} seconds! Rating: ${stars}`,
      '🌟'
    );
  },

  startTimer() {
    this.isTimerRunning = true;
    this.timerInterval = setInterval(() => {
      this.timer++;
      this.updateStatsUI();
    }, 1000);
  },

  stopTimer() {
    this.isTimerRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
  },

  updateStatsUI() {
    const movesEl = document.getElementById('memory-moves');
    const timerEl = document.getElementById('memory-timer');
    const pairsEl = document.getElementById('memory-pairs');

    if (movesEl) movesEl.textContent = this.moves;
    if (timerEl) {
      const mins = Math.floor(this.timer / 60).toString().padStart(2, '0');
      const secs = (this.timer % 60).toString().padStart(2, '0');
      timerEl.textContent = `${mins}:${secs}`;
    }
    if (pairsEl) pairsEl.textContent = `${this.matchedPairs}/${this.totalPairs}`;
  }
};

/* ==========================================================================
   7. GAME 3: COLOR GUESSING GAME (RGB MASTER)
   ========================================================================== */

const ColorGame = {
  mode: 'easy', // 'easy' (3 choices), 'hard' (6 choices)
  targetRGB: { r: 0, g: 0, b: 0 },
  colors: [],
  streak: 0,

  init() {
    this.bindEvents();
    this.resetGame();
  },

  bindEvents() {
    const resetBtn = document.getElementById('color-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        AudioEngine.playClick();
        this.resetGame();
      });
    }

    // Mode selection
    document.querySelectorAll('[data-color-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioEngine.playClick();
        document.querySelectorAll('[data-color-mode]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.mode = btn.getAttribute('data-color-mode');
        this.resetGame();
      });
    });
  },

  resetGame() {
    const count = this.mode === 'easy' ? 3 : 6;
    this.colors = [];

    // Target RGB
    this.targetRGB = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256)
    };

    const targetColorStr = `rgb(${this.targetRGB.r}, ${this.targetRGB.g}, ${this.targetRGB.b})`;
    this.colors.push(targetColorStr);

    // Generate distractor colors
    for (let i = 1; i < count; i++) {
      const r = Math.min(255, Math.max(0, this.targetRGB.r + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 70) + 30)));
      const g = Math.min(255, Math.max(0, this.targetRGB.g + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 70) + 30)));
      const b = Math.min(255, Math.max(0, this.targetRGB.b + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 70) + 30)));
      this.colors.push(`rgb(${r}, ${g}, ${b})`);
    }

    // Shuffle colors
    for (let i = this.colors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.colors[i], this.colors[j]] = [this.colors[j], this.colors[i]];
    }

    this.renderUI(targetColorStr);
  },

  renderUI(targetStr) {
    const displayEl = document.getElementById('color-target-display');
    const msgEl = document.getElementById('color-feedback');
    const grid = document.getElementById('color-grid');

    if (displayEl) displayEl.textContent = targetStr.toUpperCase();
    if (msgEl) {
      msgEl.textContent = 'Select the matching color shade!';
      msgEl.className = 'color-feedback-msg';
    }

    if (!grid) return;
    grid.className = `color-grid ${this.mode}`;
    grid.innerHTML = '';

    this.colors.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor = color;
      swatch.setAttribute('data-color', color);

      swatch.addEventListener('click', () => this.handleSwatchClick(swatch, color, targetStr));
      grid.appendChild(swatch);
    });

    this.updateStreakUI();
  },

  handleSwatchClick(swatch, clickedColor, targetColor) {
    const msgEl = document.getElementById('color-feedback');

    if (clickedColor === targetColor) {
      // Correct Guess
      AudioEngine.playMatch();
      ConfettiEngine.launch();
      this.streak++;
      StorageSystem.incrementPlayed();

      if (this.streak > StorageSystem.stats.colorHighStreak) {
        StorageSystem.stats.colorHighStreak = this.streak;
      }
      StorageSystem.stats.colorStreak = this.streak;
      StorageSystem.save();

      if (msgEl) {
        msgEl.textContent = 'Correct Color! 🎉 Streak +1';
        msgEl.className = 'color-feedback-msg correct';
      }

      // Turn all swatches to target color
      document.querySelectorAll('.color-swatch').forEach(s => {
        s.style.backgroundColor = targetColor;
        s.classList.remove('hidden-swatch');
      });

      this.updateStreakUI();

      setTimeout(() => this.resetGame(), 1200);
    } else {
      // Wrong Guess
      AudioEngine.playWrong();
      swatch.classList.add('hidden-swatch');
      this.streak = 0;
      StorageSystem.stats.colorStreak = 0;
      StorageSystem.save();

      if (msgEl) {
        msgEl.textContent = 'Try Again! ❌';
        msgEl.className = 'color-feedback-msg wrong';
      }

      this.updateStreakUI();
    }
  },

  updateStreakUI() {
    const streakEl = document.getElementById('color-curr-streak');
    const highEl = document.getElementById('color-high-streak');

    if (streakEl) streakEl.textContent = this.streak;
    if (highEl) highEl.textContent = StorageSystem.stats.colorHighStreak;
  }
};
