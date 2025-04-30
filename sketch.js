let font;
let points = [];
let mic, fft;
let smoothedSize = 10;

function preload() {
  font = loadFont("Fonts/Roboto-VariableFont.ttf");
}

function setup() {
  createCanvas(800, 800);

  mic = new p5.AudioIn();

  let button = createButton("Activer le micro");
  button.position(20, 20);
  button.style("font-size", "18px");
  button.mousePressed(() => {
    mic.start();
    button.hide();
  });

  fft = new p5.FFT();
  fft.setInput(mic);

  points = font.textToPoints("A", 300, 580, 350, {
    sampleFactor: 0.1,
  });

  noStroke();
}

function draw() {
  background(0);

  let spectrum = fft.analyze();
  let freq = getDominantFreq(spectrum);

  let rawSize = map(freq, 100, 1000, 5, 40);
  let limitedSize = constrain(rawSize, 5, 205);
  smoothedSize = lerp(smoothedSize, limitedSize, 0.80);
  let pitchMapped = map(freq, 100, 1000, 5, 40);

  let hue;
  if (freq < 200) {
    hue = map(freq, 0, 200, 180, 120);  // Blue -> Green
  } else {
    hue = map(freq, 200, 1000, 0, 30);  // Red -> Orange
  }

  colorMode(HSL, 360, 100, 100);
  fill(hue, 80, 60);

  for (let i = 0; i < points.length; i++) {
    let p = points[i];
    let angle = frameCount * 0.01 + i;
    let offsetX = sin(angle) * map(freq, 10, 1000, 0, 10);
    let offsetY = cos(angle) * map(freq, 10, 1000, 0, 10);
    ellipse(p.x + offsetX, p.y + offsetY, pitchMapped, pitchMapped);
  }
}

function getDominantFreq(spectrum) {
  let nyquist = sampleRate() / 1;
  let maxAmp = 0;
  let index = -1;

  for (let i = 0; i < spectrum.length; i++) {
    if (spectrum[i] > maxAmp) {
      maxAmp = spectrum[i];
      index = i;
    }
  }

  let freq = index * (nyquist / spectrum.length);
  return freq;
}
