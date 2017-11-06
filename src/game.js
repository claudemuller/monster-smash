'use strict';

const gameTimer = {
  time: 0,
  interval: undefined,
  start() {
    this.interval = setInterval((function () {
      this.tick();
    }).bind(this), 1000);
  },
  tick() {
    this.time--;
  },
  stop() {
    clearInterval(this.interval);
  },
  reset() {
    this.time = 0;
  }
};

const monster = {
  IMAGE: 'assets/monsterTileSheet.png',
  SIZE: 128,
  COLUMNS: 3,
  numOfFrames: 5,
  currentFrame: 0,
  sourceX: 0,
  sourceY: 0,
  forward: true,
  // States
  HIDING: 0,
  JUMPING: 1,
  HIT: 2,
  state: this.HIDING,
  timeToReset: 9,
  resetCounter: 0,
  // Random time
  waitTime: undefined,
  findWaitTime() {
    this.waitTime = Math.ceil(Math.random() * 60);
  },
  updateAnimation() {
    // Figure out monster's state
    if (this.state !== this.HIT) {
      if (this.waitTime > 0 || this.waitTime === undefined) this.state = this.HIDING;
      else this.state = this.JUMPING;
    }

    // Switch monster action based on state
    switch (this.state) {
      case this.HIDING:
        this.currentFrame = 0;
        this.waitTime--;
        break;
      case this.JUMPING:
        // If last frame reached, set forward to false
        if (this.currentFrame === this.numOfFrames) this.forward = false;

        // If first frame reached, set forward to true
        if (this.currentFrame === 0 && this.forward === false) {
          // Reset hiding
          this.forward = true;
          this.findWaitTime();
          this.state = this.HIDING;
          break;
        }

        if (this.forward) this.currentFrame++;
        else this.currentFrame--;
        break;
      case this.HIT:
        // Set the current frame to the last one on the tilesheet to display the explosion
        this.currentFrame = 6;

        // Update the resetCounter by 1
        this.resetCounter++;

        // Reset the animation if the resetCounter equals the timeToReset
        if (this.resetCounter === this.timeToReset) {
          this.state = this.HIDING;
          this.currentFrame = 0;
          this.resetCounter = 0;
          this.findWaitTime();
        }
        break;
    }

    this.sourceX = Math.floor(this.currentFrame % this.COLUMNS) * this.SIZE;
    this.sourceY = Math.floor(this.currentFrame / this.COLUMNS) * this.SIZE;
  }
};

const ROWS = 3,
  COLUMNS = 4,
  SIZE = monster.SIZE,
  SPACE = 10;
let monsterObjects = [],
  monsterCanvases = [],
  monsterDrawingSurfaces = [],
  monstersHit = 0;

const stage = document.querySelector('#stage'),
  output = document.querySelector('#output');

const image = new Image();
image.addEventListener('load', loadHandler, false);
image.src = monster.IMAGE;

function loadHandler() {
  buildMap();

  gameTimer.time = 30;
  gameTimer.start();

  updateAnimation();
}

function buildMap() {
  for (let row = 0; row < ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      // Create a single new monster object, give it a random time, display its first frame and push it into an array
      const newMonsterOject = Object.create(monster);
      newMonsterOject.findWaitTime();
      monsterObjects.push(newMonsterOject)

      // Create a canvas tag for each monster and add it to the #stage tag, position it, add a mousedown listener and
      // push it into an array
      const canvas = document.createElement('canvas');
      canvas.setAttribute('width', SIZE);
      canvas.setAttribute('height', SIZE);
      stage.appendChild(canvas);
      canvas.style.top = row * (SIZE + SPACE) + 'px';
      canvas.style.left = column * (SIZE + SPACE) + 'px';
      canvas.addEventListener('mousedown', mousedownHandler, false);
      monsterCanvases.push(canvas);

      // Create a drawing surface and push it into the drawingSurfaces array
      const drawingSurface = canvas.getContext('2d');
      monsterDrawingSurfaces.push(drawingSurface);
    }
  }
}

function mousedownHandler(event) {
  // Find out which canvas was clicked
  const theCanvasThatWasClicked = event.target;

  // Search the monsterCanvases array for a canvas that matches the on that's been clicked
  for (let i = 0; i < monsterCanvases.length; i++) {
    if (monsterCanvases[i] === theCanvasThatWasClicked) {
      const monster = monsterObjects[i];
      if (monster.state === monster.JUMPING) {
        monster.state = monster.HIT;
        monstersHit++;
      }
    }
  }
}

function updateAnimation() {
  if (gameTimer.time > 0) setTimeout(updateAnimation, 120);

  for (let i = 0; i < monsterObjects.length; i++) {
    monsterObjects[i].updateAnimation();
  }

  if (gameTimer.time === 0) endGame();

  render();
}

function endGame() {
  // Stop the gameTimer
  gameTimer.stop();

  // Remove the mousedown even listeners from the canvas tags so that they can't be clicked
  for (let i = 0; i < monsterCanvases.length; i++) {
    const canvas = monsterCanvases[i];
    canvas.removeEventListener('mousedown', mousedownHandler, false);
  }
}

function render() {
  for (let i = 0; i < monsterObjects.length; i++) {
    const monster = monsterObjects[i],
      drawingSurface = monsterDrawingSurfaces[i];

    drawingSurface.clearRect(0, 0, SIZE, SIZE);
    drawingSurface.drawImage(image, monster.sourceX, monster.sourceY, SIZE, SIZE,
      0, 0, SIZE, SIZE);
  }

  // Display the output
  output.innerHTML = `Monsters smashed: ${monstersHit}, Time left: ${gameTimer.time}`;
}