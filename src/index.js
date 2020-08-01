const videos = [];
let processors = [];

function loadVideo(name) {
  const video = document.createElement("video");
  video.src = `media/${name}`;
  video.muted = true;
  video.loop = true;
  videos.push(video);
}
loadVideo("video1.m4v");
loadVideo("video2.m4v");
loadVideo("video3.m4v");
loadVideo("video4.m4v");

function findControl(name) {
  return document.querySelector(`#controls [name=${name}]`);
}

function setBackground() {
  const color = findControl("background").value;
  document.body.style.backgroundColor = color;
}

function initBackground() {
  findControl("background").addEventListener("change", setBackground);
  setBackground();
}

function setVideoCount() {
  const area = document.getElementById("area");
  processors.forEach((processor) => {
    processor.cleanUp();
  });
  processors = [];
  area.innerHTML = "";
  videos.forEach((el) => {
    el.pause();
  });
  const count = findControl("count").value;
  const width = Math.floor((area.offsetWidth / count) * 0.98);
  for (let w = 0; w < count; w++) {
    for (let h = 0; h < count; h++) {
      addVideoProcessor(width);
    }
  }
}

function initVideoCount() {
  const control = findControl("count");
  for (let i = 1; i <= 25; i++) {
    control.insertAdjacentHTML(
      "beforeend",
      `<option value="${i}">${i * i} Videos</option>`
    );
  }
  control.addEventListener("change", setVideoCount);
  setVideoCount();
}

function addVideoProcessor(width) {
  const videoNum = Math.floor(Math.random() * videos.length);
  const video = videos[Math.floor(Math.random() * videos.length)];
  const processor = new VideoProcessor(video, width, videoNum);
  document
    .getElementById("area")
    .insertAdjacentElement("beforeend", processor.targetCanvas);
  processors.push(processor);
  processor.play();
}

class VideoProcessor {
  constructor(video, width, videoNum) {
    this.video = video;
    this.width = width;
    this.sourceCanvas = document.createElement("canvas");
    this.sourceContext = this.sourceCanvas.getContext("2d");
    this.targetCanvas = document.createElement("canvas");
    this.targetCanvas.className = `person${videoNum} video`;
    this.targetContext = this.targetCanvas.getContext("2d");
  }

  cleanUp() {
    this.video.removeEventListener("play", this.listener);
  }

  get height() {
    const ratio = this.video.videoWidth / this.video.videoHeight;
    return this.width / ratio;
  }

  setDimensions = () => {
    this.targetCanvas.style.width = `${this.width}px`;
    this.targetCanvas.style.height = `${this.height}px`;
  };

  timerCallback = () => {
    if (this.video.paused || this.video.ended) {
      return;
    }
    this.computeFrame();
    setTimeout(this.timerCallback, 0);
  };

  computeFrame() {
    const video = this.video;
    const videoMult = 2.82;
    if (video.videoWidth < 1) return;

    //this.setDimensions();
    this.sourceContext.drawImage(
      video,
      0,
      0,
      video.videoWidth / videoMult,
      video.videoHeight / videoMult
    );
    let frame = this.sourceContext.getImageData(
      0,
      0,
      video.videoWidth / videoMult,
      video.videoHeight / videoMult
    );
    let l = frame.data.length / 4;

    for (let i = 0; i < l; i++) {
      let r = frame.data[i * 4 + 0];
      let g = frame.data[i * 4 + 1];
      let b = frame.data[i * 4 + 2];
      if (g > 100 && r < 100 && b < 100) {
        frame.data[i * 4 + 3] = 0;
      }
    }
    this.targetContext.putImageData(frame, 0, 0);
  }

  play() {
    this.listener = this.video.addEventListener(
      "play",
      this.timerCallback,
      false
    );
    this.video.play();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initBackground();
  initVideoCount();
});
