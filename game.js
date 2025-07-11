const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 16;
const PADDLE_HEIGHT = 100;
const PADDLE_MARGIN = 24;
const BALL_SIZE = 16;
const PLAYER_SPEED = 8;
const AI_SPEED = 4;

// Game objects
let player = {
  x: PADDLE_MARGIN,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT
};

let ai = {
  x: canvas.width - PADDLE_MARGIN - PADDLE_WIDTH,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT
};

let ball = {
  x: canvas.width / 2 - BALL_SIZE / 2,
  y: canvas.height / 2 - BALL_SIZE / 2,
  size: BALL_SIZE,
  speedX: 6 * (Math.random() > 0.5 ? 1 : -1),
  speedY: 4 * (Math.random() > 0.5 ? 1 : -1)
};

let playerScore = 0;
let aiScore = 0;

// Mouse control
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  player.y = mouseY - player.height / 2;

  // Keep paddle within canvas
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
});

// Reset ball to center
function resetBall() {
  ball.x = canvas.width / 2 - BALL_SIZE / 2;
  ball.y = canvas.height / 2 - BALL_SIZE / 2;
  // Randomize direction
  ball.speedX = 6 * (Math.random() > 0.5 ? 1 : -1);
  ball.speedY = 4 * (Math.random() > 0.5 ? 1 : -1);
}

// Draw everything
function draw() {
  // Background
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Middle dotted line
  ctx.save();
  ctx.setLineDash([10, 15]);
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.restore();

  // Paddles
  ctx.fillStyle = '#fff';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillRect(ai.x, ai.y, ai.width, ai.height);

  // Ball
  ctx.fillStyle = '#f3e600';
  ctx.fillRect(ball.x, ball.y, ball.size, ball.size);

  // Scores
  ctx.font = '48px Segoe UI, Arial, sans-serif';
  ctx.fillText(playerScore, canvas.width / 4, 60);
  ctx.fillText(aiScore, 3 * canvas.width / 4, 60);
}

// Collision detection (AABB)
function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Game logic
function update() {
  // Move ball
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // Ball collision with top/bottom walls
  if (ball.y <= 0) {
    ball.y = 0;
    ball.speedY *= -1;
  }
  if (ball.y + ball.size >= canvas.height) {
    ball.y = canvas.height - ball.size;
    ball.speedY *= -1;
  }

  // Ball collision with paddles
  let playerRect = {
    x: player.x,
    y: player.y,
    width: player.width,
    height: player.height
  };
  let aiRect = {
    x: ai.x,
    y: ai.y,
    width: ai.width,
    height: ai.height
  };

  if (isColliding(ball, playerRect)) {
    ball.x = player.x + player.width;
    ball.speedX *= -1;
    // Add a bit of randomness on bounce
    ball.speedY += (Math.random() - 0.5) * 2;
  }

  if (isColliding(ball, aiRect)) {
    ball.x = ai.x - ball.size;
    ball.speedX *= -1;
    ball.speedY += (Math.random() - 0.5) * 2;
  }

  // Score check
  if (ball.x < 0) {
    aiScore++;
    resetBall();
  }
  if (ball.x + ball.size > canvas.width) {
    playerScore++;
    resetBall();
  }

  // AI paddle movement (follow the ball, with some delay)
  if (ball.y + ball.size / 2 > ai.y + ai.height / 2) {
    ai.y += AI_SPEED;
  } else if (ball.y + ball.size / 2 < ai.y + ai.height / 2) {
    ai.y -= AI_SPEED;
  }
  // Keep AI paddle within canvas
  if (ai.y < 0) ai.y = 0;
  if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;
}

// Main loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Start game
loop();