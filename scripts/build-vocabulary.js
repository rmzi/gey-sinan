#!/usr/bin/env node

/**
 * Build words.json from vocabulary.csv
 *
 * Only includes entries where verified = "verified"
 *
 * Usage:
 *   node scripts/build-vocabulary.js [--all]
 *
 * Options:
 *   --all    Include all entries, not just verified ones (for testing)
 */

const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../vocabulary.csv');
const jsonPath = path.join(__dirname, '../src/data/words.json');

const includeAll = process.argv.includes('--all');

// Read and parse CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line =>
  line.trim() && !line.startsWith('#')
);

// Parse header
const header = lines[0].split(',');
const headerMap = {};
header.forEach((col, i) => headerMap[col.trim()] = i);

// Parse rows
const words = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;

  // Simple CSV parsing (doesn't handle quoted commas)
  const cols = line.split(',');

  const verified = cols[headerMap['verified']]?.trim();

  // Skip unverified unless --all flag
  if (!includeAll && verified !== 'verified') {
    continue;
  }

  const word = {
    id: cols[headerMap['id']]?.trim(),
    harariLatin: cols[headerMap['harari_latin']]?.trim(),
    harariEthiopic: cols[headerMap['harari_ethiopic']]?.trim() || '',
    harariArabic: cols[headerMap['harari_arabic']]?.trim() || '',
    english: cols[headerMap['english']]?.trim(),
    audioUrl: `/audio/${cols[headerMap['harari_latin']]?.trim().replace(/['\s]/g, '-').toLowerCase()}.mp3`,
    category: cols[headerMap['category']]?.trim(),
    difficulty: getCategoryDifficulty(cols[headerMap['category']]?.trim()),
  };

  if (word.id && word.harariLatin && word.english) {
    words.push(word);
  }
}

function getCategoryDifficulty(category) {
  const easy = ['greetings', 'numbers', 'family', 'colors', 'phrases', 'nouns'];
  const medium = ['food', 'body', 'home', 'animals', 'people', 'social', 'nature', 'time', 'market'];
  const hard = ['verbs', 'pronouns', 'adjectives', 'expressions'];

  if (easy.includes(category)) return 1;
  if (medium.includes(category)) return 2;
  if (hard.includes(category)) return 3;
  return 1;
}

// Write JSON
fs.writeFileSync(jsonPath, JSON.stringify(words, null, 2));

console.log(`Built words.json with ${words.length} entries`);
if (!includeAll) {
  console.log('(Only verified entries included. Use --all to include pending.)');
}

// Summary by category
const byCategory = words.reduce((acc, w) => {
  acc[w.category] = (acc[w.category] || 0) + 1;
  return acc;
}, {});

console.log('\nBy category:');
Object.entries(byCategory).sort().forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});
