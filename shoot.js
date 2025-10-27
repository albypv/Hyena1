const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let gameOver = false;
let gameWon = false; // Add this line

// Load images
const bombImage = new Image();
bombImage.src = "assets/bomb.png"; 

const jetImage = new Image();
jetImage.src = "assets/hyena.png"; // Replace with your jet image file

const enemyImage = new Image();
enemyImage.src = "assets/juice.png"; // Replace with your enemy image file

const bossImage = new Image();
bossImage.src = "assets/boss.png"; // Add your boss image to assets

const bossBulletImage = new Image();
bossBulletImage.src = "assets/bomb.png"; // Add boss bullet image to assets

let jet = {
  x: canvas.width / 2 - 40, // Adjusted for new width
  y: canvas.height - 80,    // Adjusted for new height
  width: 50,                // Increased from 50 to 80
  height: 80,               // Increased from 50 to 80
  speed: 7
};

let bullets = [];
let enemies = [];
let bombs = [];
let score = 0;
let boss = null;
let bossBullets = [];
let playerHealth = 1; // Start with 1 HP
let bossHealth = 10;
let inBossRound = false;
let bossPhase = 1; // 1: rare, 2: rapid, 3: spread
let bossMaxHealth = 10; // For health bar scaling
let bossDialogActive = false;
let canShoot = true; // Add this flag
let animationFrameId = null; // Add this at the top

function startBossRound() {
  inBossRound = true;
  boss = {
    x: canvas.width / 2 - 80,
    y: 20,
    width: 160,
    height: 120,
    speed: 3,
    direction: 1
  };
  bossPhase = 1;
  bossMaxHealth = 10;
  bossHealth = bossMaxHealth;
  bossBullets = [];
}

function moveBoss() {
  if (!boss) return;
  boss.x += boss.speed * boss.direction;
  if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
    boss.direction *= -1;
  }
  // Phase 1: shoots rarely
  if (bossPhase === 1 && Math.random() < 0.01) {
    bossBullets.push({
      x: boss.x + boss.width / 2 - 10,
      y: boss.y + boss.height,
      width: 20,
      height: 40,
      speed: 6
    });
  }
  // Phase 2: shoots rapidly
  if (bossPhase === 2 && Math.random() < 0.07) {
    bossBullets.push({
      x: boss.x + boss.width / 2 - 10,
      y: boss.y + boss.height,
      width: 20,
      height: 40,
      speed: 7
    });
  }
  // Phase 3: shoots in spread mode (2 bullets, reduced fire rate)
  if (bossPhase === 3 && Math.random() < 0.05) { // Reduced fire rate
    // Left
    bossBullets.push({
      x: boss.x + boss.width / 2 - 30,
      y: boss.y + boss.height,
      width: 20,
      height: 40,
      speed: 8,
      dx: -2
    });
    // Right
    bossBullets.push({
      x: boss.x + boss.width / 2 + 10,
      y: boss.y + boss.height,
      width: 20,
      height: 40,
      speed: 8,
      dx: 2
    });
  }
}

function startBossRound() {
  inBossRound = true;
  boss = {
    x: canvas.width / 2 - 80,
    y: 20,
    width: 160,
    height: 120,
    speed: 2,
    direction: 1
  };
  bossPhase = 1;
  bossMaxHealth = 10;
  bossHealth = bossMaxHealth;
  bossBullets = [];
}

function moveBoss() {
  if (!boss) return;
  boss.x += boss.speed * boss.direction;
  if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
    boss.direction *= -1;
  }
  // Phase 1: shoots rarely
  if (bossPhase === 1 && Math.random() < 0.01) {
    bossBullets.push({
      x: boss.x + boss.width / 2 - 10,
      y: boss.y + boss.height,
      width: 20,
      height: 40,
      speed: 3
    });
  }
  // Phase 2: shoots rapidly
  if (bossPhase === 2 && Math.random() < 0.07) {
    bossBullets.push({
      x: boss.x + boss.width / 2 - 10,
      y: boss.y + boss.height,
      width: 20,
      height: 40,
      speed: 4
    });
  }
  // Phase 3: shoots in spread mode (2 bullets, reduced fire rate)
  if (bossPhase === 3 && Math.random() < 0.05) { // Reduced fire rate
    // Left
    bossBullets.push({
      x: boss.x + boss.width / 2 - 30,
      y: boss.y + boss.height,
      width: 20,
      height: 40,
      speed: 4,
      dx: -2
    });
    // Right
    bossBullets.push({
      x: boss.x + boss.width / 2 + 10,
      y: boss.y + boss.height,
      width: 20,
      height: 40,
      speed: 8,
      dx: 2
    });
  }
}

