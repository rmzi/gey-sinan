#!/usr/bin/env node

/**
 * Build the full dictionary + phrase corpus consumed by the Expo app's
 * /dictionary browser.
 *
 * Merges three sources:
 *   - vocabulary.csv         curated words with scripts, ids, source, verification
 *   - harari-dictionary.csv  bulk Leslau dictionary (4,600+ entries, latin+english only)
 *   - phrases.csv            curated phrases
 *
 * Curated vocabulary entries win on dedupe (same harariLatin + english as a
 * dictionary entry). Existing audioUrl values from apps/expo/data/words.json
 * are attached to matching entries by id.
 *
 * Output: apps/expo/public/data/corpus.json
 *   { words: Word[], phrases: Phrase[] }
 *
 * Usage:
 *   node scripts/build-corpus.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VOCAB_CSV = path.join(ROOT, 'vocabulary.csv');
const DICTIONARY_CSV = path.join(ROOT, 'harari-dictionary.csv');
const PHRASES_CSV = path.join(ROOT, 'phrases.csv');
const WORDS_JSON = path.join(ROOT, 'apps/expo/data/words.json');
const OUT_PATH = path.join(ROOT, 'apps/expo/public/data/corpus.json');

/**
 * Minimal RFC4180-ish CSV line splitter: handles double-quoted fields that
 * may contain commas and escaped ("") quotes. Good enough for this corpus;
 * not a general CSV library.
 */
function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields.map((f) => f.trim());
}

function parseCsv(content) {
  const lines = content.split(/\r?\n/);
  const rows = [];
  let header = null;

  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.trim().startsWith('#')) continue;

    const fields = parseCsvLine(line);

    if (!header) {
      header = fields.map((f) => f.toLowerCase());
      continue;
    }

    const row = {};
    header.forEach((col, i) => {
      row[col] = fields[i] !== undefined ? fields[i] : '';
    });
    rows.push(row);
  }

  return rows;
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function dedupeKey(harariLatin, english) {
  return `${harariLatin.toLowerCase().trim()}|${english.toLowerCase().trim()}`;
}

function main() {
  const vocabRows = parseCsv(fs.readFileSync(VOCAB_CSV, 'utf-8'));
  const dictRows = parseCsv(fs.readFileSync(DICTIONARY_CSV, 'utf-8'));
  const phraseRows = parseCsv(fs.readFileSync(PHRASES_CSV, 'utf-8'));

  const existingWords = JSON.parse(fs.readFileSync(WORDS_JSON, 'utf-8'));
  const audioById = new Map();
  const audioByLatin = new Map();
  for (const w of existingWords) {
    if (w.audioUrl) {
      audioById.set(w.id, w.audioUrl);
      audioByLatin.set(w.harariLatin.toLowerCase().trim(), w.audioUrl);
    }
  }

  const words = [];
  const seen = new Map(); // dedupeKey -> index in words[]
  const slugCounts = new Map();

  // 1. Curated vocabulary wins ties.
  for (const row of vocabRows) {
    if (!row.harari_latin || !row.english) continue;

    const id = row.id || `vocab-${slugify(row.harari_latin)}`;
    const audioUrl = audioById.get(id) || audioByLatin.get(row.harari_latin.toLowerCase()) || undefined;

    const word = {
      id,
      harariLatin: row.harari_latin,
      harariEthiopic: row.harari_ethiopic || undefined,
      harariArabic: row.harari_arabic || undefined,
      english: row.english,
      category: row.category || 'uncategorized',
      source: row.source || undefined,
      verified: row.verified || undefined,
      notes: row.notes || undefined,
      audioUrl,
    };

    const key = dedupeKey(word.harariLatin, word.english);
    seen.set(key, words.length);
    words.push(word);
  }

  // 2. Bulk dictionary fills in the rest, generating stable slug ids.
  for (const row of dictRows) {
    if (!row.harari_latin || !row.english) continue;

    const key = dedupeKey(row.harari_latin, row.english);
    if (seen.has(key)) continue; // curated entry already covers this

    const baseSlug = slugify(row.harari_latin) || slugify(row.english) || 'entry';
    const count = slugCounts.get(baseSlug) || 0;
    slugCounts.set(baseSlug, count + 1);
    const id = count === 0 ? `dict-${baseSlug}` : `dict-${baseSlug}-${count + 1}`;

    const audioUrl = audioByLatin.get(row.harari_latin.toLowerCase());

    const word = {
      id,
      harariLatin: row.harari_latin,
      english: row.english,
      category: row.category || 'uncategorized',
      notes: row.notes || undefined,
      audioUrl,
    };

    seen.set(key, words.length);
    words.push(word);
  }

  const phrases = [];
  for (const row of phraseRows) {
    if (!row.harari_latin || !row.english) continue;

    phrases.push({
      id: row.id || `phrase-${slugify(row.harari_latin)}`,
      harariLatin: row.harari_latin,
      harariEthiopic: row.harari_ethiopic || undefined,
      harariArabic: row.harari_arabic || undefined,
      english: row.english,
      category: row.category || 'uncategorized',
      wordIds: row.word_ids ? row.word_ids.split(',').map((s) => s.trim()).filter(Boolean) : [],
      notes: row.notes || undefined,
    });
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify({ words, phrases }, null, 2));

  const curatedCount = vocabRows.filter((r) => r.harari_latin && r.english).length;
  const withAudio = words.filter((w) => w.audioUrl).length;

  console.log(`Wrote ${OUT_PATH}`);
  console.log(`  words: ${words.length} (curated: ${curatedCount}, dictionary: ${words.length - curatedCount})`);
  console.log(`  phrases: ${phrases.length}`);
  console.log(`  words with audioUrl: ${withAudio}`);
}

main();
