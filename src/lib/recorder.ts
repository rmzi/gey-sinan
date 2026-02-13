import { Recording, Speaker, RecordingMode } from './types';

const DB_NAME = 'geysinan-recordings';
const DB_VERSION = 1;

// ---- IndexedDB ----

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('speakers')) {
        db.createObjectStore('speakers', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('recordings')) {
        const store = db.createObjectStore('recordings', { keyPath: 'id' });
        store.createIndex('speakerId', 'speakerId', { unique: false });
        store.createIndex('targetId', 'targetId', { unique: false });
      }
    };
  });
}

function dbTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const request = fn(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

// ---- Speaker Storage ----

export async function saveSpeaker(speaker: Speaker): Promise<void> {
  await dbTransaction('speakers', 'readwrite', store => store.put(speaker));
}

export async function getSpeaker(id: string): Promise<Speaker | undefined> {
  return dbTransaction('speakers', 'readonly', store => store.get(id));
}

export async function getAllSpeakers(): Promise<Speaker[]> {
  return dbTransaction('speakers', 'readonly', store => store.getAll());
}

// ---- Recording Storage ----

export async function saveRecording(recording: Recording): Promise<void> {
  await dbTransaction('recordings', 'readwrite', store => store.put(recording));
}

export async function getRecording(id: string): Promise<Recording | undefined> {
  return dbTransaction('recordings', 'readonly', store => store.get(id));
}

export async function getAllRecordings(): Promise<Recording[]> {
  return dbTransaction('recordings', 'readonly', store => store.getAll());
}

export async function getRecordingsBySpeaker(speakerId: string): Promise<Recording[]> {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('recordings', 'readonly');
      const store = tx.objectStore('recordings');
      const index = store.index('speakerId');
      const request = index.getAll(speakerId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

export async function getRecordingCount(): Promise<number> {
  return dbTransaction('recordings', 'readonly', store => store.count());
}

export async function deleteRecording(id: string): Promise<void> {
  await dbTransaction('recordings', 'readwrite', store => store.delete(id));
}

// ---- MediaRecorder Wrapper ----

export interface RecorderState {
  isRecording: boolean;
  stream: MediaStream | null;
  analyser: AnalyserNode | null;
  audioContext: AudioContext | null;
}

export async function startRecording(): Promise<{
  mediaRecorder: MediaRecorder;
  stream: MediaStream;
  analyser: AnalyserNode;
  audioContext: AudioContext;
}> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      sampleRate: 48000,
      echoCancellation: true,
      noiseSuppression: true,
    },
  });

  const audioContext = new AudioContext({ sampleRate: 48000 });
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);

  // Prefer WAV-capable mime types, fall back to WebM Opus
  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm';

  const mediaRecorder = new MediaRecorder(stream, { mimeType });

  return { mediaRecorder, stream, analyser, audioContext };
}

export function stopRecording(
  mediaRecorder: MediaRecorder,
  stream: MediaStream,
  audioContext: AudioContext
): Promise<{ blob: Blob; mimeType: string }> {
  return new Promise((resolve) => {
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach(track => track.stop());
      audioContext.close();
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
      resolve({ blob, mimeType: mediaRecorder.mimeType });
    };

    mediaRecorder.stop();
  });
}

// ---- Signal Quality ----

export function analyzeQuality(analyser: AnalyserNode): {
  peakAmplitude: number;
  clipping: boolean;
  tooQuiet: boolean;
  level: number; // 0-1 normalized current level
} {
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(dataArray);

  let peak = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const amplitude = Math.abs(dataArray[i] - 128) / 128;
    if (amplitude > peak) peak = amplitude;
  }

  return {
    peakAmplitude: peak,
    clipping: peak > 0.95,
    tooQuiet: peak < 0.05,
    level: peak,
  };
}

// ---- Export ----

export async function exportRecordingsAsZip(): Promise<Blob> {
  const recordings = await getAllRecordings();
  const speakers = await getAllSpeakers();

  const speakerMap = new Map(speakers.map(s => [s.id, s]));

  // Build manifest
  const manifest = {
    exportDate: new Date().toISOString(),
    totalRecordings: recordings.length,
    speakers: speakers.map(s => ({
      id: s.id,
      name: s.consent.attribution === 'name' ? s.name : 'Anonymous',
      fluencyLevel: s.fluencyLevel,
      ageRange: s.ageRange,
      dialectNotes: s.dialectNotes,
      consentTimestamp: s.consent.timestamp,
    })),
    recordings: recordings.map(r => ({
      id: r.id,
      speakerId: r.speakerId,
      targetId: r.targetId,
      mode: r.mode,
      mimeType: r.mimeType,
      duration: r.duration,
      quality: r.quality,
      createdAt: r.createdAt,
    })),
  };

  // Use a simple tar-like concatenation since we can't import JSZip
  // Build files as a structured JSON + blob references
  // For a real ZIP, we'd need a library, but we can create a downloadable
  // archive format that's useful

  // Create a combined export blob with manifest + audio files
  const encoder = new TextEncoder();
  const manifestBytes = encoder.encode(JSON.stringify(manifest, null, 2));

  // Create individual file downloads approach:
  // Return manifest as JSON blob for now, with recordings accessible separately
  // In production, integrate JSZip or similar
  const parts: BlobPart[] = [];

  // Add manifest header
  const header = encoder.encode(`GEYSINAN_EXPORT_V1\n${recordings.length}\n`);
  parts.push(header);
  parts.push(manifestBytes);
  parts.push(encoder.encode('\n---END_MANIFEST---\n'));

  // Add each recording with its metadata
  for (const recording of recordings) {
    const meta = encoder.encode(
      `\n---RECORDING:${recording.id}:${recording.targetId}:${recording.speakerId}:${recording.mimeType}:${recording.blob.size}---\n`
    );
    parts.push(meta);
    parts.push(recording.blob);
  }

  return new Blob(parts, { type: 'application/octet-stream' });
}

export function generateSpeakerId(): string {
  return `speaker-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function generateRecordingId(): string {
  return `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
