import audioAnalyser from "./audioAnalyser";

export function createAudio(src: string) {
  const audio = new Audio();
  audio.controls = true;
  audio.src = src;

  audio.addEventListener("loadedmetadata", () => {
    console.log("loadedmetadata");
    audioAnalyser.createAnalyser(audio);
  });

  audio.addEventListener("canplaythrough", () => {
    console.log("canplaythrough");
    audio.play();
  });

  audio.addEventListener("play", () => {
    console.log("play");
  });

  audio.addEventListener("pause", () => {
    console.log("pause");
  });

  audio.addEventListener("seeking", () => {
    console.log("seeking");
  });

  audio.addEventListener("seeked", () => {
    console.log("seeked");
  });

  return audio;
}
