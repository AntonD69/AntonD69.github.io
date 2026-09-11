import fs from 'fs';
import path from 'path';
import * as utils from './utils.js';

// --- Configuration ---
const JSON_FILE_PATH = './src/data/photo-albums.json';
const TEMPLATES_DIR = './src/templates/photo-album';
const OUTPUT_DIR = './dist';

// --- Utility Functions ---
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-');
}

function replacePlaceholders(template, data) {
  return template.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (match, key) => {
    return data[key] !== undefined && data[key] !== null ? data[key] : '';
  });
}

// Normalizes Windows backslashes (\) to Web forward slashes (/)
function normalizeImagePath(imagePath) {
  if (!imagePath) return '';
  return imagePath.replace(/\\/g, '/');
}

export function build_PhotoAlbum_pages(navHtml, isStrictMode) {
  // 1. Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 2. Load templates
  const indexTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'album-index-page.html'), 'utf-8');
  const displayTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'album-display-page.html'), 'utf-8');
  const cardTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'photo-card.html'), 'utf-8');
  const indexCardTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'index-card.html'), 'utf-8');

  // 3. Read and parse JSON data
  const rawData = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
  const items = JSON.parse(rawData);

  // 4. Group data into albums using the "Folder" property
  const albumsMap = new Map();

  items.forEach(item => {
    if (!item.Folder) return;

    if (!albumsMap.has(item.Folder)) {
      albumsMap.set(item.Folder, {
        meta: null,
        photos: []
      });
    }

    const album = albumsMap.get(item.Folder);

    // If AlbumId is not null, this entry defines the Album Cover / Metadata
    if (item.AlbumId !== null && item.AlbumId !== undefined) {
      album.meta = item;
    } else {
      // Otherwise, it's an individual photo item inside the album
      album.photos.push(item);
    }
  });

  // 5. Build individual Album Display pages & collect Index Cards
  const indexCardsHtml = [];

  albumsMap.forEach((albumData, folderName) => {
    const albumMeta = albumData.meta || {};
    const albumTitle = albumMeta.AlbumName || folderName;
    const slug = slugify(albumTitle);
    const fileName = `album-${slug}.html`;

    // --- Build Photo Cards HTML for this Album ---
    let photosGridHtml = '<div class="photo-grid">\n';

    albumData.photos.forEach(photo => {
      // Parse optional MetaData array (e.g., ["Date:2022-09-03"])
      let photoDate = photo.Date || '';
      if (!photoDate && Array.isArray(photo.MetaData)) {
        const dateMeta = photo.MetaData.find(m => m.startsWith('Date:'));
        if (dateMeta) {
          photoDate = dateMeta.replace('Date:', '').trim();
        }
      }

      const formattedDescription = photo.Description
        ? photo.Description.replace(/\n/g, '<br>')
        : '';

      const cleanImagePath = normalizeImagePath(photo.Image);

      const cardHtml = replacePlaceholders(cardTemplate, {
        ...photo,
        Image: cleanImagePath,
        Description: formattedDescription,
        Date: photo.Date || photoDate,
        Folder: folderName
      });

      photosGridHtml += `  ${cardHtml}\n`;
    });

    photosGridHtml += '</div>\n';

    // --- Generate Album Display Page ---
    const displayHtml = replacePlaceholders(displayTemplate, {
      AlbumName: albumTitle,
      Name: albumTitle,
      Date: albumMeta.Date || '',
      Description: albumMeta.Description ? albumMeta.Description.replace(/\n/g, '<br>') : '',
      Content: photosGridHtml
    }).replace('<!--NAV_MENU-->', navHtml);

    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), displayHtml);

    // --- Build Index Card for Main Index Page ---
    const coverImage = normalizeImagePath(albumMeta.Image || (albumData.photos[0] ? albumData.photos[0].Image : ''));

    const formattedIndexDescription = albumMeta.Description
      ? albumMeta.Description.replace(/\n/g, '<br>')
      : '';

    const indexCardHtml = replacePlaceholders(indexCardTemplate, {
      ...albumMeta,
      AlbumName: albumTitle,
      Name: albumTitle,
      Image: coverImage,
      Link: fileName,
      Description: formattedIndexDescription,
      Folder: folderName
    });

    indexCardsHtml.push(indexCardHtml);
  });

  // 6. Build the Photo Album Index Page
  const indexContentHtml = `<div class="album-grid">\n  ${indexCardsHtml.join('\n  ')}\n</div>`;
  
  const indexPageHtml = replacePlaceholders(indexTemplate, {
    Content: indexContentHtml,
    Title: 'Photo Album Index'
  }).replace('<!--NAV_MENU-->', navHtml);

  fs.writeFileSync(path.join(OUTPUT_DIR, 'album-index.html'), indexPageHtml);

  console.log(`Successfully generated album-index.html and ${albumsMap.size} album pages!`);
}