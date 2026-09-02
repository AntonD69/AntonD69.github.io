import { fetchSheetAndSaveAsJson } from './utils.js';

// --- CONFIGURATION ---
const SHEET_NAME = 'ParkRuns';
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRS8h9ayT8YD-0XTYiGbltU0xYzYCy6WAZB-2h3eYU-Hpu0UEICvfsR1RjRgw2Wp7k-Ho0RKeE4tDfk/pub?output=csv&gid=2068862084';
const OUTPUT_FILE_NAME = 'parkruns.json';

// --- EXECUTION ---
try {
  await fetchSheetAndSaveAsJson(SHEET_NAME, GOOGLE_SHEET_CSV_URL, OUTPUT_FILE_NAME);
} catch (error) {
  console.error(`Failed execution for ${SHEET_NAME}:`, error);
  process.exit(1);
}