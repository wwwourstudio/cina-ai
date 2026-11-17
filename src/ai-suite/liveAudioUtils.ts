export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as Data URL.'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading selected file.'));
    reader.readAsDataURL(file);
  });
}

export function downsampleTo16k(input: Float32Array, inputSampleRate: number): Float32Array {
  if (inputSampleRate === 16000) {
    return input;
  }
  const ratio = inputSampleRate / 16000;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    let count = 0;
    for (let j = start; j < end; j++) {
      sum += input[j];
      count++;
    }
    output[i] = count > 0 ? sum / count : input[Math.min(start, input.length - 1)] || 0;
  }
  return output;
}

export function float32ToPcm16Base64(samples: Float32Array, sampleRate = 16000): string {
  const pcmFloat = sampleRate === 16000 ? samples : downsampleTo16k(samples, sampleRate);
  const buffer = new ArrayBuffer(pcmFloat.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < pcmFloat.length; i++) {
    const clamped = Math.max(-1, Math.min(1, pcmFloat[i]));
    const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    view.setInt16(i * 2, int16, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function pcm24Base64ToAudioBuffer(
  audioCtx: AudioContext,
  base64Pcm: string
): AudioBuffer | null {
  if (!base64Pcm) return null;
  const binary = atob(base64Pcm);
  const byteLength = binary.length - (binary.length % 2);
  if (byteLength <= 0) return null;

  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const view = new DataView(bytes.buffer);
  const sampleCount = byteLength / 2;
  const audioBuffer = audioCtx.createBuffer(1, sampleCount, 24000);
  const channelData = audioBuffer.getChannelData(0);

  for (let i = 0; i < sampleCount; i++) {
    const int16 = view.getInt16(i * 2, true);
    channelData[i] = int16 / 32768;
  }

  return audioBuffer;
}

export async function normalizeImageToJpegDataUrl(
  dataUrl: string,
  maxDimension = 1024
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.min(1, maxDimension / Math.max(img.width || 1, img.height || 1));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable.'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.84));
    };
    img.onerror = () => reject(new Error('Unable to decode image frame.'));
    img.src = dataUrl;
  });
}
