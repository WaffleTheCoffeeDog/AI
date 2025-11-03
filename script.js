//Canvas setup
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.fillStyle = "darkslategrey";
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = "coral";
ctx.beginPath();
ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
ctx.fill();

//Help functs

function toDeg(rad) {
  return rad * (180 / Math.PI);
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

simplifyAngle = (angle) => {
  angle = angle % 360;
  if (angle < 0) angle += 360;
  return angle / 180 - 1;
};

//Game init
var rotation = Math.random() * 360;
var rotationVelocity = 0;
var tick = 0;
var maxRotVel = 10;
var gameSpeed = 0;
var shootCooldown = 0;
var objects = {};
objects.bullets = [];
objects.enemies = [];
var kills = 0;
var cycleStart = 0;

var maxSpawnDistance =
  canvas.width > canvas.height
    ? canvas.width / 2 - 100
    : canvas.height / 2 - 100;

function drawFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "darkslategrey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "coral";
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    canvas.width / 2 + Math.sin(toRad(rotation)) * 50,
    canvas.height / 2 + Math.cos(toRad(rotation)) * 50,
    20,
    0,
    Math.PI * 2
  );
  ctx.fill();

  objects.bullets.forEach((bullet) => {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
  });

  objects.enemies.forEach((enemy) => {
    ctx.beginPath();
    ctx.arc(
      canvas.width / 2 + Math.sin(toRad(enemy.angle)) * enemy.distance,
      canvas.height / 2 + Math.cos(toRad(enemy.angle)) * enemy.distance,
      30,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "red";
    ctx.fill();
  });
}

function logic() {
  rotation += rotationVelocity;

  objects.bullets.forEach((bullet, index) => {
    bullet.x += Math.sin(toRad(bullet.angle)) * 10;
    bullet.y += Math.cos(toRad(bullet.angle)) * 10;
    if (
      bullet.x < 0 ||
      bullet.x > canvas.width ||
      bullet.y < 0 ||
      bullet.y > canvas.height
    ) {
      objects.bullets.splice(objects.bullets.indexOf(bullet), 1);
    }

    objects.enemies.forEach((enemy, eIndex) => {
      let enemyX =
        canvas.width / 2 + Math.sin(toRad(enemy.angle)) * enemy.distance;
      let enemyY =
        canvas.height / 2 + Math.cos(toRad(enemy.angle)) * enemy.distance;
      let dist = Math.hypot(bullet.x - enemyX, bullet.y - enemyY);
      if (dist < 60) {
        objects.enemies.splice(objects.enemies.indexOf(enemy), 1);
        objects.bullets.splice(objects.bullets.indexOf(bullet), 1);
        kills++;
      }
    });
  });

  objects.enemies.forEach((enemy, index) => {
    enemy.distance -= 2;
    enemy.x = canvas.width / 2 + Math.sin(toRad(enemy.angle)) * enemy.distance;
    enemy.y = canvas.height / 2 + Math.cos(toRad(enemy.angle)) * enemy.distance;
    if (enemy.distance < 100) {
      objects.enemies.splice(objects.enemies.indexOf(enemy), 1);
      if (kills > bestScore) {
        bestScore = kills;
        bestNetwork = JSON.parse(JSON.stringify(neurons));
      }
    }
  });
}

function shoot() {
  objects.bullets.push({
    angle: rotation,
    x: canvas.width / 2 + Math.sin(toRad(rotation)) * 50,
    y: canvas.height / 2 + Math.cos(toRad(rotation)) * 50,
  });
}

function newEnemy() {
  objects.enemies.push({
    angle: Math.random() * 360,
    distance: maxSpawnDistance,
  });
}

function updateAngleDifferenceAverage() {
  if (objects.enemies.length > 0) {
    var angleDiff = Math.abs(simplifyAngle(rotation) - simplifyAngle(objects.enemies[0].angle));
      if (!this.angleDiffSum) this.angleDiffSum = 0;
      if (!this.angleDiffCount) this.angleDiffCount = 0;
      this.angleDiffSum += angleDiff;
      this.angleDiffCount++;
  return this.angleDiffSum / this.angleDiffCount;
  }
}

