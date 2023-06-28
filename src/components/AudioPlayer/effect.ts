class WaveformEffect {
  // color
  private r = 236;
  private g = 148;
  private b = 70;

  // arc
  private radius = Math.min(window.innerWidth - 100, 450);
  private coverRadius = this.radius - 30;
  private rectWidth = 5; // 初始旋转角度

  // arc-line
  private arcLineMaxMultiple = 0.8;
  private arcLineMultipleStep = 0.1;
  private prevPoints: { angle: number; wave: number }[][] = [];
  private prevPointLength = 7;

  // arc-line-dotted
  private arcLineDottedMultiple = 0.3;

  // common
  private rotation = 0;

  // bar
  private capYPositionArray: number[] = [];

  waveColor(opacity = 1) {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${opacity})`;
  }

  updateWaveColor(color: { r: number; g: number; b: number }) {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
  }

  getWaveColor() {
    return {
      r: this.r,
      g: this.g,
      b: this.b,
    };
  }

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

    ctx.strokeStyle = ctx.fillStyle = this.waveColor();
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
      if (ctx.roundRect) {
        // ! chrome99+
        ctx.roundRect(
          -this.rectWidth / 2,
          -rectHeight,
          this.rectWidth,
          rectHeight,
          20
        );
      } else {
        ctx.rect(-this.rectWidth / 2, -rectHeight, this.rectWidth, rectHeight);
      }

      ctx.restore();
    }

    ctx.fill();
  }

  drawArcLineWaveform(ctx: CanvasRenderingContext2D, datas: Uint8Array) {
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
    const point: { angle: number; wave: number }[] = [];

    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = ctx.fillStyle = this.waveColor();
    ctx.beginPath();

    let firstPoint = { x: 0, y: 0 };
    let prevPoint = { x: 0, y: 0 };

    for (let i = 0; i < rectCount; i++) {
      const angle = startAngle + (i / rectCount) * 2 * Math.PI;
      const pointRadius =
        this.radius + Math.max(waveformList[i] * this.arcLineMaxMultiple, 5);
      const x = centerX + pointRadius * Math.cos(angle);
      const y = centerY + pointRadius * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(x, y);
        firstPoint.x = x;
        firstPoint.y = y;
      } else {
        const controlX = (x + prevPoint.x) / 2;
        const controlY = (y + prevPoint.y) / 2;
        ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, controlX, controlY);
      }

      prevPoint.x = x;
      prevPoint.y = y;

      point.push({ angle, wave: waveformList[i] });
    }

    const controlX = (firstPoint.x + prevPoint.x) / 2;
    const controlY = (firstPoint.y + prevPoint.y) / 2;
    ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, controlX, controlY);

    ctx.closePath();
    ctx.stroke();

    this.prevPoints.push(point);
    if (this.prevPoints.length > this.prevPointLength) {
      this.prevPoints.shift();
    }

    this.prevPoints.forEach((item, index) => {
      const multiple =
        this.arcLineMaxMultiple - this.arcLineMultipleStep * (index + 1);
      ctx.strokeStyle = this.waveColor(1 - index / this.prevPoints.length);
      ctx.beginPath();

      for (let i = 0; i < item.length; i++) {
        const pointRadius = this.radius + Math.max(item[i].wave * multiple, 5);
        const x = centerX + pointRadius * Math.cos(item[i].angle);
        const y = centerY + pointRadius * Math.sin(item[i].angle);
        if (i === 0) {
          ctx.moveTo(x, y);
          firstPoint.x = x;
          firstPoint.y = y;
        } else {
          const controlX = (x + prevPoint.x) / 2;
          const controlY = (y + prevPoint.y) / 2;
          ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, controlX, controlY);
        }
        prevPoint.x = x;
        prevPoint.y = y;
      }

      const controlX = (firstPoint.x + prevPoint.x) / 2;
      const controlY = (firstPoint.y + prevPoint.y) / 2;
      ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, controlX, controlY);

      ctx.closePath();
      ctx.stroke();
    });
  }

  drawArcLineDottedWaveform(ctx: CanvasRenderingContext2D, datas: Uint8Array) {
    const step = 5;
    const len = datas.length;
    const waveformList = new Array(len);

    for (let i = 0; i < len + step; i++) {
      waveformList[i] = datas[i] ?? datas[0];
    }

    const { width, height } = ctx.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const startAngle = Math.PI; // 270 度
    const rectCount = waveformList.length;

    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = ctx.fillStyle = this.waveColor(0.5);
    ctx.beginPath();

    let firstPoint = { x: 0, y: 0 };
    let prevPoint = { x: 0, y: 0 };

    for (let i = 0; i < rectCount; i += step) {
      const angle = startAngle + (i / rectCount) * 2 * Math.PI;
      const pointRadius =
        this.radius + Math.max(waveformList[i] * this.arcLineDottedMultiple, 5);
      const x = centerX + pointRadius * Math.cos(angle);
      const y = centerY + pointRadius * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(x, y);
        firstPoint.x = x;
        firstPoint.y = y;
      } else {
        const controlX = (x + prevPoint.x) / 2;
        const controlY = (y + prevPoint.y) / 2;
        ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, controlX, controlY);
      }

      prevPoint.x = x;
      prevPoint.y = y;
    }

    const controlX = (firstPoint.x + prevPoint.x) / 2;
    const controlY = (firstPoint.y + prevPoint.y) / 2;
    ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, controlX, controlY);

    ctx.closePath();
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
      if (ctx.roundRect) {
        // ! chrome99+
        ctx.roundRect(
          xStart + i * (meterWidth + gap),
          yStart - value + capHeight,
          meterWidth,
          value,
          2
        );
      } else {
        ctx.rect(
          xStart + i * (meterWidth + gap),
          yStart - value + capHeight,
          meterWidth,
          value
        );
      }
    }
    ctx.fill();
  }
}

const waveformEffect = new WaveformEffect();

export default waveformEffect;
