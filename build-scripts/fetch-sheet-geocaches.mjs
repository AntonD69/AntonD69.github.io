import { fetchSheetAndSaveAsJson } from './utils.js';

// --- CONFIGURATION ---
const SHEET_NAME = 'geoCaches';
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRS8h9ayT8YD-0XTYiGbltU0xYzYCy6WAZB-2h3eYU-Hpu0UEICvfsR1RjRgw2Wp7k-Ho0RKeE4tDfk/pub?output=csv&gid=251368689';
const OUTPUT_FILE_NAME = 'geocachesFound.json';

// --- EXECUTION ---
try {
  await fetchSheetAndSaveAsJson(SHEET_NAME, GOOGLE_SHEET_CSV_URL, OUTPUT_FILE_NAME);
} catch (error) {
  console.error(`Failed execution for ${SHEET_NAME}:`, error);
  process.exit(1);
}

// import path from 'path';
// import { fileURLToPath } from 'url';
// import * as utils from './utils.js';

// // --- CONFIGURATION ---
// // Replace this with your Google Sheet published CSV URL
// // (File -> Share -> Publish to web -> Select tab -> Comma-separated values (.csv))
// const google_sheet_csv_url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRS8h9ayT8YD-0XTYiGbltU0xYzYCy6WAZB-2h3eYU-Hpu0UEICvfsR1RjRgw2Wp7k-Ho0RKeE4tDfk/pub?output=csv&gid=251368689';

// // File destination
// const filename = fileURLToPath(import.meta.url);
// const dirname = path.dirname(filename);
// const outputpathAndFileName = path.resolve(dirname, '../src/data/geocachesFound.json');

// await utils.fetchAndTransformSheet("geocaches", google_sheet_csv_url,outputpathAndFileName);