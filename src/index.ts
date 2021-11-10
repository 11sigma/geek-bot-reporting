import Fsp from 'node:fs/promises';
import Process from 'node:process';

import Clipboardy from 'clipboardy';
import Dotenv from 'dotenv';

Dotenv.config();

const shouldCopy = Process.argv.slice(2).includes('copy');

await generate();
if (shouldCopy) {
  await copy();
}

async function generate() {
  const { run } = await import('./app.js');
  await run();
  console.log(`💾 Saved in results.csv!`);
}

async function copy() {
  const csv = await Fsp.readFile('results.csv', 'utf8');
  await Clipboardy.write(csv);
  console.log(`📋 Copied to clipboard!`);
}
