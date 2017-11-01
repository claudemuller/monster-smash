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
  state: this.HIDING,
  // Random time
  waitTime: undefined,
  findWaitTime() {
    this.waitTime = Math.ceil(Math.random() * 60);
  },
  updateAnimation() {
    // Figure out monster's state
    if (this.waitTime > 0 || this.waitTime === undefined) this.state = this.HIDING;
    else this.state = this.JUMPING;

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
    }

    this.sourceX = Math.floor(this.currentFrame % this.COLUMNS) * this.SIZE;
    this.sourceY = Math.floor(this.currentFrame / this.COLUMNS) * this.SIZE;
  }
};

const canvas = document.querySelector('canvas'),
  drawingSurface = canvas.getContext('2d');

const image = new Image();
image.addEventListener('load', loadHandler, false);
image.src = monster.IMAGE;

function loadHandler() {
  monster.findWaitTime();
  updateAnimation();
}

function updateAnimation() {
  setTimeout(updateAnimation, 300);
  monster.updateAnimation();
  render();
}

function render() {
  drawingSurface.clearRect(0, 0, canvas.width, canvas.height);
  drawingSurface.drawImage(image, monster.sourceX, monster.sourceY, monster.SIZE, monster.SIZE,
    0, 0, monster.SIZE, monster.SIZE);
}