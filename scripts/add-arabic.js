#!/usr/bin/env node

/**
 * Add Arabic script transliterations to vocabulary.csv
 *
 * Converts Harari Latin romanization to Arabic (Ajami) script.
 * Harari historically used Arabic script — this generates best-effort
 * transliterations based on standard Harari-Arabic orthographic conventions.
 *
 * Usage:
 *   node scripts/add-arabic.js          # Preview changes
 *   node scripts/add-arabic.js --write  # Write changes to vocabulary.csv
 */

const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../vocabulary.csv');
const shouldWrite = process.argv.includes('--write');

// Harari Latin → Arabic script mapping
// Multi-char sequences must come before single-char to match greedily
const mappings = [
  // Digraphs / trigraphs first
  ['sh', 'ش'],
  ['ch', 'چ'],
  ['kh', 'خ'],
  ['dh', 'ذ'],
  ['gh', 'غ'],
  ['ny', 'ني'],
  ['ng', 'نغ'],
  // Single consonants
  ['b', 'ب'],
  ['t', 'ت'],
  ['j', 'ج'],
  ['c', 'چ'],  // Harari 'c' is typically an affricate like 'ch'
  ['d', 'د'],
  ['r', 'ر'],
  ['z', 'ز'],
  ['s', 'س'],
  ['f', 'ف'],
  ['q', 'ق'],
  ['k', 'ك'],
  ['l', 'ل'],
  ['m', 'م'],
  ['n', 'ن'],
  ['w', 'و'],
  ['y', 'ي'],
  ['g', 'غ'],
  ['h', 'ه'],
  ['x', 'خ'],
  ['p', 'پ'],
  ["'", 'ع'],
];

// Vowel handling for Ajami script
// In Harari Ajami, vowels are generally written with matres lectionis
const vowelMap = {
  'a': 'ا',
  'e': 'ي',
  'i': 'ي',
  'o': 'و',
  'u': 'و',
};

function latinToArabic(latin) {
  if (!latin) return '';

  const words = latin.split(/\s+/);
  return words.map(word => transliterateWord(word)).join(' ');
}

function transliterateWord(word) {
  let result = '';
  let i = 0;
  const lower = word.toLowerCase();

  while (i < lower.length) {
    let matched = false;

    // Try digraphs first (2-3 char sequences)
    for (const [from, to] of mappings) {
      if (lower.startsWith(from, i)) {
        // Handle gemination (double consonants) with shadda
        const lastChar = result[result.length - 1];
        if (lastChar === to && from.length === 1) {
          result += '\u0651'; // shadda (ّ) instead of repeating
        } else {
          result += to;
        }
        i += from.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      const ch = lower[i];
      if (vowelMap[ch]) {
        // For initial alif with vowels other than 'a', add alif + vowel letter
        if (i === 0 && ch !== 'a') {
          result += 'ا' + vowelMap[ch];
        } else if (ch === 'a' && i === 0) {
          result += 'ا';
        } else {
          // Medial/final vowels: write long vowel letters
          // Skip duplicate vowel letters (e.g. don't write يي for 'ii')
          const vowelLetter = vowelMap[ch];
          const lastChar = result[result.length - 1];
          if (lastChar !== vowelLetter) {
            result += vowelLetter;
          }
        }
        i++;
      } else {
        // Skip unknown characters
        i++;
      }
    }
  }

  return result;
}

// Read CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');

let updated = 0;
let skipped = 0;
const newLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Pass through comments, header, and empty lines
  if (!line.trim() || line.startsWith('#') || i === 0) {
    newLines.push(line);
    continue;
  }

  const cols = line.split(',');
  // Header: id,harari_latin,harari_ethiopic,harari_arabic,english,category,source,verified,audio_recorded,notes
  const id = cols[0]?.trim();
  const latin = cols[1]?.trim();
  const existingArabic = cols[3]?.trim();

  // Skip if already has Arabic
  if (existingArabic) {
    skipped++;
    newLines.push(line);
    continue;
  }

  if (latin) {
    const arabic = latinToArabic(latin);
    cols[3] = arabic;
    updated++;
    newLines.push(cols.join(','));

    if (!shouldWrite) {
      console.log(`  ${id}: ${latin} → ${arabic}`);
    }
  } else {
    newLines.push(line);
  }
}

console.log(`\n${updated} entries transliterated, ${skipped} already had Arabic`);

if (shouldWrite) {
  fs.writeFileSync(csvPath, newLines.join('\n'));
  console.log('Written to vocabulary.csv');
  console.log('Run: node scripts/build-vocabulary.js --all');
} else {
  console.log('\nPreview mode. Run with --write to save changes.');
}
