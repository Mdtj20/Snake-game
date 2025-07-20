const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let snake = [{ x: 400, y: 400 }];
let direction = "RIGHT";
let nextDirection = "RIGHT";
let food = [];
let obstacles = [];
let score = 0;
let gameOver = false;
let speed = 200;
let isPaused = false;
let obstacleIncreaseThreshold = 10;

let highScores = JSON.parse(localStorage.getItem("highScores")) || [];

const foodTypes = [
  { color: "red", score: 1, effect: "normal" },
  { color: "blue", score: 3, effect: "speedUp" },
  { color: "yellow", score: 2, effect: "slowDown" }
];

function setDifficulty(selectedSpeed) {
  speed = selectedSpeed;
  document.getElementById("difficulty").style.display = "none";
  document.getElementById("restartBtn").style.display = "inline-block";
  resetGame();
  generateFood();
  generateObstacles(10);
  gameLoop();
}

function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 20, 20);
}

function generateFood() {
  food = [];
  while (food.length < 3) {
    const type = foodTypes[Math.floor(Math.random() * foodTypes.length)];
    let newFood = {
      x: Math.floor(Math.random() * 40) * 20,
      y: Math.floor(Math.random() * 40) * 20,
      ...type
    };
    if (
      !obstacles.some(ob => ob.x === newFood.x && ob.y === newFood.y) &&
      !food.some(f => f.x === newFood.x && f.y === newFood.y) &&
      !snake.some(s => s.x === newFood.x && s.y === newFood.y)
    ) {
      food.push(newFood);
    }
  }
}

function generateObstacles(count = 1) {
  for (let i = 0; i < count; i++) {
    let newOb;
    do {
      newOb = {
        x: Math.floor(Math.random() * 40) * 20,
        y: Math.floor(Math.random() * 40) * 20
      };
    } while (
      obstacles.some(ob => ob.x === newOb.x && ob.y === newOb.y) ||
      food.some(f => f.x === newOb.x && f.y === newOb.y) ||
      snake.some(s => s.x === newOb.x && s.y === newOb.y)
    );
    obstacles.push(newOb);
  }
}

function updateSnake() {
  direction = nextDirection;
  const head = { ...snake[0] };

  switch (direction) {
    case "UP": head.y -= 20; break;
    case "DOWN": head.y += 20; break;
    case "LEFT": head.x -= 20; break;
    case "RIGHT": head.x += 20; break;
  }

  head.x = (head.x + canvas.width) % canvas.width;
  head.y = (head.y + canvas.height) % canvas.height;

  if (
    snake.some(segment => segment.x === head.x && segment.y === head.y) ||
    obstacles.some(ob => ob.x === head.x && ob.y === head.y)
  ) {
    endGame();
    return;
  }

  const eatenFood = food.find(f => f.x === head.x && f.y === head.y);
  if (eatenFood) {
    score += eatenFood.score;
    if (eatenFood.effect === "speedUp" && speed > 50) speed -= 10;
    if (eatenFood.effect === "slowDown") speed += 10;
    food.splice(food.indexOf(eatenFood), 1);
    generateFood();

    if (score >= obstacleIncreaseThreshold) {
      generateObstacles(1);
      obstacleIncreaseThreshold += 10;
    }
  } else {
    snake.pop();
  }

  snake.unshift(head);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  snake.forEach(segment => drawBlock(segment.x, segment.y, "green"));
  food.forEach(f => drawBlock(f.x, f.y, f.color));
  obstacles.forEach(ob => drawBlock(ob.x, ob.y, "gray"));

  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`得分: ${score}`, 10, 30);
}

function gameLoop() {
  if (gameOver) return;
  if (!isPaused) {
    updateSnake();
    render();
  }
  setTimeout(gameLoop, speed);
}

function endGame() {
  gameOver = true;
  alert(`游戏结束！得分: ${score}`);
  updateHighScores(score);
  displayHighScores();
}

function restartGame() {
  resetGame();
  generateFood();
  generateObstacles(10);
  gameLoop();
}

function resetGame() {
  snake = [{ x: 400, y: 400 }];
  direction = "RIGHT";
  nextDirection = "RIGHT";
  score = 0;
  food = [];
  obstacles = [];
  isPaused = false;
  gameOver = false;
  obstacleIncreaseThreshold = 10;
}

function updateHighScores(newScore) {
  highScores.push(newScore);
  highScores.sort((a, b) => b - a);
  highScores = highScores.slice(0, 5);
  localStorage.setItem("highScores", JSON.stringify(highScores));
}

function displayHighScores() {
  const list = document.getElementById("scoreList");
  list.innerHTML = "";
  highScores.forEach(score => {
    const li = document.createElement("li");
    li.textContent = score;
    list.appendChild(li);
  });
}

document.addEventListener("keydown", e => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
    e.preventDefault();
  }

  if (e.key === "ArrowUp" && direction !== "DOWN") nextDirection = "UP";
  if (e.key === "ArrowDown" && direction !== "UP") nextDirection = "DOWN";
  if (e.key === "ArrowLeft" && direction !== "RIGHT") nextDirection = "LEFT";
  if (e.key === "ArrowRight" && direction !== "LEFT") nextDirection = "RIGHT";
  if (e.key === " ") isPaused = !isPaused;
});

const modeBtn = document.getElementById("toggleModeBtn");

function setMode(mode) {
  document.body.classList.remove("light-mode", "dark-mode");
  document.body.classList.add(`${mode}-mode`);
  if (modeBtn) {
    modeBtn.textContent = mode === "dark" ? "切换白天模式" : "切换夜间模式";
  }
}

if (modeBtn) {
  modeBtn.addEventListener("click", () => {
    const current = document.body.classList.contains("dark-mode") ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    setMode(next);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setMode(prefersDark ? "dark" : "light");
  displayHighScores();
});
