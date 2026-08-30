import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import csv from 'csv-parser';
import { Readable } from 'stream';
import * as utils from './utils.js';

export function build_Parkrun_page(navHtml) {
  //-- STEP 1 - Initialize and read data
  const parkrunJsonFile = 'src/data/parkruns.json';
  const rawData = fs.readFileSync(path.resolve(parkrunJsonFile), 'utf-8');
  const parkruns = JSON.parse(rawData);
  const cardTemplate = fs.readFileSync(path.resolve('src/templates/parkruns/parkruns-card.html'), 'utf-8');
  const parkrunLayoutTemplate = fs.readFileSync(path.resolve('src/templates/parkruns/parkruns-page.html'), 'utf-8');
  const imagesFolder = path.resolve('dist/webp-images/parkruns'); // Adjust path to match your actual output folder

  console.log(`Processing parkruns`);

  // -- NEW STEP: Image auditing & WebP normalization loop
  parkruns.forEach((parkrun) => {
    let imageName = (parkrun.PhotoUrl && parkrun.PhotoUrl.trim() !== 'null' && parkrun.PhotoUrl.trim() !== '') 
      ? parkrun.PhotoUrl.trim() 
      : '';

    if (!imageName) {
      // Set fallback image if data is missing
      imageName = 'EmptyParkrun2.webp';
    } else {
      // Force replace .jpg / .jpeg / .png extensions with .webp
      imageName = imageName.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }

    // Verify existence in dist folder, defaulting to fallback if missing
    const imagePath = path.join(imagesFolder, imageName);
    const finalImage = fs.existsSync(imagePath) ? imageName : 'EmptyParkrun2.webp';

    // Standardize PhotoUrl property back to the JSON object
    parkrun.PhotoUrl = finalImage;
  });

  // Save the updated JSON back to disk with the new .webp links
  fs.writeFileSync(path.resolve(parkrunJsonFile), JSON.stringify(parkruns, null, 2), 'utf-8');

// -- STEP 2 - Render each item into HTML cards
  const cardsHtml = parkruns.map(item => {
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

      // Check if NPR exists and is truthy
      const nprClass = item.Type == "NPR" ? 'npr-title' : '';
	  console.log ("nprClass:"  + nprClass);

    return utils.renderTemplate(cardTemplate, {
      ...item,
      // PhotoUrl is already guaranteed to be a valid .webp string from the audit loop
      PhotoUrl: item.PhotoUrl, 
      country_class: countryClass,
      npr_class: nprClass,
      youtube_button_html: youtubeBtnHtml
    });
  }).join('\n');

  // -- STEP 3 -- Alphabet Grid
  const completedLetters = new Set(
    parkruns
      .map(item => (item.Name || '').trim().charAt(0).toUpperCase())
      .filter(char => /[A-Z]/.test(char))
  );

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


  // -- STEP 4 -- Inject cards into the main layout
  const parkrunsFinalHtml = parkrunLayoutTemplate
          .replace('<!--NAV_MENU-->', navHtml)
          .replace('{{ content }}', cardsHtml)
          .replace('{{ alphabet_grid }}' , alphabetGridHtml);

  // Output the compiled HTML file at root
  fs.writeFileSync(path.resolve('dist/parkruns.html'), parkrunsFinalHtml, 'utf-8');

  console.log('      Successfully generated parkruns.html with injected menu!');
}