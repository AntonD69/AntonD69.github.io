import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// Configuration
const TARGET_DIR = path.join(process.cwd(), 'public', 'images');
const WEBP_QUALITY = 80; // 0-100 quality setting
const DELETE_ORIGINALS = true; // Set to true if you want to remove .jpg/.png after conversion

const VALID_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

async function convertDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // If it's a folder, recurse through subdirectories
      if (entry.isDirectory()) {
        await convertDirectory(fullPath);
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if (!VALID_EXTENSIONS.has(ext)) continue;

      const outputName = `${path.basename(entry.name, ext)}.webp`;
      const outputPath = path.join(dirPath, outputName);

      console.log(`Converting: ${entry.name} -> ${outputName}`);

      await sharp(fullPath)
        .webp({ quality: WEBP_QUALITY })
        .toFile(outputPath);

      if (DELETE_ORIGINALS) {
        await fs.unlink(fullPath);
        console.log(`Deleted original: ${entry.name}`);
      }
    }
  } catch (err) {
    console.error(`Error processing directory ${dirPath}:`, err);
  }
}

console.log(`Starting WebP conversion in: ${TARGET_DIR}`);
await convertDirectory(TARGET_DIR);
console.log('Conversion complete!');