// build-scripts/fetch-sheets.mjs
import { fetchSheetAndSaveAsJson } from './utils.js';
import { SHEETS_CONFIG } from './config.mjs';

// Extract keys passed via CLI: e.g., "node build-scripts/fetch-sheets.mjs geocaches parkruns"
const requestedKeys = process.argv.slice(2);

// If no arguments provided, fetch everything; otherwise fetch only requested keys
const keysToProcess = requestedKeys.length > 0 
  ? requestedKeys 
  : Object.keys(SHEETS_CONFIG);

async function run() {
  for (const key of keysToProcess) {
    const config = SHEETS_CONFIG[key];

    if (!config) {
      console.warn(`⚠️ Warning: Unknown target "${key}". Skipping.`);
      continue;
    }

    try {
      await fetchSheetAndSaveAsJson(config.name, config.csvUrl, config.outputFile);
    } catch (error) {
      console.error(`❌ Failed execution for ${config.name}:`, error);
      process.exit(1);
    }
  }
}

run();