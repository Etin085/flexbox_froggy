const PROPS = {
  "flex-direction": ["row", "row-reverse", "column", "column-reverse"],
  "justify-content": [
    "flex-start",
    "center",
    "flex-end",
    "space-between",
    "space-around",
    "space-evenly",
  ],
  "align-items": ["flex-start", "center", "flex-end", "stretch"],
  "flex-wrap": ["nowrap", "wrap", "wrap-reverse"],
  gap: ["0px", "8px", "16px", "24px"],
};
const ICONS = {
  "flex-direction": "↔️",
  "justify-content": "⬅️➡️",
  "align-items": "⬆️⬇️",
  "flex-wrap": "🔁",
  gap: "↔️📏",
};

// Harder levels: multiple combined properties, tighter concepts, some with 6+ frogs needing wrap.
const LEVELS = [
  {
    frogs: 4,
    correct: { "justify-content": "space-evenly", "align-items": "center" },
    hint: "Give every gap — including the outer edges — the exact same width, and center vertically.",
    time: 25,
  },
  {
    frogs: 3,
    correct: { "flex-direction": "column-reverse", "align-items": "flex-end" },
    hint: "Stack the frogs bottom-to-top, pushed to the right side.",
    time: 25,
  },
  {
    frogs: 6,
    correct: { "flex-wrap": "wrap", "justify-content": "center" },
    hint: "6 frogs won't fit in one row — let them wrap onto a new line, and center each line.",
    time: 30,
  },
  {
    frogs: 4,
    correct: {
      "flex-direction": "row-reverse",
      "justify-content": "space-between",
    },
    hint: "Reverse the row order AND push the end frogs flush to the edges.",
    time: 25,
  },
  {
    frogs: 5,
    correct: { gap: "24px", "justify-content": "center" },
    hint: "Add a generous 24px gap between every frog and center the whole group.",
    time: 25,
  },
  {
    frogs: 6,
    correct: { "flex-wrap": "wrap-reverse", "align-items": "center" },
    hint: "Wrap onto multiple lines, but reverse which line comes first — and center each frog on its line.",
    time: 30,
  },
  {
    frogs: 4,
    correct: {
      "flex-direction": "column",
      "justify-content": "space-around",
      "align-items": "center",
    },
    hint: "Stack into a column, space the rows evenly (equal space around each), and center them side to side.",
    time: 35,
  },
];

let current = 0,
  chosen = {},
  score = 0,
  lives = 3,
  timeLeft = 0,
  timerId = null,
  hintUsed = false;

const pond = document.getElementById("pond");
const controls = document.getElementById("controls");
const goalText = document.getElementById("goalText");
const msg = document.getElementById("msg");
const dotsEl = document.getElementById("dots");
const heartsEl = document.getElementById("hearts");
const scoreEl = document.getElementById("score");
const timerBar = document.getElementById("timerBar");

function buildDots() {
  dotsEl.innerHTML = "";
  LEVELS.forEach(() => {
    const d = document.createElement("div");
    d.className = "dot";
    dotsEl.appendChild(d);
  });
}
function updateDots() {
  [...dotsEl.children].forEach((d, i) => {
    d.classList.toggle("done", i < current);
    d.classList.toggle("active", i === current);
  });
}
function updateHearts() {
  heartsEl.textContent = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
}

function buildControls(level) {
  controls.innerHTML = "";
  Object.keys(level.correct).forEach((prop) => {
    const wrap = document.createElement("div");
    wrap.className = "ctrl";
    const label = document.createElement("label");
    label.innerHTML = `<span>${ICONS[prop] || "⚙️"}</span> ${prop}`;
    wrap.appendChild(label);
    const opts = document.createElement("div");
    opts.className = "opts";
    PROPS[prop].forEach((val) => {
      const b = document.createElement("button");
      b.textContent = val;
      b.addEventListener("click", () => {
        chosen[prop] = val;
        [...opts.children].forEach((c) => c.classList.remove("active"));
        b.classList.add("active");
        render(level);
      });
      opts.appendChild(b);
    });
    wrap.appendChild(opts);
    controls.appendChild(wrap);
  });
}

