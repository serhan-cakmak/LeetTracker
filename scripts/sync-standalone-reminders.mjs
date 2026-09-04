import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { chapterReminders } from '../features/study-plan/reminders.js';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(scriptDirectory, '../interview-atlas.html');
const html = await readFile(htmlPath, 'utf8');
const start = '/* reminders:start */';
const end = '/* reminders:end */';
const startIndex = html.indexOf(start);
const endIndex = html.indexOf(end);

if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
  throw new Error('Standalone reminder markers were not found.');
}

const serialized = JSON.stringify(chapterReminders).replaceAll('<', '\\u003c');
const nextHtml = `${html.slice(0, startIndex + start.length)} ${serialized} ${html.slice(endIndex)}`;

await writeFile(htmlPath, nextHtml);
