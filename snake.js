const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 初始化游戏变量
let snake = [{ x: 400, y: 400 }];
let direction = "RIGHT";
let food = [];
let obstacles = [];
let score = 0;
let gameOver = false;
let speed = 200;
let isPaused = false;
let highScores = JSON.parse(localStorage.getItem("highScores")) || [];
const bgImage = new Image();
bgImage.src = "https://s21.ax1x.com/2025/01/22/pEAWq2Q.jpg";

// 食物种类
const foodTypes = [
    { color: "red", score: 1, effect: "normal" },
    { color: "blue", score: 3, effect: "speedUp" },
    { color: "yellow", score: 2, effect: "slowDown" }
];

// 加载音效
const eatSound = new Audio("eat.mp3");
const crashSound = new Audio("crash.mp3");
const gameOverSound = new Audio("gameover.mp3");

// 设置难度
function setDifficulty(selectedSpeed) {
    speed = selectedSpeed;
    document.getElementById("difficulty").style.display = "none";
    generateFood();
    generateObstacles();
    gameLoop();
}

// 绘制背景
function drawBackground() {
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
}

// 绘制一个方块
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 20, 20);
}

// 随机生成食物
function generateFood() {
    food = [];
    for (let i = 0; i < 3; i++) {
        const type = foodTypes[Math.floor(Math.random() * foodTypes.length)];
        food.push({
            x: Math.floor(Math.random() * 40) * 20,
            y: Math.floor(Math.random() * 40) * 20,
            ...type
        });
    }
}

// 随机生成障碍物
function generateObstacles() {
    obstacles = [];
    for (let i = 0; i < 10; i++) {
        obstacles.push({
            x: Math.floor(Math.random() * 40) * 20,
            y: Math.floor(Math.random() * 40) * 20
        });
    }
}

// 更新蛇的位置
function updateSnake() {
    const head = { ...snake[0] };

    // 更新蛇头方向
    switch (direction) {
        case "UP": head.y -= 20; break;
        case "DOWN": head.y += 20; break;
        case "LEFT": head.x -= 20; break;
        case "RIGHT": head.x += 20; break;
    }

    // 边界穿越
    head.x = (head.x + canvas.width) % canvas.width;
    head.y = (head.y + canvas.height) % canvas.height;

    // 检测撞墙或撞障碍物
    if (snake.some(segment => segment.x === head.x && segment.y === head.y) ||
        obstacles.some(ob => ob.x === head.x && ob.y === head.y)) {
        gameOverSound.play();
        endGame();
        return;
    }

    // 吃食物
    const eatenFood = food.find(f => f.x === head.x && f.y === head.y);
    if (eatenFood) {
        eatSound.play();
        score += eatenFood.score;

        // 食物效果
        if (eatenFood.effect === "speedUp" && speed > 50) speed -= 10;
        if (eatenFood.effect === "slowDown") speed += 10;

        food.splice(food.indexOf(eatenFood), 1); // 移除被吃的食物
        generateFood();
    } else {
        snake.pop(); // 没有吃到食物时，移除蛇尾
    }

    snake.unshift(head);
}

// 绘制分数
function drawScore() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`得分: ${score}`, 10, 30);
}

// 渲染游戏
function render() {
    drawBackground();
    snake.forEach(segment => drawBlock(segment.x, segment.y, "green"));
    food.forEach(f => drawBlock(f.x, f.y, f.color));
    obstacles.forEach(ob => drawBlock(ob.x, ob.y, "gray"));
    drawScore();
}

// 游戏循环
function gameLoop() {
    if (gameOver) return;
    if (!isPaused) {
        updateSnake();
        render();
    }
    setTimeout(gameLoop, speed);
}

// 游戏结束逻辑
function endGame() {
    gameOver = true;
    alert(`游戏结束！得分: ${score}`);
    updateHighScores(score);
    displayHighScores();
}

// 更新排行榜
function updateHighScores(newScore) {
    const playerName = prompt("请输入您的名字：") || "匿名玩家";
    highScores.push({ name: playerName, score: newScore });
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 5);
    localStorage.setItem("highScores", JSON.stringify(highScores));
}

// 显示排行榜
function displayHighScores() {
    const highScoreList = document.getElementById("highScoreList");
    highScoreList.innerHTML = "<h2>排行榜</h2>";
    highScores.forEach((entry, index) => {
        const listItem = document.createElement("p");
        listItem.textContent = `${index + 1}. ${entry.name} - ${entry.score}`;
        highScoreList.appendChild(listItem);
    });
}

// 监听键盘事件
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
    if (e.key === " ") isPaused = !isPaused;
});
