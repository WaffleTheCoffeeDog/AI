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
var rotation = 0;
var rotationVelocity = 0;
var tick = 0;
var maxRotVel = 10;
var gameSpeed = 1;

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
  console.log(
    canvas.width / 2 + Math.sin(toRad(rotation)) * 100,
    canvas.height / 2 + Math.cos(toRad(rotation)) * 100
  );
  ctx.fill();
}

function logic() {
  rotation += rotationVelocity;
}

//AI init
var neurons = [];
var neurray = [];
var temp = [];
var bestNetwork = [];
var bestScore = Infinity;
var mutationRange = 0.7;
var mutationDecay = 0.99;
const loggedErrors = new Set();

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
  return neurons[neurons.length - 1][0].value;
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
  return neurons[neurons.length - 1][0].value;
}

function train(am, trainingSet) {
  mutationRange *= mutationDecay;
  for (let i = 0; i < am; i++) {
    neurray[i] = randomize(mutationRange, bestNetwork);
    neurons = neurray[i];
    let totalError = 0;
    for (let sample of trainingSet) {
      let output = run(...sample.input);
      totalError += Math.abs(output - sample.target);
    }
    if (totalError < bestScore) {
      bestScore = totalError;
      bestNetwork = JSON.parse(JSON.stringify(neurray[i]));
    }
  }
  neurons = bestNetwork;
}

newNeur(0.7, 2, 3, 2, 2);

//Game loop
async function gameLoop() {
  tick++;
  logic();
  drawFrame();
  console.log("Tick: " + tick);
  rotationVelocity = 1 * maxRotVel;
  console.log("Rotation: ", simplifyAngle(rotation));

  if(gameSpeed >= 1) {
await new Promise(resolve => setTimeout(resolve, 1000 / gameSpeed))
  requestAnimationFrame(gameLoop);
} else {
    requestAnimationFrame(gameLoop);
}}
requestAnimationFrame(gameLoop);
