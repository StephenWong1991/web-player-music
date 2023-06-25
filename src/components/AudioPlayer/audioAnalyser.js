class AudioAnalyser {
  constructor() {
    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 512;
  }

  createAnalyser(audio) {
    this.buffer = new Uint8Array(this.analyser.frequencyBinCount);
    this.connectAudio(audio);
  }

  connectAudio(audio) {
    const source = this.audioCtx.createMediaElementSource(audio);
    source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);
  }
}

export default new AudioAnalyser();
