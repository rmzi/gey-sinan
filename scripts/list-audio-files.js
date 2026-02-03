#!/usr/bin/env node

/**
 * This script extracts all required audio file URLs from the words.json
 * and outputs a list of audio files that need to be recorded.
 *
 * Usage: node scripts/list-audio-files.js
 *
 * Output formats:
 *   --json    Output as JSON array
 *   --csv     Output as CSV with word details
 *   --simple  Output just filenames (default)
 */

const fs = require('fs');
const path = require('path');

const wordsPath = path.join(__dirname, '../src/data/words.json');
const words = JSON.parse(fs.readFileSync(wordsPath, 'utf-8'));

const format = process.argv[2] || '--simple';

// Extract unique audio URLs
const audioFiles = words.map(word => ({
  filename: word.audioUrl.replace('/audio/', ''),
  id: word.id,
  harariLatin: word.harariLatin,
  english: word.english,
  category: word.category,
}));

switch (format) {
  case '--json':
    console.log(JSON.stringify(audioFiles, null, 2));
    break;

  case '--csv':
    console.log('filename,id,harari_latin,english,category');
    audioFiles.forEach(file => {
      console.log(`${file.filename},${file.id},"${file.harariLatin}","${file.english}",${file.category}`);
    });
    break;

  case '--simple':
  default:
    console.log('Audio files needed for Gey Sinan:');
    console.log('================================\n');

    // Group by category
    const byCategory = audioFiles.reduce((acc, file) => {
      if (!acc[file.category]) acc[file.category] = [];
      acc[file.category].push(file);
      return acc;
    }, {});

    for (const [category, files] of Object.entries(byCategory)) {
      console.log(`\n## ${category.toUpperCase()} (${files.length} files)`);
      console.log('-'.repeat(40));
      files.forEach(file => {
        console.log(`  ${file.filename.padEnd(25)} - "${file.harariLatin}" (${file.english})`);
      });
    }

    console.log('\n================================');
    console.log(`Total: ${audioFiles.length} audio files needed`);
    console.log('\nFiles should be placed in: public/audio/');
    console.log('Format: MP3 (recommended) or WAV');
    break;
}
