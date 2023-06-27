import React, { useState, useRef, useEffect, Fragment } from "react";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import { SketchPicker } from "react-color";
import audioAnalyser from "./audioAnalyser";
import waveformEffect from "./effect";
import { loadImage } from "../../utils";

enum MusicEffect {
  ARC = "arc-waveform",
  ARC_LINE = "arc-line-waveform",
  BAR = "bar-waveform",
}

const useStyles = makeStyles((theme) => ({
  root: { "& > *": { margin: theme.spacing(1) } },
}));

const AudioPlayer: React.FC = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [effect, setEffect] = useState<MusicEffect>(MusicEffect.ARC);
  const [color, setColor] = useState(waveformEffect.getWaveColor());

  // const audioRef = useRef<HTMLAudioElement>(null);
  const audioRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const loopIdRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const coverRef = useRef<HTMLImageElement | null>(null);
  const lastEffect = useRef<MusicEffect>(MusicEffect.ARC);

  lastEffect.current = effect;
  const classes = useStyles();

  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext("2d");
    }
    const draftArray: Uint8Array = new Uint8Array(256);
    renderCurrentTime(draftArray);
    loadImage(
      process.env.PUBLIC_URL +
        "/static/music/light/T002R300x300M000001bxCCd4F99oN_1.webp"
    ).then((img) => {
      coverRef.current = img as HTMLImageElement;
      if (!isPlayingRef.current) {
        renderCurrentTime(draftArray);
      }
    });
  }, []);

  useEffect(() => {
    audioAnalyser.analyser.getByteFrequencyData(audioAnalyser.buffer);
    renderCurrentTime(audioAnalyser.buffer);
  }, [size]);

  useEffect(() => {
    waveformEffect.initCapYPositionArray();
  }, [effect]);

  const renderCurrentTime = (datas: Uint8Array) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    waveformEffect.drawBlurBg(coverRef.current, ctx);

    if (lastEffect.current === MusicEffect.ARC) {
      waveformEffect.drawCover(coverRef.current, ctx);
      waveformEffect.drawArcWaveform(ctx, datas);
    }

    if (lastEffect.current === MusicEffect.ARC_LINE) {
      waveformEffect.drawCover(coverRef.current, ctx);
      waveformEffect.drawArcLineWaveform(ctx, datas);
    }

    if (lastEffect.current === MusicEffect.BAR) {
      waveformEffect.drawBarWaveform(ctx, datas);
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
    if (!audioRef.current) return;

    audioAnalyser.createAnalyser(audioRef.current);
  };

  const handleOnPlay = () => {
    isPlayingRef.current = true;
    loopEffect();
  };

  const handleOnPause = () => {
    isPlayingRef.current = false;
  };

  const handleChangeColor = (color) => {
    setColor(color.rgb);
    waveformEffect.updateWaveColor(color.rgb);
  };

  return (
    <Fragment>
      <div className={`effects ${classes.root}`}>
        {Object.entries(MusicEffect).map(([key, value]) => (
          <Button
            key={key}
            variant="contained"
            color="primary"
            onClick={() => setEffect(value)}
          >
            {value}
          </Button>
        ))}
      </div>
      <div className="sketchPicker">
        <span style={{ color: `rgb(${color.r}, ${color.g}, ${color.b})` }}>
          wave color
        </span>
        <SketchPicker
          disableAlpha
          color={color}
          // onChangeComplete={handleChangeColor}
          onChange={handleChangeColor}
        />
      </div>
      <canvas
        ref={canvasRef}
        width={size.width * window.devicePixelRatio}
        height={size.height * window.devicePixelRatio}
        style={{ width: size.width, height: size.height }}
      />
      {/* <audio
        controls
        autoPlay
        // crossOrigin="anonymous"
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handleOnPlay}
        onPause={handleOnPause}
        onCanPlayThrough={() => console.log("canplay")}
        onSeeking={() => console.log("seeking...")}
        onSeeked={() => console.log("seeked")}
      >
        <source
          src={process.env.PUBLIC_URL + "/static/music/C400001hagjX2qGWlP.mp3"}
          type="video/mp4"
        />
      </audio> */}
      <video
        controls
        autoPlay
        crossOrigin="anonymous"
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handleOnPlay}
        onPause={handleOnPause}
        onCanPlayThrough={() => console.log("canplay")}
        onSeeking={() => console.log("seeking...")}
        onSeeked={() => console.log("seeked")}
      >
        <source
          src={process.env.PUBLIC_URL + "/static/music/light/C40000269pkB4fcQVa.mp4"}
          type="video/mp4"
        />
      </video>
    </Fragment>
  );
};

export default AudioPlayer;
