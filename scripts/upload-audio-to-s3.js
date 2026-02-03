#!/usr/bin/env node

/**
 * Upload audio files to S3 bucket and update words.json with S3 URLs
 *
 * Prerequisites:
 *   - AWS CLI configured with 'personal' profile
 *   - Audio files in public/audio/ directory
 *
 * Usage:
 *   node scripts/upload-audio-to-s3.js --bucket <bucket-name>
 *
 * Options:
 *   --bucket <name>     S3 bucket name (required)
 *   --prefix <path>     S3 key prefix (default: 'audio/')
 *   --dry-run           Show what would be uploaded without uploading
 *   --update-words      Update words.json with S3 URLs after upload
 *
 * Example:
 *   node scripts/upload-audio-to-s3.js --bucket geysinan-assets --update-words
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(`--${name}`);
  return index !== -1 ? args[index + 1] : undefined;
};
const hasFlag = (name) => args.includes(`--${name}`);

const bucket = getArg('bucket');
const prefix = getArg('prefix') || 'audio/';
const dryRun = hasFlag('dry-run');
const updateWords = hasFlag('update-words');
const awsProfile = 'personal';

if (!bucket) {
  console.error('Error: --bucket is required');
  console.error('Usage: node scripts/upload-audio-to-s3.js --bucket <bucket-name>');
  process.exit(1);
}

const audioDir = path.join(__dirname, '../public/audio');
const wordsPath = path.join(__dirname, '../src/data/words.json');

// Check if audio directory exists
if (!fs.existsSync(audioDir)) {
  console.error(`Error: Audio directory not found at ${audioDir}`);
  console.error('Please add audio files to public/audio/ first');
  process.exit(1);
}

// Get list of audio files
const audioFiles = fs.readdirSync(audioDir).filter(file =>
  file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.m4a')
);

if (audioFiles.length === 0) {
  console.error('No audio files found in public/audio/');
  console.error('Supported formats: .mp3, .wav, .m4a');
  process.exit(1);
}

console.log(`Found ${audioFiles.length} audio files to upload`);
console.log(`Bucket: ${bucket}`);
console.log(`Prefix: ${prefix}`);
console.log(`Profile: ${awsProfile}`);
console.log('');

const s3BaseUrl = `https://${bucket}.s3.amazonaws.com/${prefix}`;
const uploadedFiles = [];

for (const file of audioFiles) {
  const localPath = path.join(audioDir, file);
  const s3Key = `${prefix}${file}`;
  const s3Url = `${s3BaseUrl}${file}`;

  if (dryRun) {
    console.log(`[DRY RUN] Would upload: ${file} -> s3://${bucket}/${s3Key}`);
  } else {
    console.log(`Uploading: ${file}...`);
    try {
      execSync(
        `aws s3 cp "${localPath}" "s3://${bucket}/${s3Key}" --profile ${awsProfile} --acl public-read`,
        { stdio: 'pipe' }
      );
      console.log(`  ✓ Uploaded to ${s3Url}`);
      uploadedFiles.push({ filename: file, s3Url });
    } catch (error) {
      console.error(`  ✗ Failed to upload ${file}`);
      console.error(error.message);
    }
  }
}

console.log('');
console.log(`Upload complete: ${uploadedFiles.length}/${audioFiles.length} files`);

// Update words.json with S3 URLs if requested
if (updateWords && !dryRun && uploadedFiles.length > 0) {
  console.log('');
  console.log('Updating words.json with S3 URLs...');

  const words = JSON.parse(fs.readFileSync(wordsPath, 'utf-8'));
  let updatedCount = 0;

  for (const word of words) {
    const filename = word.audioUrl.replace('/audio/', '');
    const uploaded = uploadedFiles.find(f => f.filename === filename);

    if (uploaded) {
      word.audioUrl = uploaded.s3Url;
      updatedCount++;
    }
  }

  // Backup original
  const backupPath = wordsPath.replace('.json', '.backup.json');
  fs.copyFileSync(wordsPath, backupPath);
  console.log(`  Backed up original to ${backupPath}`);

  // Write updated file
  fs.writeFileSync(wordsPath, JSON.stringify(words, null, 2));
  console.log(`  Updated ${updatedCount} words with S3 URLs`);
}

// Show summary
if (!dryRun) {
  console.log('');
  console.log('Summary:');
  console.log(`  S3 Base URL: ${s3BaseUrl}`);
  console.log(`  Files uploaded: ${uploadedFiles.length}`);

  // Check for missing files based on words.json
  const words = JSON.parse(fs.readFileSync(wordsPath, 'utf-8'));
  const expectedFiles = words.map(w => w.audioUrl.replace('/audio/', '').replace(s3BaseUrl, ''));
  const missingFiles = expectedFiles.filter(f =>
    !audioFiles.includes(f) && !f.startsWith('http')
  );

  if (missingFiles.length > 0) {
    console.log('');
    console.log(`  Missing audio files (${missingFiles.length}):`);
    missingFiles.forEach(f => console.log(`    - ${f}`));
  }
}
