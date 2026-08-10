import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import csv from 'csv-parser';
import { Readable } from 'stream';
import * as utils from './utils.js';



export function build_GeocachesFound_Page(navHtml) {
  //-- STEP 2 -  Create Geocaches-Found page
  const rawData = fs.readFileSync(path.resolve('data/geocachesFound.json'), 'utf-8');
  const geocachesFound = JSON.parse(rawData);
  const cardTemplate = fs.readFileSync(path.resolve('src/templates/geocaching/geocacheFound-card.html'), 'utf-8');
  const pageTemplate = fs.readFileSync(path.resolve('src/templates/geocaching/geocachesFound-page.html'), 'utf-8');

  console.log('      Successfully generated parkruns.html with injected menu!.');
}
