import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import csv from 'csv-parser';
import { Readable } from 'stream';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRS8h9ayT8YD-0XTYiGbltU0xYzYCy6WAZB-2h3eYU-Hpu0UEICvfsR1RjRgw2Wp7k-Ho0RKeE4tDfk/pub?output=csv';

async function fetchSheetToJSON() {
  console.log('Fetching data from Google Sheets...');

  const response = await fetch(SHEET_CSV_URL);
  const csvText = await response.text();
  
  const results = [];
  const stream = Readable.from(csvText);

  stream
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // Save the output to your data folder
      const outputPath = path.resolve('data/parkruns.json');
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
      console.log(`Successfully saved ${results.length} records to data/parkruns.json`);
    });
}

fetchSheetToJSON();

// import fs from 'fs';
// import path from 'path';

// // Helper function to replace {{ key }} placeholders
// function renderTemplate(template, data) {
//   let result = template;

//   // Handle conditional logic like {{ #if pb }}class-name{{ /if }}
//   result = result.replace(/\{\{\s*#if\s+(\w+)\s*\}\}(.*?)\{\{\s*\/if\s*\}\}/g, (_, key, content) => {
//     return data[key] ? content : '';
//   });

//   // Handle variable replacements like {{ name }}
//   Object.keys(data).forEach(key => {
//     const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
//     result = result.replace(regex, data[key]);
//   });

//   return result;
// }

// function buildSite() {
//   console.log('Generating static HTML files...');

//   // 1. Read sources
//   const rawData = fs.readFileSync(path.resolve('data/parkruns.json'), 'utf-8');
//   const items = JSON.parse(rawData);
//   const cardTemplate = fs.readFileSync(path.resolve('src/templates/parkrun-card.html'), 'utf-8');
//   const layoutTemplate = fs.readFileSync(path.resolve('src/templates/layout.html'), 'utf-8');

//   // 2. Render each item into HTML cards
//   const cardsHtml = items.map(item => renderTemplate(cardTemplate, item)).join('\n');

//   // 3. Inject cards into the main layout
//   const finalHtml = layoutTemplate.replace('{{ content }}', cardsHtml);

//   // 4. Output the compiled index.html at root
//   fs.writeFileSync(path.resolve('index.html'), finalHtml, 'utf-8');

//   console.log('Successfully generated index.html!');
// }

// buildSite();