#!/usr/bin/env node

/**
 * Analyze harari-dictionary.csv and suggest priority words for curriculum expansion.
 *
 * Prioritizes:
 * 1. Core survival vocabulary (Swadesh list basics)
 * 2. Diaspora relevance (visiting Harar, family calls, gatherings)
 * 3. Cultural markers (foods, places, Islamic phrases)
 * 4. Common verbs
 * 5. Receptive-to-productive bridging words
 *
 * Usage:
 *   node scripts/select-priority-words.js [--category <cat>] [--limit <n>]
 */

const fs = require('fs');
const path = require('path');

const dictPath = path.join(__dirname, '../harari-dictionary.csv');
const vocabPath = path.join(__dirname, '../vocabulary.csv');

// Parse command line
const args = process.argv.slice(2);
const categoryFilter = args.includes('--category') ? args[args.indexOf('--category') + 1] : null;
const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 30;

// Read dictionary
const dictContent = fs.readFileSync(dictPath, 'utf-8');
const dictLines = dictContent.split('\n').filter(l => l.trim());
const dictHeader = dictLines[0].split(',');

const dictEntries = [];
for (let i = 1; i < dictLines.length; i++) {
  const cols = dictLines[i].split(',');
  if (cols.length >= 3) {
    dictEntries.push({
      harariLatin: cols[0]?.trim(),
      english: cols[1]?.trim(),
      category: cols[2]?.trim(),
      notes: cols[3]?.trim() || '',
    });
  }
}

// Read existing vocabulary to exclude already-added words
const vocabContent = fs.readFileSync(vocabPath, 'utf-8');
const existingWords = new Set();
vocabContent.split('\n').forEach(line => {
  if (line.startsWith('#') || !line.trim()) return;
  const cols = line.split(',');
  if (cols[1]) existingWords.add(cols[1].trim().toLowerCase());
});

// Swadesh-list core concepts for filtering
const swadeshConcepts = new Set([
  'water', 'fire', 'earth', 'sun', 'moon', 'star', 'rain', 'wind',
  'tree', 'seed', 'leaf', 'root', 'flower', 'grass',
  'dog', 'bird', 'fish', 'snake', 'worm',
  'man', 'woman', 'child', 'wife', 'husband',
  'eat', 'drink', 'sleep', 'die', 'kill', 'swim', 'fly', 'walk', 'come', 'go',
  'sit', 'stand', 'lie', 'say', 'sing', 'play', 'fight', 'hunt',
  'give', 'hold', 'squeeze', 'rub', 'wash', 'wipe', 'pull', 'push',
  'throw', 'tie', 'sew', 'count', 'think', 'know', 'want', 'see', 'hear', 'smell',
  'big', 'small', 'long', 'short', 'wide', 'thick', 'heavy', 'hot', 'cold',
  'full', 'new', 'old', 'good', 'bad', 'right', 'left',
  'red', 'green', 'yellow', 'white', 'black',
  'night', 'day', 'year', 'name', 'road', 'mountain',
]);

// Score each dictionary entry
const scored = dictEntries
  .filter(e => {
    // Exclude already in vocabulary
    if (existingWords.has(e.harariLatin.toLowerCase())) return false;
    // Exclude entries starting with special characters
    if (e.harariLatin.startsWith('(') || e.harariLatin.startsWith('-')) return false;
    // Exclude very long multi-word entries
    if (e.harariLatin.split(' ').length > 2) return false;
    // Category filter
    if (categoryFilter && e.category !== categoryFilter) return false;
    return true;
  })
  .map(e => {
    let score = 0;

    // Swadesh concept match
    const englishWords = e.english.toLowerCase().split(/[;,\/\s]+/);
    for (const concept of swadeshConcepts) {
      if (englishWords.includes(concept)) {
        score += 10;
        break;
      }
    }

    // Category priority
    const categoryScores = {
      'verb': 8,
      'noun': 6,
      'adjective': 5,
      'food': 7,
      'greeting': 9,
      'numeral': 4,
    };
    score += categoryScores[e.category] || 3;

    // Short words are easier to learn
    if (e.harariLatin.length <= 5) score += 3;
    else if (e.harariLatin.length <= 8) score += 1;

    // Single-meaning words are clearer
    if (!e.english.includes(';')) score += 2;

    // Diaspora relevance keywords
    const diasporaKeywords = ['family', 'house', 'food', 'cook', 'market', 'buy', 'sell',
      'friend', 'love', 'prayer', 'mosque', 'money', 'travel', 'visit', 'phone', 'call'];
    for (const kw of diasporaKeywords) {
      if (e.english.toLowerCase().includes(kw)) {
        score += 4;
        break;
      }
    }

    return { ...e, score };
  })
  .sort((a, b) => b.score - a.score);

// Output results
console.log(`\nPriority Words from Harari Dictionary`);
console.log(`${'='.repeat(60)}`);
console.log(`Total dictionary entries: ${dictEntries.length}`);
console.log(`Already in vocabulary: ${existingWords.size}`);
console.log(`Candidates after filtering: ${scored.length}`);
if (categoryFilter) console.log(`Category filter: ${categoryFilter}`);
console.log(`Showing top ${limit}:\n`);

// Show by category
const byCategory = {};
scored.slice(0, limit).forEach(e => {
  if (!byCategory[e.category]) byCategory[e.category] = [];
  byCategory[e.category].push(e);
});

Object.entries(byCategory).sort().forEach(([cat, entries]) => {
  console.log(`\n--- ${cat.toUpperCase()} ---`);
  entries.forEach(e => {
    console.log(`  [${e.score}] ${e.harariLatin.padEnd(20)} ${e.english}`);
  });
});

// Summary
console.log(`\n${'='.repeat(60)}`);
console.log('Category distribution in dictionary:');
const catCounts = {};
dictEntries.forEach(e => {
  catCounts[e.category] = (catCounts[e.category] || 0) + 1;
});
Object.entries(catCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});
