import { useState, useRef, useEffect, Fragment } from "react";
import audioAnalyser from "./audioAnalyser";
import imusic from "../../materials/卡奇社-日光倾城.flac";
import cover from "../../materials/T002R300x300M000004Q9eyj0RYSrw_1.webp";

const radius = 450;
const coverRadius = 430;
const rectWidth = 5;

let rotation = 0; // 初始旋转角度

const loadImage = async (src) => {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.src = src;
  });
};

const AudioPlayer = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const audioRef = useRef();
  const canvasRef = useRef();
  const ctxRef = useRef();
  const loopIdRef = useRef();
  const isPlayingRef = useRef();
  const coverRef = useRef();

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
    ctxRef.current = canvasRef.current.getContext("2d");
    const draftArray = Array.from({ length: 256 }, () => 5);
    loadImage(cover).then((img) => {
      coverRef.current = img;
      if (!isPlayingRef.current) {
        draw(draftArray);
      }
    });
    draw(draftArray);
  }, []);

  const draw = (datas) => {
    const ctx = ctxRef.current;
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const startAngle = Math.PI; // 270 度
    const rectCount = datas.length;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (coverRef.current) {
      ctx.save();
      ctx.fillStyle = "#ffffff00";
      ctx.filter = `blur(80px)`;
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

    ctx.strokeStyle = ctx.fillStyle = "blue";

    ctx.beginPath();
    for (let i = 0; i < rectCount; i++) {
      const rectHeight = Math.max(datas[i] * 0.3, 5);
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
      window.cancelAnimationFrame(loopIdRef.current);
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

  const handleLoadedData = () => {
    audioAnalyser.createAnalyser(audioRef.current);
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
        src={imusic}
        controls
        ref={audioRef}
        onLoadedData={handleLoadedData}
        onPlay={handleOnPlay}
        onSeeking={() => console.log("loading...")}
        onSeeked={() => console.log("loaded")}
        onPause={handleOnPause}
      ></audio>
    </Fragment>
  );
};

export default AudioPlayer;
