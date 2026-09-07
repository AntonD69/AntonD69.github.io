// // fetch-all-sheets.mjs
// import { fetchSheetAndSaveAsJson } from './utils.js';
// import { SHEETS_CONFIG } from './config.js';

// async function main() {
//   for (const sheet of SHEETS_CONFIG) {
//     try {
//       console.log(`Processing: ${sheet.name}...`);
//       await fetchSheetAndSaveAsJson(sheet.name, sheet.csvUrl, sheet.outputFile);
//     } catch (error) {
//       console.error(`Failed execution for ${sheet.name}:`, error);
//       process.exit(1);
//     }
//   }
// }

// main();
// ~~~~~~


// import { fetchSheetAndSaveAsJson } from './utils.js';

// // --- CONFIGURATION ---
// const SHEET_NAME = 'Places-Been';
// const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRS8h9ayT8YD-0XTYiGbltU0xYzYCy6WAZB-2h3eYU-Hpu0UEICvfsR1RjRgw2Wp7k-Ho0RKeE4tDfk/pub?output=csv&gid=469896714';
// const OUTPUT_FILE_NAME = 'places-been.json';

// // --- EXECUTION ---
// try {
//   await fetchSheetAndSaveAsJson(SHEET_NAME, GOOGLE_SHEET_CSV_URL, OUTPUT_FILE_NAME);
// } catch (error) {
//   console.error(`Failed execution for ${SHEET_NAME}:`, error);
//   process.exit(1);
// }