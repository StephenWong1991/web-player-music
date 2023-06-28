import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import audioAnalyser from "./audioAnalyser";

interface MediaProps {
  src: string;
}

const MediaElement: ForwardRefExoticComponent<
  MediaProps & RefAttributes<unknown>
> = forwardRef<unknown, MediaProps>((props, ref) => {
  const { src } = props;
  const mediaRef = useRef<HTMLVideoElement>(null);
  const initialized = useRef<boolean>(false);

  useImperativeHandle(ref, () => mediaRef.current);

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;
    const media = mediaRef.current!;

    media.addEventListener("loadedmetadata", () => {
      console.log("loadedmetadata");
      audioAnalyser.createAnalyser(media);
    });
    media.addEventListener("canplaythrough", () => {
      console.log("canplaythrough");
      media.play();
    });
    media.addEventListener("play", () => {
      console.log("play");
    });
    media.addEventListener("pause", () => {
      console.log("pause");
    });
    media.addEventListener("seeking", () => {
      console.log("seeking");
    });
    media.addEventListener("seeked", () => {
      console.log("seeked");
    });
  }, []);

  return (
    // <video controls autoPlay name="media">
    //   <source src={src} type="video/mp4" />
    // </video>
    <video ref={mediaRef} controls autoPlay src={src} />
  );
});

export default MediaElement;