function render(level) {
  pond.style.flexDirection = chosen["flex-direction"] || "row";
  pond.style.justifyContent = chosen["justify-content"] || "flex-start";
  pond.style.alignItems = chosen["align-items"] || "flex-start";
  pond.style.flexWrap = chosen["flex-wrap"] || "nowrap";
  pond.style.gap = chosen["gap"] || "0px";
  [...pond.querySelectorAll(".frog")].forEach((e) => e.remove());
  for (let i = 0; i < level.frogs; i++) {
    const f = document.createElement("div");
    f.className = "frog";
    f.textContent = "🐸";
    pond.appendChild(f);
  }
}

function startTimer(level) {
  clearInterval(timerId);
  timeLeft = level.time;
  timerBar.style.width = "100%";
  timerBar.style.background = "linear-gradient(90deg,var(--green),var(--pink))";
  timerId = setInterval(() => {
    timeLeft -= 0.1;
    const pct = Math.max(0, (timeLeft / level.time) * 100);
    timerBar.style.width = pct + "%";
    if (pct < 25) timerBar.style.background = "var(--red)";
    if (timeLeft <= 0) {
      clearInterval(timerId);
      handleFail("⏰ Time's up!");
    }
  }, 100);
}

function loadLevel(i) {
  chosen = {};
  hintUsed = false;
  msg.textContent = "";
  const level = LEVELS[i];
  goalText.textContent = level.hint;
  buildControls(level);
  render(level);
  updateDots();
  updateHearts();
  startTimer(level);
}

function confettiBurst() {
  const emojis = ["🎉", "🐸", "⭐", "💚", "🌟"];
  for (let i = 0; i < 16; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    c.style.left = Math.random() * 100 + "vw";
    c.style.animationDuration = 1.6 + Math.random() * 1.2 + "s";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3000);
  }
}

function handleFail(reason) {
  lives--;
  updateHearts();
  msg.style.color = "#c62828";
  msg.textContent = reason + " Try again!";
  if (lives <= 0) {
    endGame(false);
  } else {
    loadLevel(current);
  }
}

function endGame(won) {
  clearInterval(timerId);
  document.getElementById("overlayIcon").textContent = won
    ? "🏆🐸🏆"
    : "💧😢💧";
  document.getElementById("overlayTitle").textContent = won
    ? "Flexbox Champion!"
    : "Out of Lives!";
  document.getElementById("overlayMsg").textContent = won
    ? `Final score: ${score}`
    : `You scored ${score}. Give it another hop!`;
  document.getElementById("overlay").classList.add("show");
}

document.getElementById("checkBtn").addEventListener("click", () => {
  const level = LEVELS[current];
  const allChosen = Object.keys(level.correct).every(
    (k) => chosen[k] !== undefined,
  );
  if (!allChosen) {
    msg.style.color = "#ef6c00";
    msg.textContent = "Pick a value for every property first!";
    return;
  }
  const correct = Object.entries(level.correct).every(
    ([k, v]) => chosen[k] === v,
  );
  if (correct) {
    clearInterval(timerId);
    const bonus = Math.max(0, Math.round(timeLeft * 2));
    score += 20 + bonus - (hintUsed ? 5 : 0);
    scoreEl.textContent = score;
    msg.style.color = "#2e7d32";
    msg.textContent = `🎉 +${20 + bonus - (hintUsed ? 5 : 0)} points! Next pond...`;
    confettiBurst();
    setTimeout(() => {
      current++;
      if (current >= LEVELS.length) {
        endGame(true);
      } else loadLevel(current);
    }, 900);
  } else {
    handleFail("❌ Not quite right.");
  }
});

document.getElementById("hintBtn").addEventListener("click", () => {
  msg.style.color = "#ef6c00";
  msg.textContent =
    "you really thought you will get a hint after teaching you in class? lol";
});

document
  .getElementById("resetBtn")
  .addEventListener("click", () => loadLevel(current));
document.getElementById("playAgain").addEventListener("click", () => {
  document.getElementById("overlay").classList.remove("show");
  current = 0;
  score = 0;
  lives = 3;
  scoreEl.textContent = score;
  loadLevel(0);
});

buildDots();
loadLevel(0);
