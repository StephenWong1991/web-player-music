import React, { useState, useRef, useEffect, Fragment } from "react";
import Button from "@material-ui/core/Button";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import { SketchPicker } from "react-color";
import { createAudio } from "./audio";
import audioAnalyser from "./audioAnalyser";
import waveformEffect from "./effect";
import { loadImage } from "../../utils";

import musicInfo from "../../mock";

enum MusicEffect {
  ARC = "arc",
  ARC_LINE = "arc-line",
  ARC_LINE_DOTTED = "arc-line-dotted",
  BAR = "bar",
}

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      display: "flex",
      "flex-direction": "column",
      margin: theme.spacing(1),
    },
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

const AudioPlayer: React.FC = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [effect, setEffect] = useState<MusicEffect>(MusicEffect.ARC);
  const [color, setColor] = useState<{ r: number; g: number; b: number }>(
    waveformEffect.getWaveColor()
  );
  const [open, setOpen] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const loopIdRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const coverRef = useRef<HTMLImageElement | null>(null);
  const lastEffect = useRef<MusicEffect>(MusicEffect.ARC);
  const initialized = useRef<boolean>(false);

  lastEffect.current = effect;
  const classes = useStyles();

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;
    const audio = createAudio(musicInfo.fileUrl);
    document.body.appendChild(audio);
    audio.addEventListener("canplaythrough", () => {
      setOpen(false);
    });
    audio.addEventListener("play", () => {
      isPlayingRef.current = true;
      loopEffect();
    });
    audio.addEventListener("pause", () => {
      isPlayingRef.current = false;
    });
  }, []);

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
    loadImage(musicInfo.coverUrl).then((img) => {
      coverRef.current = img as HTMLImageElement;
      if (!isPlayingRef.current) {
        renderCurrentTime(draftArray);
      }
    });
  }, []);

  useEffect(() => {
    audioAnalyser.analyser.getByteFrequencyData(audioAnalyser.buffer);
    renderCurrentTime(audioAnalyser.buffer);
  }, [size, color]);

  useEffect(() => {
    waveformEffect.initCapYPositionArray();
    audioAnalyser.analyser.getByteFrequencyData(audioAnalyser.buffer);
    renderCurrentTime(audioAnalyser.buffer);
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

    if (lastEffect.current === MusicEffect.ARC_LINE_DOTTED) {
      waveformEffect.drawArcLineDottedWaveform(ctx, datas);
      waveformEffect.drawCover(coverRef.current, ctx);
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
        <SketchPicker disableAlpha color={color} onChange={handleChangeColor} />
      </div>
      <canvas
        ref={canvasRef}
        width={size.width * window.devicePixelRatio}
        height={size.height * window.devicePixelRatio}
        style={{ width: size.width, height: size.height }}
      />
      <Backdrop className={classes.backdrop} open={open}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Fragment>
  );
};

export default AudioPlayer;
