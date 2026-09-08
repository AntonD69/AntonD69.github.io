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
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    return data[key] !== undefined && data[key] !== null ? data[key] : '';
  });
}

export function build_PhotoAlbum_pages(navHtml, isStrictMode) {
  // 1. Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 2. Load templates (including index-card.html)
  const indexTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'album-index-page.html'), 'utf-8');
  const displayTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'album-display-page.html'), 'utf-8');
  const cardTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'photo-card.html'), 'utf-8');
  const indexCardTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'index-card.html'), 'utf-8');

  // 3. Read and parse JSON data
  const rawData = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
  const items = JSON.parse(rawData);

  // 4. Group data into albums (by Category) and individual photo items
  const albumsMap = new Map();

  items.forEach(item => {
    if (!item.Category) return;

    if (!albumsMap.has(item.Category)) {
      albumsMap.set(item.Category, {
        meta: null,
        photos: []
      });
    }

    const album = albumsMap.get(item.Category);

    // If SubCategory is empty, this item defines the Album metadata
    if (!item.SubCategory) {
      album.meta = item;
    } else {
      // It's a photo entry within the album
      album.photos.push(item);
    }
  });

  // 5. Build individual Album Display pages & collect Index Cards
  const indexCardsHtml = [];

  albumsMap.forEach((albumData, categoryName) => {
    const slug = slugify(categoryName);
    const fileName = `album-${slug}.html`;
    const albumMeta = albumData.meta || {};

    // --- Build Individual Album Page ---
    const subCategoriesMap = new Map();

    albumData.photos.forEach(photo => {
      const subCat = photo.SubCategory || 'General';
      if (!subCategoriesMap.has(subCat)) {
        subCategoriesMap.set(subCat, []);
      }
      subCategoriesMap.get(subCat).push(photo);
    });

    let albumContentHtml = '';

    subCategoriesMap.forEach((photos, subCatName) => {
      albumContentHtml += `<section class="subcategory-group">\n`;
      //albumContentHtml += `  <h2>${subCatName}</h2>\n`;
      albumContentHtml += `  <div class="photo-grid">\n`;

      photos.forEach(photo => {
        const formattedDescription = photo.Description
          ? photo.Description.replace(/\n/g, '<br>')
          : '';

        const cardHtml = replacePlaceholders(cardTemplate, {
          ...photo,
          Description: formattedDescription,
		  Date: photo.Date || '',
          Path: photo.Category
        });

        albumContentHtml += `    ${cardHtml}\n`;
      });

      albumContentHtml += `  </div>\n`;
      albumContentHtml += `</section>\n`;
    });

    const displayHtml = replacePlaceholders(displayTemplate, {
      Category: categoryName,
      Name: albumMeta.Name || categoryName,
      Description: albumMeta.Description ? albumMeta.Description.replace(/\n/g, '<br>') : '',
      Content: albumContentHtml
    }).replace('<!--NAV_MENU-->', navHtml);

    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), displayHtml);

    // --- Build Index Card for Index Page ---
    // Look for image in album metadata; if null, grab the first available photo's image
    const coverImage = albumMeta.Image || (albumData.photos[0] ? albumData.photos[0].Image : '') || '';

    const formattedIndexDescription = albumMeta.Description
      ? albumMeta.Description.replace(/\n/g, '<br>')
      : '';

    const indexCardHtml = replacePlaceholders(indexCardTemplate, {
      ...albumMeta,
      Category: categoryName,
      Name: albumMeta.Name || categoryName,
      Image: coverImage,
      Link: fileName,
      Description: formattedIndexDescription,
      Path: categoryName
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