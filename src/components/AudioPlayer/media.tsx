import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import audioAnalyser from "./audioAnalyser";

interface MediaProps {
  src: string;
}

// function fetchSourceToBlob(url: string) {
//   return window
//     .fetch(url)
//     .then((res) => res.blob())
//     .then((blob) => window.URL.createObjectURL(blob));
// }

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
    // @ts-ignore
    <video ref={mediaRef} controls name="media">
      <source src={src} type="video/mp4"></source>
    </video>
  );
});

export default MediaElement;
