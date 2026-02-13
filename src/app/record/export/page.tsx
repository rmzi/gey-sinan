'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getAllRecordings,
  getAllSpeakers,
  exportRecordingsAsZip,
  getRecordingCount,
} from '@/lib/recorder';
import { Speaker } from '@/lib/types';

interface ExportStats {
  totalRecordings: number;
  totalSpeakers: number;
  speakers: (Speaker & { recordingCount: number })[];
  categories: Record<string, number>;
}

export default function RecordExportPage() {
  const [stats, setStats] = useState<ExportStats | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    const recordings = await getAllRecordings();
    const speakers = await getAllSpeakers();

    const speakerRecordingCounts = new Map<string, number>();
    const categories: Record<string, number> = {};

    for (const rec of recordings) {
      speakerRecordingCounts.set(
        rec.speakerId,
        (speakerRecordingCounts.get(rec.speakerId) || 0) + 1
      );

      // Count by mode
      const key = rec.mode;
      categories[key] = (categories[key] || 0) + 1;
    }

    setStats({
      totalRecordings: recordings.length,
      totalSpeakers: speakers.length,
      speakers: speakers.map(s => ({
        ...s,
        recordingCount: speakerRecordingCounts.get(s.id) || 0,
      })),
      categories,
    });
    setLoading(false);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await exportRecordingsAsZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `geysinan-recordings-${new Date().toISOString().split('T')[0]}.bin`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    }
    setExporting(false);
  }

  async function handleExportManifest() {
    const recordings = await getAllRecordings();
    const speakers = await getAllSpeakers();

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

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geysinan-manifest-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/record/speak"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Export Recordings
            </h1>
            <div className="w-6" />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {stats && stats.totalRecordings === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No recordings yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start recording to capture Harari pronunciations
            </p>
            <Link
              href="/record/setup"
              className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Start Recording
            </Link>
          </div>
        ) : stats && (
          <>
            {/* Summary */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Recording Summary
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.totalRecordings}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Recordings</p>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.totalSpeakers}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Speakers</p>
                </div>
              </div>
            </section>

            {/* Speakers */}
            <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Speakers
              </h2>
              <div className="space-y-3">
                {stats.speakers.map(speaker => (
                  <div
                    key={speaker.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {speaker.consent.attribution === 'name' ? speaker.name : 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {speaker.fluencyLevel} | {speaker.ageRange}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {speaker.recordingCount} recordings
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Export buttons */}
            <section className="space-y-3">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full py-4 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {exporting ? 'Exporting...' : 'Export All Recordings'}
              </button>
              <button
                onClick={handleExportManifest}
                className="w-full py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Export Manifest Only (JSON)
              </button>
            </section>

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Recordings are stored locally in your browser. Export regularly to avoid data loss.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
