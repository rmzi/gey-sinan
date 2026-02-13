'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Speaker,
  AgeRange,
  Gender,
  FluencyLevel,
} from '@/lib/types';
import { saveSpeaker, generateSpeakerId } from '@/lib/recorder';

const ageRanges: AgeRange[] = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];
const genders: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];
const fluencyLevels: { value: FluencyLevel; label: string; description: string }[] = [
  { value: 'native', label: 'Native', description: 'Grew up speaking Harari as a first language' },
  { value: 'fluent', label: 'Fluent', description: 'Speak Harari fluently but not as first language' },
  { value: 'partial', label: 'Partial', description: 'Can hold conversations with some difficulty' },
  { value: 'heritage', label: 'Heritage', description: 'Understand but struggle to produce' },
];

export default function RecordSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'info' | 'consent'>('info');

  // Speaker info
  const [name, setName] = useState('');
  const [ageRange, setAgeRange] = useState<AgeRange>('26-35');
  const [gender, setGender] = useState<Gender>('prefer-not-to-say');
  const [fluency, setFluency] = useState<FluencyLevel>('native');
  const [dialectNotes, setDialectNotes] = useState('');

  // Consent
  const [consentApp, setConsentApp] = useState(false);
  const [consentPreservation, setConsentPreservation] = useState(false);
  const [consentML, setConsentML] = useState(false);
  const [attribution, setAttribution] = useState<'name' | 'anonymous'>('name');

  const [saving, setSaving] = useState(false);

  const canProceedToConsent = name.trim().length > 0;
  const canSubmit = consentApp && consentPreservation;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);

    const speaker: Speaker = {
      id: generateSpeakerId(),
      name: name.trim(),
      ageRange,
      gender,
      fluencyLevel: fluency,
      dialectNotes: dialectNotes.trim(),
      consent: {
        appUse: consentApp,
        languagePreservation: consentPreservation,
        mlTraining: consentML,
        attribution,
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };

    await saveSpeaker(speaker);

    // Store active speaker ID for the recording session
    sessionStorage.setItem('geysinan-active-speaker', speaker.id);

    setSaving(false);
    router.push('/record/speak');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recording Station
            </h1>
            <div className="w-6" />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {step === 'info' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Speaker Registration
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Help preserve the Harari language by recording your voice
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Age Range
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ageRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => setAgeRange(range)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      ageRange === range
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-2">
                {genders.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setGender(value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      gender === value
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fluency Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Harari Fluency
              </label>
              <div className="space-y-2">
                {fluencyLevels.map(({ value, label, description }) => (
                  <button
                    key={value}
                    onClick={() => setFluency(value)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                      fluency === value
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-500'
                        : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <span className="font-medium text-gray-900 dark:text-gray-100">{label}</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Dialect Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dialect Notes (optional)
              </label>
              <textarea
                value={dialectNotes}
                onChange={(e) => setDialectNotes(e.target.value)}
                placeholder="Any notes about your dialect, region, or language background..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <button
              onClick={() => setStep('consent')}
              disabled={!canProceedToConsent}
              className="w-full py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue to Consent
            </button>
          </div>
        )}

        {step === 'consent' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Consent Form
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Please review how your recordings will be used
              </p>
            </div>

            <div className="space-y-4">
              {/* App use consent */}
              <label className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentApp}
                  onChange={(e) => setConsentApp(e.target.checked)}
                  className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Use in Gey Sinan app *
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Your recordings will be used as pronunciation examples in the Gey Sinan language learning app.
                  </p>
                </div>
              </label>

              {/* Language preservation consent */}
              <label className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentPreservation}
                  onChange={(e) => setConsentPreservation(e.target.checked)}
                  className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Language preservation *
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Your recordings contribute to preserving the Harari language for future generations.
                  </p>
                </div>
              </label>

              {/* ML training consent (optional) */}
              <label className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentML}
                  onChange={(e) => setConsentML(e.target.checked)}
                  className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Machine learning (optional)
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Your recordings may be used to train speech recognition models for Harari pronunciation validation.
                  </p>
                </div>
              </label>

              {/* Attribution preference */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  Attribution preference
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">
                  How would you like to be credited?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAttribution('name')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      attribution === 'name'
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    By name
                  </button>
                  <button
                    onClick={() => setAttribution('anonymous')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      attribution === 'anonymous'
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-500'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    Anonymous
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              * Required. All recordings are stored locally on this device until exported.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('info')}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || saving}
                className="flex-1 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Start Recording'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
