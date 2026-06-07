import { useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { messageApi } from "../components";

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

const BASE_URL = `${window.location.origin}/ffmpeg/${isMultiThreadSupported ? 'core-mt' : 'core'}`;

export const useLoadFfmpeg = () => {
  const ffmpegRef = useRef<FFmpeg>(new FFmpeg());
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadFfmpeg = async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.load({
        coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
        ...(isMultiThreadSupported && {
          workerURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.worker.js`, 'text/javascript'),
        }),
      });
      setLoaded(true);
    } catch (e) {
      messageApi.error("加载FFmpeg失败,请重试");
      console.error("加载FFmpeg失败,请重试", e);
    } finally {
      setLoading(false);
    }
  };

  return { ffmpegRef, loading, loaded, loadFfmpeg };
};
