import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import * as utils from './utils.js';

// --- CONFIGURATION ---
// Replace this with your Google Sheet published CSV URL
// (File -> Share -> Publish to web -> Select tab -> Comma-separated values (.csv))
const google_sheet_csv_url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRS8h9ayT8YD-0XTYiGbltU0xYzYCy6WAZB-2h3eYU-Hpu0UEICvfsR1RjRgw2Wp7k-Ho0RKeE4tDfk/pub?output=csv&gid=251368689';

// File destination
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const outputpathAndFileName = path.resolve(dirname, '../data/geocachesFound.json');

utils.fetchAndTransformSheet("geocaches", google_sheet_csv_url,outputpathAndFileName);