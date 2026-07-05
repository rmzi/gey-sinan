#!/usr/bin/env node

/**
 * Promote volunteer-submitted recordings from the recordings bucket's
 * uploads/ prefix into the static bucket as the canonical audio for a word.
 *
 * Volunteers upload via the presign Lambda into:
 *   s3://<recordings-bucket>/uploads/<speakerId>/<wordId>-<epochMillis>.<ext>
 *
 * Approving a recording copies it to:
 *   s3://<static-bucket>/audio/<wordId>.<ext>
 * and updates apps/expo/data/words.json so that word's audioUrl points at it.
 *
 * Prerequisites:
 *   - AWS CLI configured with a profile that can read the recordings bucket
 *     and write to the static bucket
 *
 * Usage:
 *   node scripts/promote-recordings.js --list [--env <env>]
 *   node scripts/promote-recordings.js --approve <key> [--word <wordId>] [--env <env>]
 *
 * Options:
 *   --list                Show pending uploads, grouped by word
 *   --approve <key>       Promote the given S3 key (relative to uploads/, or full key)
 *   --word <wordId>       Override the wordId inferred from the key
 *   --env <env>           Environment: dev or prod (default: dev)
 *   --recordings-bucket   Override the recordings bucket name
 *   --static-bucket       Override the static bucket name
 *   --profile <name>      AWS CLI profile (default: personal)
 *   --dry-run             Show what would happen without making changes
 *
 * Examples:
 *   node scripts/promote-recordings.js --list
 *   node scripts/promote-recordings.js --approve uploads/amina/salaam-1719858123456.webm
 *   node scripts/promote-recordings.js --approve salaam-1719858123456.webm --word salaam --dry-run
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(`--${name}`);
  return index !== -1 ? args[index + 1] : undefined;
};
const hasFlag = (name) => args.includes(`--${name}`);

const PROJECT_NAME = 'geysinan';
const env = getArg('env') || 'dev';

if (!['dev', 'prod'].includes(env)) {
  console.error(`Error: --env must be 'dev' or 'prod' (got '${env}')`);
  process.exit(1);
}

const namePrefixParts = [PROJECT_NAME, env];
const defaultBucketName = (purpose) => [...namePrefixParts, purpose].join('-');

const recordingsBucket = getArg('recordings-bucket') || defaultBucketName('recordings');
const staticBucket = getArg('static-bucket') || defaultBucketName('static');
const awsProfile = getArg('profile') || 'personal';
const dryRun = hasFlag('dry-run');
const list = hasFlag('list');
const approveKey = getArg('approve');
const wordOverride = getArg('word');

const wordsPath = path.join(__dirname, '../apps/expo/data/words.json');
const UPLOADS_PREFIX = 'uploads/';

// Matches uploads/<speakerId>/<wordId>-<epochMillis>.<ext>
const KEY_PATTERN = /^uploads\/([^/]+)\/([a-z0-9-]+)-(\d+)\.([a-z0-9]+)$/;

// argv array, no shell: object keys echo volunteer-supplied speakerId/wordId,
// so never let them pass through /bin/sh interpolation.
function runAwsCli(cliArgs) {
  return execFileSync('aws', cliArgs, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf-8' });
}

function listUploads() {
  const output = runAwsCli([
    's3api', 'list-objects-v2',
    '--bucket', recordingsBucket,
    '--prefix', UPLOADS_PREFIX,
    '--profile', awsProfile,
  ]);

  let parsed;
  try {
    parsed = JSON.parse(output || '{}');
  } catch (error) {
    console.error('Error: failed to parse aws s3api output');
    console.error(error.message);
    process.exit(1);
  }

  return (parsed.Contents || [])
    .map((obj) => obj.Key)
    .filter((key) => key && key !== UPLOADS_PREFIX);
}

function parseKey(key) {
  // Allow passing either the full key or just the trailing filename.
  const normalizedKey = key.startsWith(UPLOADS_PREFIX) ? key : null;
  const match = normalizedKey ? normalizedKey.match(KEY_PATTERN) : null;

  if (match) {
    const [, speakerId, wordId, epochMillis, ext] = match;
    return { key: normalizedKey, speakerId, wordId, epochMillis, ext };
  }

  // Fallback: try to match against the filename portion only.
  const filename = key.split('/').pop();
  const filenameMatch = filename.match(/^([a-z0-9-]+)-(\d+)\.([a-z0-9]+)$/);
  if (!filenameMatch) {
    return null;
  }

  const [, wordId, epochMillis, ext] = filenameMatch;
  return { key, speakerId: null, wordId, epochMillis, ext };
}

function groupByWord(keys) {
  const groups = {};
  for (const key of keys) {
    const parsed = parseKey(key);
    const wordId = parsed ? parsed.wordId : 'unrecognized';
    if (!groups[wordId]) groups[wordId] = [];
    groups[wordId].push({ key, parsed });
  }
  return groups;
}

function doList() {
  console.log(`Recordings bucket: ${recordingsBucket}`);
  console.log(`Environment: ${env}`);
  console.log('');

  const keys = listUploads();
  if (keys.length === 0) {
    console.log('No pending uploads found.');
    return;
  }

  const groups = groupByWord(keys);
  const wordIds = Object.keys(groups).sort();

  for (const wordId of wordIds) {
    console.log(`${wordId} (${groups[wordId].length}):`);
    for (const { key, parsed } of groups[wordId]) {
      const speaker = parsed && parsed.speakerId ? parsed.speakerId : 'unknown';
      const when = parsed ? new Date(Number(parsed.epochMillis)).toISOString() : 'unknown time';
      console.log(`  - ${key}  (speaker: ${speaker}, recorded: ${when})`);
    }
  }

  console.log('');
  console.log(`Total pending: ${keys.length}`);
}

function doApprove() {
  const parsed = parseKey(approveKey);
  if (!parsed) {
    console.error(`Error: could not parse key '${approveKey}'`);
    console.error('Expected format: uploads/<speakerId>/<wordId>-<epochMillis>.<ext>');
    process.exit(1);
  }

  const fullKey = parsed.key.startsWith(UPLOADS_PREFIX) ? parsed.key : `${UPLOADS_PREFIX}${approveKey}`;
  const wordId = wordOverride || parsed.wordId;
  const ext = parsed.ext;
  const destKey = `audio/${wordId}.${ext}`;

  console.log(`Source: s3://${recordingsBucket}/${fullKey}`);
  console.log(`Destination: s3://${staticBucket}/${destKey}`);
  console.log(`Word: ${wordId}`);
  console.log('');

  if (dryRun) {
    console.log('[DRY RUN] Would copy object and update words.json');
  } else {
    console.log('Copying object...');
    try {
      runAwsCli([
        's3', 'cp',
        `s3://${recordingsBucket}/${fullKey}`,
        `s3://${staticBucket}/${destKey}`,
        '--profile', awsProfile,
        '--cache-control', 'public, max-age=31536000, immutable',
      ]);
      console.log('  Copied successfully');
    } catch (error) {
      console.error('  Failed to copy object');
      console.error(error.message);
      process.exit(1);
    }
  }

  // Update words.json
  if (!fs.existsSync(wordsPath)) {
    console.error(`Error: words.json not found at ${wordsPath}`);
    process.exit(1);
  }

  const words = JSON.parse(fs.readFileSync(wordsPath, 'utf-8'));
  const word = words.find((w) => w.id === wordId);

  if (!word) {
    console.error(`Error: no word with id '${wordId}' found in words.json`);
    console.error('Use --word <wordId> to specify the correct id.');
    process.exit(1);
  }

  const newAudioUrl = `/audio/${wordId}.${ext}`;

  if (dryRun) {
    console.log(`[DRY RUN] Would set words.json entry '${wordId}'.audioUrl = '${newAudioUrl}'`);
    console.log(`[DRY RUN] (currently: '${word.audioUrl}')`);
    return;
  }

  console.log('');
  console.log('Updating words.json...');
  const backupPath = wordsPath.replace('.json', '.backup.json');
  fs.copyFileSync(wordsPath, backupPath);
  console.log(`  Backed up original to ${backupPath}`);

  word.audioUrl = newAudioUrl;
  fs.writeFileSync(wordsPath, JSON.stringify(words, null, 2) + '\n');
  console.log(`  Updated '${wordId}'.audioUrl to '${newAudioUrl}'`);
}

if (list) {
  doList();
} else if (approveKey) {
  doApprove();
} else {
  console.error('Error: specify --list or --approve <key>');
  console.error('Usage:');
  console.error('  node scripts/promote-recordings.js --list [--env <env>]');
  console.error('  node scripts/promote-recordings.js --approve <key> [--word <wordId>] [--env <env>]');
  process.exit(1);
}
