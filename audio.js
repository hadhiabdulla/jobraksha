// On-device speech-to-text for JobRaksha.
// Uses transformers.js with the onnx-community/whisper-tiny ONNX model, running
// in the browser on WASM. The model is downloaded once from the Hugging Face CDN
// and cached by the browser; audio is decoded locally and never uploaded.
// Model size reference: quantized encoder ~10 MB + decoder ~31 MB (Hugging Face
// file listings for onnx-community/whisper-tiny).

const TRANSFORMERS_CDN = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
const MODEL_ID = 'onnx-community/whisper-tiny';

let transcriberPromise = null;

function getTranscriber(onProgress) {
  if (!transcriberPromise) {
    transcriberPromise = (async () => {
      const { pipeline, env } = await import(TRANSFORMERS_CDN);
      env.allowLocalModels = false; // models come from the HF CDN only, cached by the browser
      return pipeline('automatic-speech-recognition', MODEL_ID, {
        device: 'wasm',
        dtype: { encoder_model: 'fp32', decoder_model_merged: 'q8' },
        progress_callback: p => {
          if (p && p.status === 'progress' && p.total) {
            onProgress('model', Math.min(100, Math.round((p.loaded / p.total) * 100)));
          }
        }
      });
    })().catch(err => { transcriberPromise = null; throw err; });
  }
  return transcriberPromise;
}

// Decode any browser-supported audio blob to mono 16 kHz Float32 samples.
async function to16kMono(blob) {
  const buf = await blob.arrayBuffer();
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) throw new Error('Web Audio API not available');
  const ac = new AC();
  // Promise style where supported, callback style (older Safari) otherwise.
  const decoded = await new Promise((resolve, reject) => {
    const maybe = ac.decodeAudioData(buf, resolve, reject);
    if (maybe && typeof maybe.then === 'function') maybe.then(resolve, reject);
  });
  try { await ac.close(); } catch (e) { /* already closed */ }
  const rate = 16000;
  const frames = Math.max(1, Math.ceil(decoded.duration * rate));
  const off = new OfflineAudioContext(1, frames, rate);
  const src = off.createBufferSource();
  src.buffer = decoded;
  src.connect(off.destination);
  src.start();
  const rendered = await off.startRendering();
  return rendered.getChannelData(0);
}

// transformers.js whisper defaults to English when no language is given, so we
// pass the app language explicitly (the transcript step stays editable either way).
const WHISPER_LANG = { en: 'english', hi: 'hindi', ml: 'malayalam' };

// transcribe(blob, appLang, onProgress(phase, pct)) -> string
// phase is 'model' (one-time download), 'work' (transcribing) or 'prep'.
export async function transcribe(blob, appLang = 'en', onProgress = () => {}) {
  onProgress('prep', null);
  const [samples, transcriber] = await Promise.all([to16kMono(blob), getTranscriber(onProgress)]);
  if (!samples.length) throw new Error('empty audio');
  onProgress('work', null);
  const out = await transcriber(samples, {
    chunk_length_s: 30,
    stride_length_s: 5,
    language: WHISPER_LANG[appLang] || 'english',
    task: 'transcribe'
  });
  return ((out && out.text) || '').trim();
}

// True when the browser has the pieces the pipeline needs.
export function audioSupported() {
  return typeof window !== 'undefined'
    && !!(window.AudioContext || window.webkitAudioContext)
    && typeof OfflineAudioContext !== 'undefined'
    && typeof WebAssembly !== 'undefined';
}