function checkPlayerBulletBossCollision() {
  bullets.forEach((bullet, bi) => {
    if (
      boss &&
      bullet.x < boss.x + boss.width &&
      bullet.x + bullet.width > boss.x &&
      bullet.y < boss.y + boss.height &&
      bullet.y + bullet.height > boss.y
    ) {
      bullets.splice(bi, 1);
      bossHealth--;
      // Phase transitions
      if (bossPhase === 1 && bossHealth <= 0) {
        bossPhase = 2;
        bossHealth = bossMaxHealth; // Reset health for phase 2
      }
      else if (bossPhase === 2 && bossHealth <= 0) {
        bossPhase = 3;
        bossHealth = bossMaxHealth; // Reset health for phase 3
      } else if (bossPhase === 3 && bossHealth <= 0) {
        inBossRound = false;
        boss = null;
        showWinMessage();
      }
    }
  });
}

function drawBoss() {
  if (boss) {
    ctx.drawImage(bossImage, boss.x, boss.y, boss.width, boss.height);
    // Draw boss health bar
    ctx.fillStyle = "red";
    ctx.fillRect(boss.x, boss.y - 20, boss.width * (bossHealth / bossMaxHealth), 10);
    ctx.strokeStyle = "black";
    ctx.strokeRect(boss.x, boss.y - 20, boss.width, 10);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Boss HP: " + bossHealth, boss.x, boss.y - 30);
    ctx.fillText("Phase: " + bossPhase, boss.x, boss.y - 45);
  }
}

let keys = {};
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  // Prevent holding space in boss phase
  if (inBossRound && e.key === " ") {
    if (canShoot) {
      shootBullet();
      canShoot = false;
    }
  }
});
document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
  // Reset shoot flag on space release
  if (inBossRound && e.key === " ") {
    canShoot = true;
  }
});

function drawJet() {
  ctx.drawImage(jetImage, jet.x, jet.y, jet.width, jet.height);
}

function drawBullets() {
  ctx.fillStyle = "yellow";
  bullets.forEach((b) => ctx.fillRect(b.x, b.y, b.width, b.height));
}

function drawEnemies() {
  enemies.forEach((en) => {
    ctx.drawImage(enemyImage, en.x, en.y, en.width, en.height);
  });
}

function shootBullet() {
  bullets.push({ 
    x: jet.x + jet.width / 2 - 5,
    y: jet.y,
    width: 7,
    height: 15,
    speed: 8 
  });
}

function moveJet() {
  if (keys["ArrowLeft"] && jet.x > 0) jet.x -= jet.speed;
  if (keys["ArrowRight"] && jet.x + jet.width < canvas.width) jet.x += jet.speed;
  // Only allow normal shooting outside boss round
  if (!inBossRound && keys[" "]) {
    if (bullets.length === 0 || bullets[bullets.length - 1].y < jet.y - 80) {
      shootBullet();
    }
  }
}

function moveBullets() {
  bullets.forEach((b, i) => {
    b.y -= b.speed;
    if (b.y < 0) bullets.splice(i, 1);
  });
}

function spawnEnemies() {
  if (Math.random() < 0.01) { // Lowered from 0.03 to 0.01
    enemies.push({
      x: Math.random() * (canvas.width - 60),
      y: 0,
      width: 40,   // Increased from 40 to 60
      height: 60,  // Increased from 40 to 60
      speed: 2
    });
  }
}

function moveEnemies() {
  enemies.forEach((en, i) => {
    en.y += en.speed;
    if (en.y > canvas.height) enemies.splice(i, 1);
  });
}

