import fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';
// import fetch from 'node-fetch';
// import csv from 'csv-parser';
// import { Readable } from 'stream';

export function copyRecursiveSync(src, dest) {
  if (fs.existsSync(src)) {
    // Copy directory recursively (requires Node.js 16.7+)
    fs.rmSync(dest, { recursive: true, force: true });
    console.log(`  Clear out old files in ${dest}`);

    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`  Successfully copied ${src} -> ${dest}`);
  } else {
    console.warn(`  Source path non-existent, skipped copying: ${src}`);
  }
}

// Helper function to replace {{ key }} placeholders
export function renderTemplate(template, data) {
  let result = template;

  // Handle conditional logic like {{ #if pb }}class-name{{ /if }}
  result = result.replace(/\{\{\s*#if\s+(\w+)\s*\}\}(.*?)\{\{\s*\/if\s*\}\}/g, (_, key, content) => {
    return data[key] ? content : '';
  });

  // Handle variable replacements like {{ name }}
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    result = result.replace(regex, data[key]);
  });

  return result;
}

export function generateNavMenu(links, activePage) {
  const itemsHtml = links.map(link => {
    // Determine active state for highlighting
    const isActive = link.url.includes(activePage) ? 'class="active"' : '';
    return `        <li><a href="${link.url}" ${isActive}>${link.label}</a></li>`;
  }).join('\n');

  return `
    <nav class="site-nav">
      <ul>
${itemsHtml}
      </ul>
    </nav>
  `;
}


/*==================================================
    FETCH GOOGLE SHEET CODE
==================================================*/

export function parseTypedValue(key, rawValue) {
  /**
   * Automatically converts raw string values into JS types.
   * - "true"/"false" -> boolean
   * - "123" / "45.6" -> number
   * - "tag1, tag2" -> array (if column name ends in `[]` or `_list`)
   * - "" -> null
   */

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

export async function fetchAndTransformSheet(dataname, goole_sheet_csv_url, output_path) {
  console.log('Fetching ' + dataname + ' data from Google sheet ...');

  console.log ("dataname: " + dataname);
  console.log ("goole_sheet_csv_url: " + goole_sheet_csv_url);
  console.log ("output_path: " + output_path);
 
  try {
    const response = await fetch(goole_sheet_csv_url);

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
    const dir = path.dirname(output_path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write formatted JSON to file
    fs.writeFileSync(output_path, JSON.stringify(typedRecords, null, 2), 'utf-8');
    console.log(`Successfully written ${typedRecords.length} records to: ${output_path}`);

  } catch (error) {
    console.error('Failed to get data from Google Sheets:', error.message);
    process.exit(1);
  }
}