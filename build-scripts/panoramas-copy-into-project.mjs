import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve paths relative to the current project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const externalSourceDir = path.resolve('D:/9_Backup/Static-WebSite/Panoramas/3_Webp-Images');
const projectPublicDir = path.join('public', 'images', 'panoramas', 'images');

// 1. Ensure the external source folder exists
if (!fs.existsSync(externalSourceDir)) {
  console.error(`\x1b[31mError: External source directory does not exist: '${externalSourceDir}'\x1b[0m`);
  process.exit(1);
}

// 2. Ensure the local public target directory structure exists
if (!fs.existsSync(projectPublicDir)) {
  fs.mkdirSync(projectPublicDir, { recursive: true });
  console.log(`\x1b[34mCreated target folder structure: '${projectPublicDir}'\x1b[0m`);
}

// 3. Copy files from external directory to target folder
const files = fs.readdirSync(externalSourceDir, { withFileTypes: true });
let copiedCount = 0;

for (const entry of files) {
  if (entry.isFile()) {
    const srcFile = path.join(externalSourceDir, entry.name);
    const destFile = path.join(projectPublicDir, entry.name);

    fs.copyFileSync(srcFile, destFile);
    copiedCount++;
  }
}

console.log(`\x1b[32mSuccessfully copied ${copiedCount} file(s) to '${projectPublicDir}'\x1b[0m`);