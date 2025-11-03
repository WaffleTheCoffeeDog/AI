var neurons = [];
var neurray = [];
var temp = [];
var bestNetwork = [];
var bestScore = Infinity;
var mutationRange = 0.7;
var mutationDecay = 0.99;

const trainingSet = [
  { input: [0.5, 0.25], target: 0.75 },
  { input: [0, 1], target: 0.2 },
  { input: [1, 0], target: 0.8 },
  { input: [0, 0], target: 0.1 },
];

function clamp(value, min = -1, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function activate(x) {
  return Math.tanh(x);
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
      })),
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
        neurons[i][i1].value + neurons[i][i1].weight,
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
newNeur(0.7, 2, 3, 2, 1);
const loggedErrors = new Set();

for (let i = 0; i < 5000; i++) {
  train(20, trainingSet);
  let totalError = 0;
  for (let sample of trainingSet) {
    let output = run(...sample.input);
    totalError += Math.abs(output - sample.target);
  }
  let averageError = totalError / trainingSet.length;
  const roundedError = averageError.toFixed(10);
  if (!loggedErrors.has(roundedError)) {
    console.log("Generation", i, "- Average error:", roundedError);
    loggedErrors.add(roundedError);
  }
}
console.log("Final best network:", bestNetwork);
console.log("Final best score:", bestScore);