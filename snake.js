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
        if (!obstacles.some(ob => ob.x === newFood.x && ob.y === newFood.y) &&
            !food.some(f => f.x === newFood.x && f.y === newFood.y)) {
            food.push(newFood);
        }
    }
}

function generateObstacles() {
    obstacles = [];
    while (obstacles.length < 10) {
        let newOb = {
            x: Math.floor(Math.random() * 40) * 20,
            y: Math.floor(Math.random() * 40) * 20
        };
        if (!food.some(f => f.x === newOb.x && f.y === newOb.y) &&
            !obstacles.some(ob => ob.x === newOb.x && ob.y === newOb.y)) {
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
        if (eatenFood.effect === "speedUp" && speed > 50) speed -= 10;
        if (eatenFood.effect === "slowDown") speed += 10;
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
    setTimeout(gameLoop, speed);
}

function endGame() {
    gameOver = true;
    alert(`游戏结束！得分: ${score}`);
    updateHighScores(score);
    displayHighScores();
}

document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && direction !== "DOWN") nextDirection = "UP";
    if (e.key === "ArrowDown" && direction !== "UP") nextDirection = "DOWN";
    if (e.key === "ArrowLeft" && direction !== "RIGHT") nextDirection = "LEFT";
    if (e.key === "ArrowRight" && direction !== "LEFT") nextDirection = "RIGHT";
    if (e.key === " ") isPaused = !isPaused;
});
