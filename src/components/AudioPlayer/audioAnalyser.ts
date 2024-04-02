class AudioAnalyser {
  private audioCtx?: AudioContext;
  private analyser?: AnalyserNode;
  private buffer?: Uint8Array;

  connectAnalyser(audio: HTMLVideoElement): void {
    // 创建音频上下文
    // https://developer.mozilla.org/zh-CN/docs/Web/API/AudioContext
    this.audioCtx = new AudioContext();

    // 创建分析器节点 暴露音频时间和频率数据
    // https://developer.mozilla.org/zh-CN/docs/Web/API/BaseAudioContext/createAnalyser
    this.analyser = this.audioCtx.createAnalyser();

    // (信号)样本的窗口大小
    // https://developer.mozilla.org/zh-CN/docs/Web/API/AnalyserNode/fftSize
    this.analyser.fftSize = 512;

    // 可视化的数据值的数量
    // https://developer.mozilla.org/zh-CN/docs/Web/API/AnalyserNode/frequencyBinCount
    this.buffer = new Uint8Array(this.analyser.frequencyBinCount);

    // 将 AudioBufferSourceNode 连接到 this.analyser
    // https://developer.mozilla.org/zh-CN/docs/Web/API/AudioContext/createMediaElementSource
    this.audioCtx.createMediaElementSource(audio).connect(this.analyser);

    // this.audioCtx.destination context 中所有音频的最终目标节点 一般是音频渲染设备
    // https://developer.mozilla.org/zh-CN/docs/Web/API/BaseAudioContext/destination
    this.analyser.connect(this.audioCtx.destination);
  }

  getAnalyser() {
    return this.analyser;
  }

  getAnalyserBuffer() {
    return this.buffer;
  }
}

const audioAnalyser = new AudioAnalyser();

export default audioAnalyser;
