import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

// Resolve current directory path in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define directories using cross-platform paths
const sourceDir = path.resolve('D:/9_Backup/Static-WebSite/Panoramas/2_Panoramas');
const outputDir = path.resolve('D:/9_Backup/Static-WebSite/Panoramas/3_Webp-Images');

// 1. Ensure output directory exists and clean old .webp files
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`\x1b[34mCreated folder: '${outputDir}'\x1b[0m`);
} else {
  const existingFiles = fs.readdirSync(outputDir);
  let deletedCount = 0;
  for (const file of existingFiles) {
    if (file.toLowerCase().endsWith('.webp')) {
      fs.unlinkSync(path.join(outputDir, file));
      deletedCount++;
    }
  }
  console.log(`\x1b[31mDeleted ${deletedCount} .webp files in folder: '${outputDir}'\x1b[0m`);
}

// 2. Run ImageMagick mogrify commands
const extensions = ['*.png', '*.jpg', '*.jpeg'];
for (const ext of extensions) {
  const inputPattern = path.join(sourceDir, ext);
  //const command = `magick mogrify -verbose -path "${outputDir}" -format webp -quality 80 -resize "10000>" "${inputPattern}"`;
  const command = `magick mogrify -verbose -path "${outputDir}" -format webp -quality 80 "${inputPattern}"`;

  try {
    execSync(command, { stdio: 'inherit' });
  } catch (err) {
    // mogrify throws an error if no files match the glob pattern; safe to ignore
  }
}

// 3. Count files recursively helper function
function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countFiles(fullPath);
    } else if (entry.isFile()) {
      count++;
    }
  }
  return count;
}

const fileCount1 = countFiles(sourceDir);
const fileCount2 = countFiles(outputDir);

console.log(`\x1b[34mTotal files found in '${sourceDir}': ${fileCount1}\x1b[0m`);
console.log(`\x1b[33mTotal files found in '${outputDir}': ${fileCount2}\x1b[0m`);