'use client';

import Link from 'next/link';

export default function AboutPage() {
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
              About Gey Sinan
            </h1>
            <div className="w-6" />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Mission */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-3">
            Why Gey Sinan?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Harari is an endangered Semitic language spoken by approximately 25,000 people,
            primarily in the ancient walled city of Harar, Ethiopia, and by diaspora communities
            across North America, Europe, and the Middle East.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            &ldquo;Gey Sinan&rdquo; means &ldquo;language of the city&rdquo; &mdash; the language of Harar.
            As younger generations grow up far from Harar, many become receptive bilinguals:
            they can understand Harari when spoken by family, but struggle to produce it themselves.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            This app bridges that gap, transforming passive understanding into active speech through
            structured lessons, spaced repetition, and eventually, community-recorded pronunciation guides.
          </p>
        </section>

        {/* How it works */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Three Scripts, One Language
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Harari is unique among Ethiopian languages in its historical use of three writing systems:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-sm font-bold text-emerald-700 dark:text-emerald-400">
                A
              </span>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Latin</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Modern transliteration used in digital contexts</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-sm font-bold text-emerald-700 dark:text-emerald-400 font-ethiopic">
                ሀ
              </span>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Ge&apos;ez (Ethiopic)</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">The traditional Ethiopian script used in formal contexts</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-sm font-bold text-emerald-700 dark:text-emerald-400 font-arabic" dir="rtl">
                ع
              </span>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Arabic</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Historical script reflecting Harar&apos;s Islamic heritage</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dictionary source */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            The Dictionary
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The app&apos;s vocabulary is drawn from Wolf Leslau&apos;s Etymological Dictionary of Harari,
            containing 4,629 entries &mdash; the most comprehensive Harari lexicon ever compiled.
            Words are curated into learning tiers, starting with survival vocabulary and expanding
            to cultural and conversational fluency.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Historical spellings from Richard Burton&apos;s 1894 &ldquo;First Footsteps in East Africa&rdquo;
            and modern usage from community sources supplement the dictionary entries.
          </p>
        </section>

        {/* Memphis recording */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Community Voices
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            At community gatherings, we set up recording stations where native speakers can
            contribute their pronunciations. These recordings become the audio foundation of the app,
            ensuring learners hear authentic Harari from real community members.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Every recording contributes to preserving Harari for future generations and may help
            develop speech recognition technology for an underrepresented language.
          </p>
        </section>

        {/* How to help */}
        <section className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 shadow-sm border border-emerald-200 dark:border-emerald-800">
          <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-3">
            How You Can Help
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
              </svg>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Record your voice</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Native speakers can record pronunciations at community events or through the app</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Verify words</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Help us confirm spellings, meanings, and script representations</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Suggest content</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Share phrases, proverbs, or cultural vocabulary that should be included</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Spread the word</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Share the app with family, friends, and community members</p>
              </div>
            </li>
          </ul>
        </section>

        {/* Attribution */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Sources & Attribution
          </h2>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>Wolf Leslau &mdash; Etymological Dictionary of Harari (4,629 entries)</li>
            <li>Richard Burton &mdash; First Footsteps in East Africa (1894)</li>
            <li>Glosbe &mdash; Community-contributed translations</li>
            <li>harar.city &mdash; Cultural and identity vocabulary</li>
          </ul>
        </section>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-emerald-700 dark:text-emerald-400 font-bold text-lg font-ethiopic">
            ጌይ ሲናን
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Preserving the language of Harar for future generations
          </p>
        </div>
      </main>
    </div>
  );
}
