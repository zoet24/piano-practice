import { useRef } from "react";

export const useAudio = () => {
  const cache = useRef<Record<string, HTMLAudioElement>>({});

  const playNote = (url: string) => {
    if (!url) return;

    if (!cache.current[url]) {
      cache.current[url] = new Audio(url);
    }

    const audio = cache.current[url];
    audio.currentTime = 0;
    audio.play();
  };

  const playMultiple = (urls: string[]) => {
    urls.forEach((url) => playNote(url));
  };

  return { playNote, playMultiple };
};