//Game loop

async function gameLoop() {
  tick++;
  logic();
  drawFrame();

if (!currentlyTraining) {
  newTrainingCycle();
  
}

if (objects.enemies.length > 0) {
  rotationVelocity = run(simplifyAngle(rotation), simplifyAngle(objects.enemies[0].angle))[1] * maxRotVel;
  run(simplifyAngle(rotation), simplifyAngle(objects.enemies[0].angle))[0] > 0.2 ? shoot() : null;
}

score = (1 / updateAngleDifferenceAverage()) + kills
console.log("Score: " + score)

if (Math.random() * 100 < 1) {
  newEnemy();
}

if (gameSpeed >= 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000 / gameSpeed));
    requestAnimationFrame(gameLoop);
  } else {
    requestAnimationFrame(gameLoop);
  }
}
requestAnimationFrame(gameLoop);

// ===========================================================================================================

//AI init
var neurons = [];
var neurray = [];
var temp = [];
var bestNetwork = [];
var bestScore = Infinity;
var mutationRange = 0.7;
var mutationDecay = 0.99;
var loggedErrors = new Set();
var currentlyTraining = false;

function activate(x) {
  return Math.tanh(x);
}

function clamp(value, min = -1, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function run(...input) {
  for (let i = 0; i < neurons[0].length; i++) {
    neurons[0][i].value = activate(input[i] + neurons[0][i].weight);
  }
  for (let i = 1; i < neurons.length; i++) {
    for (let i1 = 0; i1 < neurons[i].length; i1++) {
      neurons[i][i1].value = 0;
      for (let i2 = 0; i2 < neurons[i - 1].length; i2++) {
        neurons[i][i1].value +=
          neurons[i - 1][i2].value * neurons[i - 1][i2].bias[i1];
      }
      neurons[i][i1].value = activate(
        neurons[i][i1].value + neurons[i][i1].weight
      );
    }
  }
  return [neurons[neurons.length - 1][0].value , neurons[neurons.length - 1][1].value];
}

function newNeur(range, ...neuronAmount) {
  neurons = [];
  for (let i = 0; i < neuronAmount.length; i++) {
    neurons.push(
      new Array(neuronAmount[i]).fill(0).map(() => ({
        weight: 0,
        bias:
          i + 1 < neuronAmount.length
            ? new Array(neuronAmount[i + 1])
                .fill(0)
                .map(() => Math.random() * 2 * range - range)
            : [],
        value: 0,
      }))
    );
  }
  bestNetwork = JSON.parse(JSON.stringify(neurons));
  return neurons;
}

function randomize(range, nArray) {
  let clone = JSON.parse(JSON.stringify(nArray));
  for (let i = 0; i < clone.length; i++) {
    for (let i1 = 0; i1 < clone[i].length; i1++) {
      for (let i2 = 0; i2 < clone[i][i1].bias.length; i2++) {
        clone[i][i1].bias[i2] += Math.random() * 2 * range - range;
        clone[i][i1].bias[i2] = clamp(clone[i][i1].bias[i2]);
      }
      clone[i][i1].weight += Math.random() * 2 * range - range;
      clone[i][i1].weight = clamp(clone[i][i1].weight);
    }
  }
  return clone;
}

function train(am) {
  mutationRange *= mutationDecay;
  for (let i = 0; i < am; i++) {
    neurray[i] = randomize(mutationRange, bestNetwork);
    neurons = neurray[i];
  }
}

function evaluate() {
      /*let totalError = 0;
     for (let sample of trainingSet) {
      totalError += Math.abs(run(...sample.input) - sample.target);
    } 
    if (totalError < bestScore) {
      bestScore = totalError;
      bestNetwork = JSON.parse(JSON.stringify(neurray[i]));
    }*/}

function newTrainingCycle() {
score = 0;
  kills = 0;
  objects.enemies = [];
  objects.bullets = [];
  neurons = JSON.parse(JSON.stringify(bestNetwork));
  currentlyTraining = true;
  rotation = Math.random() * 360;
  rotationVelocity = 0;
  cycleStart = tick;
}


newNeur(1.5, 2, 3, 2, 2);

train(20);