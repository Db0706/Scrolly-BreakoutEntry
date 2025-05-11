
// Game settings
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 256;
canvas.height = 144;

// Game State
let gameState = {
    p1Score: 0,
    p2Score: 0,
    paddle1: { x: 10, y: canvas.height / 2 - 16, height: 32 },
    paddle2: { x: canvas.width - 18, y: canvas.height / 2 - 16, height: 32 },
    ball: { x: canvas.width / 2, y: canvas.height / 2, velocityX: 2, velocityY: 2, radius: 4 }
};

// Paddle speed
const paddleSpeed = 4;

// Key press states
const keys = { w: false, s: false, ArrowUp: false, ArrowDown: false };

document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

// Game loop
function gameLoop() {
    // Update paddles
    if (keys.w && gameState.paddle1.y > 0) gameState.paddle1.y -= paddleSpeed;
    if (keys.s && gameState.paddle1.y + gameState.paddle1.height < canvas.height) gameState.paddle1.y += paddleSpeed;
    if (keys.ArrowUp && gameState.paddle2.y > 0) gameState.paddle2.y -= paddleSpeed;
    if (keys.ArrowDown && gameState.paddle2.y + gameState.paddle2.height < canvas.height) gameState.paddle2.y += paddleSpeed;

    // Update ball position
    gameState.ball.x += gameState.ball.velocityX;
    gameState.ball.y += gameState.ball.velocityY;

    // Ball collision with top and bottom
    if (gameState.ball.y - gameState.ball.radius < 0 || gameState.ball.y + gameState.ball.radius > canvas.height) {
        gameState.ball.velocityY *= -1;
    }

    // Ball out of bounds (scoring)
    if (gameState.ball.x + gameState.ball.radius >= canvas.width) {
        gameState.p1Score++;
        resetBall();
    } else if (gameState.ball.x - gameState.ball.radius <= 0) {
        gameState.p2Score++;
        resetBall();
    }

    // Ball collision with paddles
    if (checkPaddleCollision(gameState.paddle1) || checkPaddleCollision(gameState.paddle2)) {
        gameState.ball.velocityX *= -1;
    }

    // Render everything
    renderGame();
    requestAnimationFrame(gameLoop);
}

function resetBall() {
    gameState.ball.x = canvas.width / 2;
    gameState.ball.y = canvas.height / 2;
    gameState.ball.velocityX *= -1; // Send the ball towards the player who scored last
}

function checkPaddleCollision(paddle) {
    return gameState.ball.x - gameState.ball.radius < paddle.x + 8 &&
           gameState.ball.x + gameState.ball.radius > paddle.x &&
           gameState.ball.y > paddle.y &&
           gameState.ball.y < paddle.y + paddle.height;
}

function renderGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    ctx.fillStyle = "white";
    ctx.fillRect(gameState.paddle1.x, gameState.paddle1.y, 8, gameState.paddle1.height);
    ctx.fillRect(gameState.paddle2.x, gameState.paddle2.y, 8, gameState.paddle2.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw scores
    ctx.font = "16px Arial";
    ctx.fillText("P1: " + gameState.p1Score, 20, 20);
    ctx.fillText("P2: " + gameState.p2Score, canvas.width - 60, 20);
}

// Start game
gameLoop();
