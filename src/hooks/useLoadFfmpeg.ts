import { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

/**
 * 检查 Worker 和 SharedArrayBuffer 支持
 */
const checkEnvironmentSupport = () => {
  try {
    return {
      hasWorker: typeof Worker !== 'undefined',
      hasSharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined'
    };
  } catch {
    return {
      hasWorker: false,
      hasSharedArrayBuffer: false
    };
  }
};

const { hasWorker, hasSharedArrayBuffer } = checkEnvironmentSupport();
const isMultiThreadSupported = hasWorker && hasSharedArrayBuffer;

/**
 * cdn地址
 * 知乎的unpkg
 */
const BASE_URL = isMultiThreadSupported
  ? "https://unpkg.zhihu.com/@ffmpeg/core-mt@0.12.6/dist/esm"
  : "https://unpkg.zhihu.com/@ffmpeg/core@0.12.6/dist/esm";

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
      ...(isMultiThreadSupported && {
        workerURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.worker.js`, 'text/javascript'),
      }),
    });

    setLoading(false);
  };

  return { ffmpegRef, loading };
};
