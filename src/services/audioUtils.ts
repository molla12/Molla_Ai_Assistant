/**
 * Resamples Float32 audio buffer from source sample rate to target sample rate (e.g. 48kHz/44.1kHz to 16kHz)
 */
export function resampleAudio(
  inputData: Float32Array,
  sourceRate: number,
  targetRate: number
): Float32Array {
  if (sourceRate === targetRate) {
    return inputData;
  }
  const ratio = sourceRate / targetRate;
  const targetLength = Math.round(inputData.length / ratio);
  const result = new Float32Array(targetLength);
  for (let i = 0; i < targetLength; i++) {
    const originalIndex = i * ratio;
    const indexFloor = Math.floor(originalIndex);
    const indexCeil = Math.min(inputData.length - 1, indexFloor + 1);
    const fraction = originalIndex - indexFloor;
    result[i] = inputData[indexFloor] * (1 - fraction) + inputData[indexCeil] * fraction;
  }
  return result;
}

/**
 * Converts Float32Array (-1.0 to 1.0) into 16-bit PCM little-endian ArrayBuffer
 */
export function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

/**
 * Encodes ArrayBuffer into Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes 24kHz 16-bit PCM little-endian Base64 audio into Float32Array
 */
export function base64ToFloat32Array(base64: string): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const dataView = new DataView(bytes.buffer);
  const numSamples = Math.floor(bytes.length / 2);
  const float32 = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    float32[i] = int16 / 32768.0;
  }
  return float32;
}

/**
 * Builds a standard WAV Blob from 16-bit PCM samples
 */
export function pcm16ToWavBlob(samples: Int16Array, sampleRate: number = 24000, numChannels: number = 1): Blob {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeStr(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF header
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');

  // Format chunk
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // 16 bits per sample

  // Data chunk
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  // PCM samples
  const offset = 44;
  for (let i = 0; i < samples.length; i++) {
    view.setInt16(offset + i * 2, samples[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Merges an array of Base64 PCM 16-bit audio chunks into a playable WAV Blob
 */
export function base64ChunksToWavBlob(chunks: string[], sampleRate: number = 24000): Blob {
  if (chunks.length === 0) {
    return new Blob([], { type: 'audio/wav' });
  }

  let totalBytes = 0;
  const decodedBuffers: Uint8Array[] = [];
  for (const b64 of chunks) {
    try {
      const bin = atob(b64);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        u8[i] = bin.charCodeAt(i);
      }
      decodedBuffers.push(u8);
      totalBytes += u8.length;
    } catch {}
  }

  const mergedU8 = new Uint8Array(totalBytes);
  let pos = 0;
  for (const buf of decodedBuffers) {
    mergedU8.set(buf, pos);
    pos += buf.length;
  }

  const samples = new Int16Array(mergedU8.buffer, mergedU8.byteOffset, Math.floor(mergedU8.length / 2));
  return pcm16ToWavBlob(samples, sampleRate, 1);
}
