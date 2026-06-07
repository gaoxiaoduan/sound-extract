import Mp3Worker from './mp3-encoder.worker?worker';

export interface ExtractOptions {
  bitrate: '128k' | '192k' | '320k';
  onProgress: (progress: number) => void;
}

export const extractAudioFromVideo = async (
  videoFile: File,
  options: ExtractOptions
): Promise<Blob> => {
  const { bitrate, onProgress } = options;

  // 1. Read file as ArrayBuffer
  const arrayBuffer = await fileToArrayBuffer(videoFile);

  // 2. Decode using Web Audio API (Native browser code, extremely fast)
  onProgress(5); // Start progress
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContextClass();
  
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.error("Decoding audio data failed", err);
    throw new Error("Failed to decode video audio track. Make sure it's a valid video file.");
  } finally {
    await audioCtx.close();
  }

  onProgress(20); // Decoding completed, now encoding

  // 3. Extract channels data
  const channels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const channelData: Float32Array[] = [];
  
  for (let i = 0; i < channels; i++) {
    // Clone buffer data to transfer to worker
    channelData.push(audioBuffer.getChannelData(i).slice());
  }

  // 4. Spin up Worker for encoding to MP3
  return new Promise<Blob>((resolve, reject) => {
    const worker = new Mp3Worker();
    
    // Transfer the float buffers to the worker to avoid copying overhead
    const transferables = channelData.map(buf => buf.buffer);

    worker.postMessage({
      channelData,
      sampleRate,
      bitrate
    }, transferables);

    worker.onmessage = (e: MessageEvent) => {
      const { type, progress, buffer } = e.data;
      
      if (type === 'progress') {
        // Map 0-100% of worker progress to 20-100% of overall progress
        const overallProgress = 20 + Math.round(progress * 0.8);
        onProgress(overallProgress);
      } else if (type === 'done') {
        const mp3Blob = new Blob([buffer], { type: 'audio/mp3' });
        worker.terminate();
        resolve(mp3Blob);
      }
    };

    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };
  });
};

const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as ArrayBuffer"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};
