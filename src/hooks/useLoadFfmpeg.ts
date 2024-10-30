import { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

/**
 * cdn地址
 * 知乎的unpkg
 */
const BASE_URL = "https://unpkg.zhihu.com/@ffmpeg/core@0.12.6/dist/esm";

export const useLoadFfmpeg = () => {
  const ffmpegRef = useRef<FFmpeg>(new FFmpeg());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);

    const ffmpeg = ffmpegRef.current;
    await ffmpeg.load({
      coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${BASE_URL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
    });

    setLoading(false);
  };

  return { ffmpegRef, loading };
};