function checkCollisions() {
  // Bullet-enemy collision
  bullets.forEach((b, bi) => {
    enemies.forEach((en, ei) => {
      if (
        b.x < en.x + en.width &&
        b.x + b.width > en.x &&
        b.y < en.y + en.height &&
        b.y + b.height > en.y
      ) {
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        score++;
      }
    });
  });

  // Bullet-bomb collision (game over)
  bullets.forEach((b, bi) => {
    bombs.forEach((bomb, bombi) => {
      if (
        b.x < bomb.x + bomb.width &&
        b.x + b.width > bomb.x &&
        b.y < bomb.y + bomb.height &&
        b.y + b.height > bomb.y
      ) {
        gameOver = true;
      }
    });
  });
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("JUICE dropped: " + score, 10, 20);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Show boss dialog when score threshold reached
  if (!inBossRound && !bossDialogActive && score >= 10) {
    bossDialogActive = true;
    setTimeout(() => {
      bossDialogActive = false;
      startBossRound();
      playerHealth = 3; // Set HP to 3 when boss fight begins
    }, 2000); // Show dialog for 2 seconds
  }

  if (bossDialogActive) {
    drawBossDialog();
    drawJet();
    drawBullets();
    drawScore();
    drawHealth(); // Show HP bar during dialog
    requestAnimationFrame(gameLoop);
    return;
  }

  moveJet();
  moveBullets();
  if (!inBossRound) {
    spawnEnemies();
    spawnBombs();
    moveEnemies();
    moveBombs();
    drawEnemies();
    drawBombs();
  } else {
    moveBoss();
    moveBossBullets();
    drawBoss();
    drawBossBullets();
  }
  checkCollisions();
  checkJetCollision();
  checkBombCollision();
  if (inBossRound) {
    checkBossBulletCollision();
    checkPlayerBulletBossCollision();
  }

  drawJet();
  drawBullets();
  drawScore();

  // Show HP bar only during boss dialog or boss fight
  if (bossDialogActive || inBossRound) {
    drawHealth();
  }

  if (gameWon) {
    return;
  }
  if (gameOver) {
    drawGameOver();
    return;
  }

  animationFrameId = requestAnimationFrame(gameLoop); // Save the frame ID
}

function checkJetCollision() {
  for (let en of enemies) {
    if (
      jet.x < en.x + en.width &&
      jet.x + jet.width > en.x &&
      jet.y < en.y + en.height &&
      jet.y + jet.height > en.y
    ) {
      gameOver = true;
      break;
    }
  }
}


function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "red";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
  ctx.textAlign = "left";
}

function spawnBombs() {
  if (Math.random() < 0.003) { // Lowered from 0.01 to 0.003
    bombs.push({
      x: Math.random() * (canvas.width - 50),
      y: 0,
      width: 30,
      height: 30,
      speed: 3
    });
  }
}

function moveBombs() {
  bombs.forEach((b, i) => {
    b.y += b.speed;
    if (b.y > canvas.height) bombs.splice(i, 1);
  });
}

function drawBombs() {
  bombs.forEach((b) => {
    ctx.drawImage(bombImage, b.x, b.y, b.width, b.height);
  });
}

function checkBombCollision() {
  for (let b of bombs) {
    if (
      jet.x < b.x + b.width &&
      jet.x + jet.width > b.x &&
      jet.y < b.y + b.height &&
      jet.y + jet.height > b.y
    ) {
      gameOver = true;
      break;
    }
  }
}

function startBossRound() {
  inBossRound = true;
  boss = {
    x: canvas.width / 2 - 80,
    y: 20,
    width: 160,
    height: 120,
    speed: 3,
    direction: 1
  };
  bossPhase = 1;
  bossMaxHealth = 10;
  bossHealth = bossMaxHealth;
  bossBullets = [];
}

function moveBoss() {
  if (!boss) return;
  boss.x += boss.speed * boss.direction;
  if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
    boss.direction *= -1;
  }
  // Phase 1: shoots rarely
  if (bossPhase === 1 && Math.random() < 0.01) {
    bossBullets.push({
      x: boss.x + boss.width / 2 - 10,
      y: boss.y + boss.height,
      width: 20,
      height: 40,
      speed: 6
    });
  }
  // Phase 2: shoots rapidly
  if (bossPhase === 2 && Math.random() < 0.07) {
    bossBullets.push({
      x: boss.x + boss.width / 2 - 10,
      y: boss.y + boss.height,
      width: 20,
      height: 40,
      speed: 7
    });
  }
  // Phase 3: shoots in spread mode (2 bullets, reduced fire rate)
  if (bossPhase === 3 && Math.random() < 0.05) { // Reduced fire rate
    // Left
    bossBullets.push({
      x: boss.x + boss.width / 2 - 30,
      y: boss.y + boss.height,
      width: 20,
      height: 40,
      speed: 8,
      dx: -2
    });
    // Right
    bossBullets.push({
      x: boss.x + boss.width / 2 + 10,
      y: boss.y + boss.height,
      width: 20,
      height: 40,
      speed: 8,
      dx: 2
    });
  }
}

