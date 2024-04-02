import {
  useRef,
  useEffect,
  createRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

interface MediaProps {
  src: string;
}

const MEDIA_EVENTS = [
  "abort",
  "canplay",
  "canplaythrough",
  "durationchange",
  "emptied",
  "encrypted",
  "ended",
  "error",
  "loadeddata",
  "loadedmetadata",
  "loadstart",
  "pause",
  "play",
  "playing",
  "progress",
  "ratechange",
  "resize",
  "seeked",
  "seeking",
  "stalled",
  "suspend",
  "timeupdate",
  "volumechange",
  "waiting",
];

const MediaElement: ForwardRefExoticComponent<
  MediaProps & RefAttributes<unknown>
> = forwardRef<unknown, MediaProps>((props, ref) => {
  const { src } = props;
  const mediaRef = createRef<HTMLVideoElement>();
  const initialized = useRef<boolean>(false);

  useImperativeHandle(ref, () => mediaRef.current);

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    MEDIA_EVENTS.forEach((event) => {
      mediaRef.current!.addEventListener(event, () => {
        console.log(">>>>>>", event);
      });
    });
    // eslint-disable-next-line
  }, []);

  return <audio ref={mediaRef} src={src} controls />;
});

export default MediaElement;
