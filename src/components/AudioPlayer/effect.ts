class WaveformEffect {
  // arc
  private radius = 450;
  private coverRadius = this.radius - 30;
  private rectWidth = 5; // 初始旋转角度

  // common
  private rotation = 0;

  // bar
  private capYPositionArray: number[] = [];

  drawBlurBg(img: HTMLImageElement | null, ctx: CanvasRenderingContext2D) {
    if (!img) return;

    const { width, height } = ctx.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.save();
    ctx.fillStyle = "#ffffff00";
    ctx.filter = "blur(80px)";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, -centerX, -centerY, width * 2, height * 2);
    ctx.restore();
  }

  drawCover(img: HTMLImageElement | null, ctx: CanvasRenderingContext2D) {
    if (!img) return;

    const { width, height } = ctx.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.coverRadius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(
      img,
      centerX - this.coverRadius,
      centerY - this.coverRadius,
      this.coverRadius * 2,
      this.coverRadius * 2
    );
    ctx.restore();
    // 更新旋转角度
    this.rotation += 0.01;
  }

  drawArcWaveform(ctx: CanvasRenderingContext2D, datas: Uint8Array) {
    const len = datas.length;
    const offset = Math.floor((len * 2) / 3);
    const waveformList = new Array(offset * 2);

    for (let i = 0; i < offset; i++) {
      waveformList[i] = waveformList[waveformList.length - i - 1] = datas[i];
    }

    const { width, height } = ctx.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const startAngle = Math.PI; // 270 度
    const rectCount = waveformList.length;

    ctx.strokeStyle = ctx.fillStyle = "#ec9446";
    ctx.beginPath();

    for (let i = 0; i < rectCount; i++) {
      const rectHeight = Math.max(waveformList[i] * 0.5, 5);
      const angle = startAngle + (i / rectCount) * 2 * Math.PI;
      const rectX =
        centerX + this.radius * Math.cos(angle) - this.rectWidth / 2;
      const rectY = centerY + this.radius * Math.sin(angle) - rectHeight / 2;
      const rectAngle = angle + Math.PI / 2;

      ctx.save();
      ctx.translate(rectX + this.rectWidth / 2, rectY + rectHeight / 2);
      ctx.rotate(rectAngle);
      // ctx.fillRect(-rectWidth / 2, -rectHeight, rectWidth, rectHeight);
      // ! chrome99+
      ctx.roundRect(
        -this.rectWidth / 2,
        -rectHeight,
        this.rectWidth,
        rectHeight,
        20
      );
      ctx.restore();
    }

    ctx.fill();
  }

  initCapYPositionArray() {
    this.capYPositionArray.length = 0;
  }

  drawBarWaveform(ctx: CanvasRenderingContext2D, datas: Uint8Array) {
    const len = datas.length;
    const offset = Math.floor(len * 2);
    const waveformList = new Array(offset);

    for (let i = 0; i < offset; i++) {
      waveformList[i] = i < len ? datas[len - 1 - i] : datas[i - len];
    }

    const marginX = 200;
    const marginY = 400;
    const { width, height } = ctx.canvas;
    const xStart = marginX;
    const yStart = height - marginY;
    // const xEnd = width - marginX;
    const yEnd = marginY;

    const meterWidth = 24;
    const gap = 4;
    const meterNum = (width - marginX * 2) / (meterWidth + gap);
    const step = Math.round(waveformList.length / meterNum);
    const capHeight = 5;
    // const capStyle = "#fff";
    const gradient = ctx.createLinearGradient(
      xStart,
      yEnd,
      (width / 2 - marginX) * window.devicePixelRatio,
      (height / 2 - marginY) * window.devicePixelRatio
    );
    gradient.addColorStop(1, "#0f0");
    gradient.addColorStop(0.5, "#ff0");
    gradient.addColorStop(0, "#f00");

    ctx.beginPath();

    for (var i = 0; i < meterNum; i++) {
      const value = Math.max(waveformList[i * step] * 3, 10);

      if (this.capYPositionArray.length < Math.round(meterNum)) {
        this.capYPositionArray.push(value);
      }
      // ctx.fillStyle = capStyle;
      ctx.fillStyle = gradient;
      if (value < this.capYPositionArray[i]) {
        ctx.fillRect(
          xStart + i * (meterWidth + gap),
          yStart - --this.capYPositionArray[i],
          meterWidth,
          capHeight
        );
      } else {
        ctx.fillRect(
          xStart + i * (meterWidth + gap),
          yStart - value,
          meterWidth,
          capHeight
        );
        this.capYPositionArray[i] = value;
      }

      ctx.fillStyle = gradient;
      ctx.roundRect(
        xStart + i * (meterWidth + gap),
        yStart - value + capHeight,
        meterWidth,
        value,
        2
      );
    }
    ctx.fill();
  }
}

export default new WaveformEffect();
