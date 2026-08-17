import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import csv from 'csv-parser';
import { Readable } from 'stream';
import * as utils from './utils.js';



export function build_Parkrun_page(navHtml) {
  //-- STEP 2 -  Create Parkrun
  const rawData = fs.readFileSync(path.resolve('src/data/parkruns.json'), 'utf-8');
  const parkruns = JSON.parse(rawData);
  const cardTemplate = fs.readFileSync(path.resolve('src/templates/parkruns/parkruns-card.html'), 'utf-8');
  const parkrunLayoutTemplate = fs.readFileSync(path.resolve('src/templates/parkruns/parkruns-page.html'), 'utf-8');

  // 2. Render each item into HTML cards
  const defaultParkRunImage = 'EmptyParkrun2.jpg';

  //-- ParkRuns.Map
  const cardsHtml = parkruns.map(item => {
    const photo = (item.PhotoUrl && item.PhotoUrl.trim() !== 'null') 
      ? item.PhotoUrl.trim() 
      : defaultParkRunImage;

      const hasYoutube = item.YoutubeLink && item.YoutubeLink !== 'null' && item.YoutubeLink.trim() !== '';

      const youtubeBtnHtml = hasYoutube
        ? `<div class="card-action-row">
            <a href="${item.YoutubeLink.trim()}" target="_blank" rel="noopener noreferrer" class="youtube-btn">
              <svg class="yt-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              Watch Video
            </a>
          </div>`
        : '';

      let countryClass = '';
      
      if (item.Country && item.Country.trim().toUpperCase() === 'ZA') {
        countryClass = 'za-country';}
      if (item.Country && item.Country.trim().toUpperCase() === 'NL') {
        countryClass = 'nl-country';}
      if (item.Country && item.Country.trim().toUpperCase() === 'SZ') {
        countryClass = 'sz-country';}

    return utils.renderTemplate(cardTemplate, {
      ...item,
      PhotoUrl: photo,
      country_class: countryClass,
      youtube_button_html: youtubeBtnHtml
    });
  }).join('\n');


  // -- STEP 2 -- Alpabet 
  const completedLetters = new Set(
    parkruns
      .map(item => (item.Name || '').trim().charAt(0).toUpperCase())
      .filter(char => /[A-Z]/.test(char))
  );

  // 2. Generate A-Z list
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const alphabetGridHtml = alphabet.map(letter => {
    const isDone = completedLetters.has(letter);
    
    if (isDone) {
        const match = parkruns.find(p => (p.Name || '').trim().toUpperCase().startsWith(letter));
        return `
          <div class="alphabet-card done" title="${match.Name}">
            <span class="letter">${letter}</span>
            <span class="status">✅</span>
            <span class="parkrun-name">${match.Name}</span>
          </div>
        `;
      } else {
        return `
          <div class="alphabet-card missing">
            <span class="letter">${letter}</span>
            <span class="status">❌</span>
            <span class="parkrun-name">Needed</span>
          </div>
        `;
      }
    }).join('\n');


  // 3. Inject cards into the main layout
  const parkrunsFinalHtml = parkrunLayoutTemplate
          .replace('<!--NAV_MENU-->', navHtml)
          .replace('{{ content }}', cardsHtml)
          .replace('{{ alphabet_grid }}' , alphabetGridHtml);

  // 4. Output the compiled index.html at root
  fs.writeFileSync(path.resolve('dist/parkruns.html'), parkrunsFinalHtml, 'utf-8');

  console.log('      Successfully generated parkruns.html with injected menu!.');
}