function drawBoss() {
  if (boss) {
    ctx.drawImage(bossImage, boss.x, boss.y, boss.width, boss.height);
    // Draw boss health bar
    ctx.fillStyle = "red";
    ctx.fillRect(boss.x, boss.y - 20, boss.width * (bossHealth / bossMaxHealth), 10);
    ctx.strokeStyle = "black";
    ctx.strokeRect(boss.x, boss.y - 20, boss.width, 10);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Boss HP: " + bossHealth, boss.x, boss.y - 30);
    ctx.fillText("Phase: " + bossPhase, boss.x, boss.y - 45);
  }
}

function moveBossBullets() {
  bossBullets.forEach((b, i) => {
    b.y += b.speed;
    if (b.dx) b.x += b.dx;
    if (b.y > canvas.height) bossBullets.splice(i, 1);
  });
}

function drawBossBullets() {
  bossBullets.forEach((b) => {
    ctx.drawImage(bossBulletImage, b.x, b.y, b.width, b.height);
  });
}

function drawBossDialog() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "25px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Kill me and be the new H*TL*R", canvas.width / 2, canvas.height / 2);
  ctx.textAlign = "left";
}

function checkBossBulletCollision() {
  bossBullets.forEach((b, i) => {
    if (
      jet.x < b.x + b.width &&
      jet.x + jet.width > b.x &&
      jet.y < b.y + b.height &&
      jet.y + jet.height > b.y
    ) {
      bossBullets.splice(i, 1);
      playerHealth--;
      if (playerHealth <= 0) {
        gameOver = true;
      }
    }
  });
}

function checkPlayerBulletBossCollision() {
  bullets.forEach((bullet, bi) => {
    if (
      boss &&
      bullet.x < boss.x + boss.width &&
      bullet.x + bullet.width > boss.x &&
      bullet.y < boss.y + boss.height &&
      bullet.y + bullet.height > boss.y
    ) {
      bullets.splice(bi, 1);
      bossHealth--;
      // Phase transitions
      if (bossPhase === 1 && bossHealth <= 0) {
        bossPhase = 2;
        bossHealth = bossMaxHealth; // Reset health for phase 2
      } else if (bossPhase === 2 && bossHealth <= 0) {
        bossPhase = 3;
        bossHealth = bossMaxHealth; // Reset health for phase 3
      } else if (bossPhase === 3 && bossHealth <= 0) {
        inBossRound = false;
        boss = null;
        showWinMessage();
      }
    }
  });
}

function drawHealth() {
  // Player health bar
  ctx.fillStyle = "green";
  ctx.fillRect(10, 40, 100 * (playerHealth / 3), 10);
  ctx.strokeStyle = "black";
  ctx.strokeRect(10, 40, 100, 10);
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText("Player HP: " + playerHealth, 10, 65);
  if (inBossRound && boss) {
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Boss HP: " + bossHealth, boss.x, boss.y - 30);
  }
}

function showWinMessage() {
  gameWon = true; // Set win flag instead of gameOver
  setTimeout(() => {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "lime";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Hyena Promoted to H*TL*R!", canvas.width / 2, canvas.height / 2);
    ctx.textAlign = "left";
  }, 100);
}

function restartGame() {
  // Cancel previous game loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  // Reset all game state
  gameOver = false;
  gameWon = false;
  score = 0;
  bullets = [];
  enemies = [];
  bombs = [];
  boss = null;
  bossBullets = [];
  playerHealth = 1;
  bossHealth = 10;
  inBossRound = false;
  bossPhase = 1;
  bossDialogActive = false;
  jet.x = canvas.width / 2 - jet.width / 2;
  jet.y = canvas.height - jet.height - 10;
  // Start game loop
  gameLoop();
}

// Start game once both images load
jetImage.onload = () => {
  enemyImage.onload = () => {
    gameLoop();
  };
};

document.getElementById("restartBtn").addEventListener("click", function(e) {
  restartGame();
  this.blur(); // Remove focus so spacebar won't trigger it again
});
