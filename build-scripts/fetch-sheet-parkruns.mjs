import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

// --- CONFIGURATION ---
// Replace this with your Google Sheet published CSV URL
// (File -> Share -> Publish to web -> Select tab -> Comma-separated values (.csv))
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRS8h9ayT8YD-0XTYiGbltU0xYzYCy6WAZB-2h3eYU-Hpu0UEICvfsR1RjRgw2Wp7k-Ho0RKeE4tDfk/pub?output=csv&gid=2068862084';

// File destination
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_PATH = path.resolve(__dirname, '../data/parkruns.json');

/**
 * Automatically converts raw string values into JS types.
 * - "true"/"false" -> boolean
 * - "123" / "45.6" -> number
 * - "tag1, tag2" -> array (if column name ends in `[]` or `_list`)
 * - "" -> null
 */
function parseTypedValue(key, rawValue) {
  if (rawValue === null || rawValue === undefined) return null;
  const trimmed = String(rawValue).trim();

  // Empty cells
  if (trimmed === '') return null;

  // Booleans
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;

  // Numbers (ensures non-empty and valid numeric string)
  if (!isNaN(trimmed) && trimmed !== '') {
    return Number(trimmed);
  }

  // Lists/Arrays (Handles comma-separated values if column header indicates a list)
  if (key.endsWith('[]') || key.endsWith('_list')) {
    return trimmed.split(',').map(item => item.trim());
  }

  // Fallback to plain String
  return trimmed;
}

async function fetchAndTransformSheet() {
  console.log('Fetching park-run data from Google sheet...');

  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const csvText = await response.text();

    // Parse raw CSV text into array of key-value records
    const rawRecords = parse(csvText, {
      columns: true,            // Uses the first row as object keys
      skip_empty_lines: true,   // Skips blank lines in the sheet
      trim: true                // Trims whitespace around headers/cells
    });

    // Transform string values into typed JSON fields
    const typedRecords = rawRecords.map(row => {
      const typedRow = {};

      for (const [key, value] of Object.entries(row)) {
        // Clean key name if it ended with array markers like "tags[]" -> "tags"
        const cleanKey = key.replace(/\[\]$/, '');
        typedRow[cleanKey] = parseTypedValue(key, value);
      }

      return typedRow;
    });

    // Ensure output folder exists
    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write formatted JSON to file
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(typedRecords, null, 2), 'utf-8');
    console.log(`Successfully written ${typedRecords.length} records to: ${OUTPUT_PATH}`);

  } catch (error) {
    console.error('Failed to update data from Google Sheets:', error.message);
    process.exit(1);
  }
}

fetchAndTransformSheet();