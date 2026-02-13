'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Word, Phrase, ScriptType, Recording } from '@/lib/types';
import {
  startRecording,
  stopRecording,
  analyzeQuality,
  saveRecording,
  generateRecordingId,
  getSpeaker,
  getRecordingCount,
} from '@/lib/recorder';
import wordsData from '@/data/words.json';

const allWords = wordsData as Word[];

type RecordingStep = 'ready' | 'recording' | 'review';

function getWordInScript(word: Word | Phrase, script: ScriptType): string {
  switch (script) {
    case 'latin': return word.harariLatin;
    case 'ethiopic': return word.harariEthiopic;
    case 'arabic': return word.harariArabic;
    default: return word.harariLatin;
  }
}

export default function RecordSpeakPage() {
  const router = useRouter();

  const [speakerId, setSpeakerId] = useState<string | null>(null);
  const [speakerName, setSpeakerName] = useState('');
  const [script, setScript] = useState<ScriptType>('latin');
  const [wordIndex, setWordIndex] = useState(0);
  const [step, setStep] = useState<RecordingStep>('ready');
  const [recordingCount, setRecordingCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);

  // Recording state
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);

  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentWord = allWords[wordIndex];

  // Load speaker from session
  useEffect(() => {
    const id = sessionStorage.getItem('geysinan-active-speaker');
    if (!id) {
      router.push('/record/setup');
      return;
    }
    setSpeakerId(id);
    getSpeaker(id).then(speaker => {
      if (speaker) setSpeakerName(speaker.name);
    });
    getRecordingCount().then(setRecordingCount);
  }, [router]);

  // Waveform visualization
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgb(17, 24, 39)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(16, 185, 129)';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Check quality while recording
      if (step === 'recording' && analyser) {
        const quality = analyzeQuality(analyser);
        if (quality.clipping) {
          setQualityWarning('Too loud - try moving back from the mic');
        } else if (quality.tooQuiet) {
          setQualityWarning('Too quiet - try speaking louder');
        } else {
          setQualityWarning(null);
        }
      }
    };

    draw();
  }, [step]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleStartRecording = async () => {
    try {
      const { mediaRecorder, stream, analyser, audioContext } = await startRecording();
      mediaRecorderRef.current = mediaRecorder;
      streamRef.current = stream;
      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      mediaRecorder.start();
      startTimeRef.current = Date.now();
      setStep('recording');
      setRecordingDuration(0);
      setQualityWarning(null);

      // Update duration counter
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((Date.now() - startTimeRef.current) / 1000);
      }, 100);

      // Start waveform
      drawWaveform();
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const handleStopRecording = async () => {
    if (!mediaRecorderRef.current || !streamRef.current || !audioContextRef.current) return;

    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const duration = (Date.now() - startTimeRef.current) / 1000;
    setRecordingDuration(duration);

    const result = await stopRecording(
      mediaRecorderRef.current,
      streamRef.current,
      audioContextRef.current
    );

    setAudioBlob(result.blob);
    setMimeType(result.mimeType);
    const url = URL.createObjectURL(result.blob);
    setAudioUrl(url);
    setStep('review');

    mediaRecorderRef.current = null;
    streamRef.current = null;
    analyserRef.current = null;
    audioContextRef.current = null;
  };

  const handleAccept = async () => {
    if (!audioBlob || !speakerId || !currentWord) return;

    const recording: Recording = {
      id: generateRecordingId(),
      speakerId,
      targetId: currentWord.id,
      mode: 'word',
      blob: audioBlob,
      mimeType,
      sampleRate: 48000,
      duration: recordingDuration,
      quality: {
        peakAmplitude: 0,
        clipping: false,
        tooQuiet: false,
      },
      createdAt: new Date().toISOString(),
    };

    await saveRecording(recording);
    setSessionCount(prev => prev + 1);
    setRecordingCount(prev => prev + 1);

    // Clean up and advance
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setStep('ready');

    if (wordIndex < allWords.length - 1) {
      setWordIndex(prev => prev + 1);
    }
  };

  const handleReRecord = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setStep('ready');
  };

  const handleSkip = () => {
    setSkippedCount(prev => prev + 1);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setStep('ready');

    if (wordIndex < allWords.length - 1) {
      setWordIndex(prev => prev + 1);
    }
  };

  if (!speakerId || !currentWord) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/record/setup" className="text-gray-400 hover:text-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="text-center">
              <p className="text-sm text-gray-400">Recording as {speakerName}</p>
              <p className="text-xs text-gray-500">
                {sessionCount} recorded | {skippedCount} skipped | {recordingCount} total
              </p>
            </div>
            <Link
              href="/record/export"
              className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Export
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Script selector */}
        <div className="flex justify-center gap-1 p-1 bg-gray-800 rounded-lg mb-6">
          {(['latin', 'ethiopic', 'arabic'] as ScriptType[]).map((s) => (
            <button
              key={s}
              onClick={() => setScript(s)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                script === s
                  ? 'bg-gray-700 text-emerald-400 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {s === 'latin' ? 'Latin' : s === 'ethiopic' ? "Ge'ez" : 'Arabic'}
            </button>
          ))}
        </div>

        {/* Word display */}
        <div className="text-center mb-8">
          <p
            className={`text-5xl font-bold mb-4 ${
              script === 'arabic' ? 'font-arabic' : ''
            } ${script === 'ethiopic' ? 'font-ethiopic' : ''}`}
            dir={script === 'arabic' ? 'rtl' : 'ltr'}
          >
            {getWordInScript(currentWord, script)}
          </p>
          <p className="text-xl text-gray-400">{currentWord.english}</p>
          <p className="text-sm text-gray-500 mt-2">
            {wordIndex + 1} of {allWords.length} | {currentWord.category}
          </p>
        </div>

        {/* Waveform canvas */}
        {step === 'recording' && (
          <div className="mb-6">
            <canvas
              ref={canvasRef}
              width={400}
              height={80}
              className="w-full h-20 rounded-lg bg-gray-800"
            />
            {qualityWarning && (
              <p className="text-amber-400 text-sm text-center mt-2">
                {qualityWarning}
              </p>
            )}
          </div>
        )}

        {/* Duration display */}
        {(step === 'recording' || step === 'review') && (
          <p className="text-center text-2xl font-mono text-gray-400 mb-6">
            {recordingDuration.toFixed(1)}s
          </p>
        )}

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          {step === 'ready' && (
            <>
              <button
                onClick={handleStartRecording}
                className="w-24 h-24 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors shadow-lg shadow-red-900/30"
              >
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                </svg>
              </button>
              <p className="text-gray-500 text-sm">Tap to record</p>
            </>
          )}

          {step === 'recording' && (
            <>
              <button
                onClick={handleStopRecording}
                className="w-24 h-24 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors animate-pulse shadow-lg shadow-red-900/50"
              >
                <div className="w-8 h-8 rounded-sm bg-white" />
              </button>
              <p className="text-gray-500 text-sm">Tap to stop</p>
            </>
          )}

          {step === 'review' && audioUrl && (
            <>
              {/* Playback */}
              <audio src={audioUrl} controls className="w-full mb-2" />

              {/* Action buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleReRecord}
                  className="flex-1 py-3 bg-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Re-record
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Accept
                </button>
              </div>
            </>
          )}
        </div>

        {/* Skip button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-300 text-sm underline transition-colors"
          >
            Skip this word
          </button>
        </div>

        {/* Batch export reminder */}
        {sessionCount > 0 && sessionCount % 50 === 0 && (
          <div className="mt-6 p-4 bg-amber-900/30 rounded-xl border border-amber-700">
            <p className="text-amber-400 text-sm">
              You&apos;ve recorded {sessionCount} words this session. Consider
              <Link href="/record/export" className="underline ml-1">exporting</Link> to save your progress.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
