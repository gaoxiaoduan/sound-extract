import { Mp3Encoder } from '@breezystack/lamejs';

self.onmessage = (e: MessageEvent) => {
  const { channelData, sampleRate, bitrate } = e.data;
  
  const channels = Math.min(channelData.length, 2);
  const bitrateKbps = parseInt(bitrate) || 192;
  
  const mp3encoder = new Mp3Encoder(channels, sampleRate, bitrateKbps);
  const mp3Data: Uint8Array[] = [];
  
  // Convert Float32Array to Int16Array
  const int16Channels = channelData.slice(0, channels).map((floatData: Float32Array) => {
    const int16Data = new Int16Array(floatData.length);
    for (let i = 0; i < floatData.length; i++) {
      const s = Math.max(-1, Math.min(1, floatData[i]));
      int16Data[i] = s < 0 ? s * 32768 : s * 32767;
    }
    return int16Data;
  });
  
  const sampleBlockSize = 1152;
  const length = int16Channels[0].length;
  
  for (let i = 0; i < length; i += sampleBlockSize) {
    const progress = Math.min(Math.round((i / length) * 100), 99);
    (self as any).postMessage({ type: 'progress', progress });
    
    let mp3buf: any;
    if (channels === 2) {
      const leftChunk = int16Channels[0].subarray(i, i + sampleBlockSize);
      const rightChunk = int16Channels[1].subarray(i, i + sampleBlockSize);
      mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
    } else {
      const monoChunk = int16Channels[0].subarray(i, i + sampleBlockSize);
      mp3buf = mp3encoder.encodeBuffer(monoChunk);
    }
    
    if (mp3buf.length > 0) {
      mp3Data.push(new Uint8Array(mp3buf));
    }
  }
  
  const endBuf = mp3encoder.flush();
  if (endBuf.length > 0) {
    mp3Data.push(new Uint8Array(endBuf));
  }
  
  // Combine all buffers
  const totalLength = mp3Data.reduce((acc, buf) => acc + buf.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of mp3Data) {
    result.set(buf, offset);
    offset += buf.length;
  }
  
  (self as any).postMessage({ type: 'done', buffer: result.buffer }, [result.buffer]);
};
