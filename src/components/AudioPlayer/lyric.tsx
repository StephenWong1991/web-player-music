const regex = /\[(.*?)\](.*)/;

class Lyric {
  private lyricData: { time: number; text: string }[] = [];
  private lyricCanvas: HTMLCanvasElement = document.createElement("canvas");
  private lyricCtx: CanvasRenderingContext2D | null =
    this.lyricCanvas.getContext("2d");

  // color
  private r = 236;
  private g = 148;
  private b = 70;

  constructor() {
    document.body.appendChild(this.lyricCanvas);
  }

  parseLyric(lyric: string[]): void {
    this.lyricData = [];
    for (let i = 0; i < lyric.length; i++) {
      const matches = lyric[i].match(regex);
      if (matches) {
        const time = matches[1];
        const text = matches[2];
        const timeParts = time.split(":");
        const minutes = Number(timeParts[0]);
        const seconds = Number(timeParts[1]);
        const totalSeconds = minutes * 60 + seconds;
        this.lyricData.push({ time: totalSeconds, text: text });
      }
    }
  }

  updateColor(color: { r: number; g: number; b: number }) {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
  }

  findCurrentTimeLyric(time: number): {
    lyric: string;
    startTime: number;
    endTime: number;
  } {
    for (let i = 0; i < this.lyricData.length; i++) {
      const next = Math.min(i + 1, this.lyricData.length - 1);
      if (time >= this.lyricData[i].time && time < this.lyricData[next].time) {
        return {
          lyric: this.lyricData[i].text,
          startTime: this.lyricData[i].time,
          endTime: this.lyricData[next].time,
        };
      }
    }
    return {
      lyric: "",
      startTime: 0,
      endTime: 0,
    };
  }

  drawLyric(audio: HTMLAudioElement, ctx: CanvasRenderingContext2D): void {
    const currentTime = audio.currentTime;
    const { lyric, startTime, endTime } =
      this.findCurrentTimeLyric(currentTime);
    const fontSize = 80;
    const startY = 150;

    ctx.save();

    ctx.font = `bold ${fontSize}px serif`;
    ctx.globalAlpha = 1;
    ctx.textBaseline = "bottom";
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";

    const textWidth = ctx.measureText(lyric).width;
    const startX = ctx.canvas.width * 0.5 - textWidth * 0.5;
    const percent = (currentTime - startTime) / (endTime - startTime);
    ctx.fillText(lyric, startX, startY);

    this.lyricCanvas.width = ctx.canvas.width;
    this.lyricCanvas.height = ctx.canvas.height;
    this.lyricCanvas.style.width = ctx.canvas.style.width;
    this.lyricCanvas.style.height = ctx.canvas.style.height;
    this.lyricCtx!.font = `bold ${fontSize}px serif`;
    this.lyricCtx!.globalAlpha = 1;
    this.lyricCtx!.textBaseline = "bottom";
    this.lyricCtx!.textAlign = "left";
    this.lyricCtx!.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`;
    this.lyricCtx!.fillText(lyric, startX, startY);
    const startClearX = startX + textWidth * percent;
    this.lyricCtx!.clearRect(
      startClearX,
      0,
      this.lyricCanvas.width - startClearX,
      this.lyricCanvas.height
    );
    ctx.drawImage(this.lyricCanvas, 0, 0);

    ctx.restore();
  }
}

const lyric = new Lyric();

export default lyric;
