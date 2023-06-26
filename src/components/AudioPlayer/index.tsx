import React, { useState, useRef, useEffect, Fragment } from "react";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import audioAnalyser from "./audioAnalyser";
import { loadImage } from "../../utils";
import musicUrl from "../../music/C400003VLsik0ztbIb.mp4";
import coverUrl from "../../music/T002R300x300M000002Neh8l0uciQZ_1.webp";

enum MusicEffect {
  ARC = "arc-waveform",
  BAR = "bar-waveform",
}

const effects = ["arc-waveform", "bar-waveform"];
const radius = 450;
const coverRadius = radius - 30;
const rectWidth = 5;
let rotation = 0; // 初始旋转角度

const capYPositionArray: number[] = [];

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
}));

const AudioPlayer: React.FC = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [effect, setEffect] = useState<MusicEffect>(MusicEffect.ARC);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const loopIdRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const coverRef = useRef<HTMLImageElement | null>(null);
  const lastEffect = useRef<MusicEffect>(MusicEffect.ARC);
  lastEffect.current = effect;
  const classes = useStyles();

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    ctxRef.current = canvasRef.current?.getContext(
      "2d"
    ) as CanvasRenderingContext2D;
    const draftArray: Uint8Array = new Uint8Array(256);
    loadImage(coverUrl).then((img) => {
      coverRef.current = img as HTMLImageElement;
      if (!isPlayingRef.current) {
        renderCurrentTime(draftArray);
      }
    });
    renderCurrentTime(draftArray);
  }, []);

  useEffect(() => {
    capYPositionArray.length = 0;
  }, [effect]);

  // draw bg
  const renderBlurBg = () => {
    const ctx = ctxRef.current;
    if (!coverRef.current || !ctx) return;

    const { width, height } = ctx.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.save();
    ctx.fillStyle = "#ffffff00";
    ctx.filter = "blur(80px)";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(coverRef.current, -centerX, -centerY, width * 2, height * 2);
    ctx.restore();
  };

  // draw cover
  const renderCover = () => {
    const ctx = ctxRef.current;
    if (!coverRef.current || !ctx) return;

    const { width, height } = ctx.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, coverRadius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(
      coverRef.current,
      centerX - coverRadius,
      centerY - coverRadius,
      coverRadius * 2,
      coverRadius * 2
    );
    ctx.restore();
    // 更新旋转角度
    rotation += 0.01;
  };

  const renderArcWaveform = (
    ctx: CanvasRenderingContext2D,
    datas: number[]
  ) => {
    const { width, height } = ctx.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const startAngle = Math.PI; // 270 度
    const rectCount = datas.length;
    ctx.strokeStyle = ctx.fillStyle = "#ec9446";
    ctx.beginPath();
    for (let i = 0; i < rectCount; i++) {
      const rectHeight = Math.max(datas[i] * 0.5, 5);
      const angle = startAngle + (i / rectCount) * 2 * Math.PI;
      const rectX = centerX + radius * Math.cos(angle) - rectWidth / 2;
      const rectY = centerY + radius * Math.sin(angle) - rectHeight / 2;
      const rectAngle = angle + Math.PI / 2;

      ctx.save();
      ctx.translate(rectX + rectWidth / 2, rectY + rectHeight / 2);
      ctx.rotate(rectAngle);
      // ctx.fillRect(-rectWidth / 2, -rectHeight, rectWidth, rectHeight);
      // ! chrome99+
      ctx.roundRect(-rectWidth / 2, -rectHeight, rectWidth, rectHeight, 20);
      ctx.restore();
    }
    ctx.fill();
  };

  const renderBarWaveform = (
    ctx: CanvasRenderingContext2D,
    datas: number[]
  ) => {
    const marginX = 200;
    const marginY = 400;
    const { width, height } = ctx.canvas;
    const xStart = marginX;
    const yStart = height - marginY;
    const xEnd = width - marginX;
    const yEnd = marginY;

    const meterWidth = 24;
    const gap = 4;
    const meterNum = (width - marginX * 2) / (meterWidth + gap);
    const step = Math.round(datas.length / meterNum);
    const capHeight = 5;
    const capStyle = "#fff";
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
      const value = Math.max(datas[i * step] * 3, 10);

      if (capYPositionArray.length < Math.round(meterNum)) {
        capYPositionArray.push(value);
      }
      // ctx.fillStyle = capStyle;
      ctx.fillStyle = gradient;
      if (value < capYPositionArray[i]) {
        ctx.fillRect(
          xStart + i * (meterWidth + gap),
          yStart - --capYPositionArray[i],
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
        capYPositionArray[i] = value;
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
  };

  const renderCurrentTime = (datas: Uint8Array) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    renderBlurBg();

    const len = datas.length;

    if (lastEffect.current === MusicEffect.ARC) {
      renderCover();
      const offset = Math.floor((len * 2) / 3);
      const waveformList = new Array(offset * 2);
      for (let i = 0; i < offset; i++) {
        waveformList[i] = waveformList[waveformList.length - i - 1] = datas[i];
      }
      renderArcWaveform(ctx, waveformList);
    }

    if (lastEffect.current === MusicEffect.BAR) {
      const offset = Math.floor(len * 2);
      const waveformList = new Array(offset);
      for (let i = 0; i < offset; i++) {
        waveformList[i] = i < len ? datas[len - 1 - i] : datas[i - len];
      }
      renderBarWaveform(ctx, waveformList);
    }
  };

  const loopEffect = () => {
    if (!isPlayingRef.current) {
      window.cancelAnimationFrame(loopIdRef.current!);
      return;
    }
    audioAnalyser.analyser.getByteFrequencyData(audioAnalyser.buffer);

    renderCurrentTime(audioAnalyser.buffer);
    loopIdRef.current = window.requestAnimationFrame(loopEffect);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      audioAnalyser.createAnalyser(audioRef.current);
    }
  };

  const handleOnPlay = () => {
    isPlayingRef.current = true;
    loopEffect();
  };

  const handleOnPause = () => {
    isPlayingRef.current = false;
  };

  return (
    <Fragment>
      <div className={`effects ${classes.root}`}>
        {effects.map((v, i) => (
          <Button
            key={i}
            variant="contained"
            color="primary"
            onClick={() => setEffect(v as MusicEffect)}
          >
            {v}
          </Button>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        width={size.width * window.devicePixelRatio}
        height={size.height * window.devicePixelRatio}
        style={{ width: size.width, height: size.height }}
      />
      <audio
        controls
        preload="auto"
        crossOrigin="anonymous"
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlayThrough={() => console.log("canplay")}
        onPlay={handleOnPlay}
        onSeeking={() => console.log("loading...")}
        onSeeked={() => console.log("loaded")}
        onPause={handleOnPause}
      >
        <source src={musicUrl} type="audio/mpeg" />
      </audio>
    </Fragment>
  );
};

export default AudioPlayer;
