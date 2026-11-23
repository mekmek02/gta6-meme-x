// mend entry hand-in for the gta6-meme-x-01 bounty.
//
// The entry itself is the X post; this program's only job is to hand the
// gate the address of that post. POST.json sits in the repository root
// (the bot directory at grading time) and names the post. We copy it,
// byte for byte, into the output directory where the gate reads it.
//
// Local run:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const source = join(botDir, 'POST.json');
const target = join(outputDir, 'POST.json');

let raw: Buffer;
try {
  raw = readFileSync(source);
} catch (err) {
  console.error(`cannot read POST.json from ${botDir}: ${(err as Error).message}`);
  process.exit(1);
}

// The gate expects a JSON object naming the post; fail early if the file
// is not parseable JSON or the address is not an X status address, so a
// broken hand-in never reaches the judge.
try {
  const parsed = JSON.parse(raw.toString('utf8')) as { url?: unknown };
  if (typeof parsed.url !== 'string' || !/^https:\/\/x\.com\/[^/]+\/status\/\d+$/.test(parsed.url)) {
    console.error('POST.json does not name an X post url');
    process.exit(1);
  }
} catch {
  console.error('POST.json is not valid JSON');
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(target, raw);
