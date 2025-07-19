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
let intervalId;
let highScores = JSON.parse(localStorage.getItem("highScores")) || [];

const foodTypes = [
    { color: "red", score: 1, effect: "normal" },
    { color: "blue", score: 3, effect: "speedUp" },
    { color: "yellow", score: 2, effect: "slowDown" }
];

const eatSound = new Audio("eat.mp3");
const crashSound = new Audio("crash.mp3");
const gameOverSound = new Audio("gameover.mp3");

eatSound.onerror = crashSound.onerror = gameOverSound.onerror = () => console.warn("音效加载失败");

function setDifficulty(selectedSpeed) {
    speed = selectedSpeed;
    document.getElementById("difficulty").style.display = "none";
    generateFood();
    generateObstacles();
    startGameLoop();
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
        if (!obstacles.some(ob => ob.x === newFood.x && ob.y === newFood.y) &&
            !food.some(f => f.x === newFood.x && f.y === newFood.y) &&
            !snake.some(s => s.x === newFood.x && s.y === newFood.y)) {
            food.push(newFood);
        }
    }
}

function generateObstacles(count = 10) {
    while (obstacles.length < count) {
        let newOb = {
            x: Math.floor(Math.random() * 40) * 20,
            y: Math.floor(Math.random() * 40) * 20
        };
        if (!food.some(f => f.x === newOb.x && f.y === newOb.y) &&
            !obstacles.some(ob => ob.x === newOb.x && ob.y === newOb.y) &&
            !snake.some(s => s.x === newOb.x && s.y === newOb.y)) {
            obstacles.push(newOb);
        }
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

    if (snake.some(segment => segment.x === head.x && segment.y === head.y) ||
        obstacles.some(ob => ob.x === head.x && ob.y === head.y)) {
        if (gameOverSound.readyState >= 2) gameOverSound.play();
        endGame();
        return;
    }

    const eatenFood = food.find(f => f.x === head.x && f.y === head.y);
    if (eatenFood) {
        if (eatSound.readyState >= 2) eatSound.play();
        score += eatenFood.score;

        if (score % 10 === 0) {
            generateObstacles(obstacles.length + 1);
        }

        if (eatenFood.effect === "speedUp" && speed > 50) {
            speed -= 10;
            restartGameLoop();
        }
        if (eatenFood.effect === "slowDown") {
            speed += 10;
            restartGameLoop();
        }

        food.splice(food.indexOf(eatenFood), 1);
        generateFood();
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
}

function startGameLoop() {
    clearInterval(intervalId);
    intervalId = setInterval(gameLoop, speed);
}

function restartGameLoop() {
    clearInterval(intervalId);
    intervalId = setInterval(gameLoop, speed);
}

function endGame() {
    gameOver = true;
    clearInterval(intervalId);
    alert(`游戏结束！得分: ${score}`);
    updateHighScores(score);
    displayHighScores();
}

function updateHighScores(score) {
    highScores.push(score);
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 5);
    localStorage.setItem("highScores", JSON.stringify(highScores));
}

function displayHighScores() {
    const hsElement = document.getElementById("highScores");
    if (!hsElement) return;
    hsElement.innerHTML = "<h3>高分榜</h3>" +
        highScores.map((s, i) => `<div>#${i + 1}: ${s}</div>`).join("");
}

document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && direction !== "DOWN") nextDirection = "UP";
    if (e.key === "ArrowDown" && direction !== "UP") nextDirection = "DOWN";
    if (e.key === "ArrowLeft" && direction !== "RIGHT") nextDirection = "LEFT";
    if (e.key === "ArrowRight" && direction !== "LEFT") nextDirection = "RIGHT";
    if (e.key === " ") isPaused = !isPaused;
});
