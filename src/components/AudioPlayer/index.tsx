import React, { useState, useRef, useEffect, Fragment } from "react";
import audioAnalyser from "./audioAnalyser";
import { loadImage } from "../../utils";
import musicUrl from "../../music/5458_560e_0e5c_c2b021013fadd328f32b968bd9f15cb6.m4a";
import coverUrl from "../../music/109951163580419226.jpeg";

// const musicUrl =
//   "https://m701.music.126.net/20230626004502/4ee310eb6f9cf0bfe30ea81e84fc413b/jdyyaac/5458/560e/0e5c/c2b021013fadd328f32b968bd9f15cb6.m4a";
// const coverUrl =
//   "http://p2.music.126.net/e9NayWFI395VUeYantarWg==/109951163580419226.jpg?param=130y130";

const radius = 450;
const coverRadius = radius - 30;
const rectWidth = 5;
let rotation = 0; // 初始旋转角度

const AudioPlayer: React.FC = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const loopIdRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const coverRef = useRef<HTMLImageElement | null>(null);

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
    const draftArray = Array.from({ length: 256 }, () => 5);
    loadImage(coverUrl).then((img) => {
      coverRef.current = img as HTMLImageElement;
      if (!isPlayingRef.current) {
        draw(draftArray);
      }
    });
    draw(draftArray);
  }, []);

  const draw = (datas: number[]) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const startAngle = Math.PI; // 270 度
    const rectCount = datas.length;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (coverRef.current) {
      ctx.save();
      ctx.fillStyle = "#ffffff00";
      ctx.filter = "blur(80px)";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(
        coverRef.current,
        -ctx.canvas.width / 2,
        -ctx.canvas.height / 2,
        ctx.canvas.width * 2,
        ctx.canvas.height * 2
      );
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        ctx.canvas.width / 2,
        ctx.canvas.height / 2,
        coverRadius,
        0,
        2 * Math.PI
      );
      ctx.closePath();
      ctx.clip();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.translate(-centerX, -centerY);
      ctx.drawImage(
        coverRef.current,
        ctx.canvas.width / 2 - coverRadius,
        ctx.canvas.height / 2 - coverRadius,
        coverRadius * 2,
        coverRadius * 2
      );
      ctx.restore();
      // 更新旋转角度
      rotation += 0.01;
    }

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

  const update = () => {
    if (!isPlayingRef.current) {
      window.cancelAnimationFrame(loopIdRef.current!);
      return;
    }
    audioAnalyser.analyser.getByteFrequencyData(audioAnalyser.buffer);

    const offset = Math.floor((audioAnalyser.buffer.length * 2) / 3);
    const datas = new Array(offset * 2);
    for (let i = 0; i < offset; i++) {
      datas[i] = datas[datas.length - i - 1] = audioAnalyser.buffer[i];
    }

    // draw(audioAnalyser.buffer);
    draw(datas);
    loopIdRef.current = window.requestAnimationFrame(update);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      audioAnalyser.createAnalyser(audioRef.current);
    }
  };

  const handleOnPlay = () => {
    isPlayingRef.current = true;
    update();
  };

  const handleOnPause = () => {
    isPlayingRef.current = false;
  };

  return (
    <Fragment>
      <canvas
        ref={canvasRef}
        width={size.width * window.devicePixelRatio}
        height={size.height * window.devicePixelRatio}
        style={{ width: size.width, height: size.height }}
      />
      <audio
        controls
        crossOrigin="anonymous"
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
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
