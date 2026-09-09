import fs from 'fs';
import path from 'path';
import * as utils from './utils.js';

export function build_Panorama_page(navHtml) {
  // -- STEP 1 - Initialize and read data
  const panoramaJsonFile = 'src/data/panoramas.json';
  const rawData = fs.readFileSync(path.resolve(panoramaJsonFile), 'utf-8');
  const panoramas = JSON.parse(rawData);

  const cardTemplate = fs.readFileSync(path.resolve('src/templates/panoramas/panorama-card.html'), 'utf-8');
  const indexLayoutTemplate = fs.readFileSync(path.resolve('src/templates/panoramas/panorama-index-page.html'), 'utf-8');
  const displayTemplate = fs.readFileSync(path.resolve('src/templates/panoramas/pannellum-display.html'), 'utf-8');

  const thumbsFolder = path.resolve('dist/webp-images/panoramas/thumbnails');
  const imagesFolder = path.resolve('dist/webp-images/panoramas/images');

  // -- STEP 2 - Audit images & WebP normalization loop
  panoramas.forEach((item) => {
    // 1. Audit Thumbnail Image (Updated to item["Thumbnail-Image"])
    let thumbName = (item["Thumbnail-Image"] && item["Thumbnail-Image"].trim() !== '') 
      ? item["Thumbnail-Image"].trim() 
      : '';
    
    if (!thumbName) {
      thumbName = 'default-thumb.webp';
    } else {
      thumbName = thumbName.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    const thumbPath = path.join(thumbsFolder, thumbName);
    item["Thumbnail-Image"] = fs.existsSync(thumbPath) ? thumbName : 'default-thumb.webp';

    // 2. Audit Panorama Image (Updated to item["Panorama-Image"])
    let panoName = (item["Panorama-Image"] && item["Panorama-Image"].trim() !== '') 
      ? item["Panorama-Image"].trim() 
      : '';
      
    if (!panoName) {
      panoName = 'default-pano.webp';
    } else {
      panoName = panoName.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    const panoPath = path.join(imagesFolder, panoName);
    item["Panorama-Image"] = fs.existsSync(panoPath) ? panoName : 'default-pano.webp';
  });

  // Save updated JSON back to disk
  fs.writeFileSync(path.resolve(panoramaJsonFile), JSON.stringify(panoramas, null, 2), 'utf-8');

  // -- STEP 3 - Render HTML cards for the 6-column grid
  const cardsHtml = panoramas.map(item => {
    // Parse "60,0,90" -> hfov=60, minHfov=0, maxHfov=90
    const zoomParts = (item.Zoom || "60,0,90").split(',').map(s => s.trim());
    const hfov = zoomParts[0] || '60';
    const minHfov = zoomParts[1] || '0';
    const maxHfov = zoomParts[2] || '90';

    // Construct URL parameters string for Option A
    const queryParams = new URLSearchParams({
      pano: item["Panorama-Image"],
      haov: item.Haov || 360,
      vaov: item.Vaov || 35,
      pitch: item.Pitch || 0,
      hfov: hfov,
      minHfov: minHfov,
      maxHfov: maxHfov,
      title: item.Name || ''
    }).toString();

    const viewerUrl = `panorama-pannellum-display.html?${queryParams}`;

    return utils.renderTemplate(cardTemplate, {
      ...item,
      "Thumbnail-Image": item["Thumbnail-Image"],
      ViewerUrl: viewerUrl
    });
  }).join('\n');

  // -- STEP 4 - Generate dist/panorama-index.html
  const finalIndexHtml = indexLayoutTemplate
    .replace('<!--NAV_MENU-->', navHtml)
    .replace('{{ content }}', cardsHtml);

  fs.writeFileSync(path.resolve('dist/panorama-index.html'), finalIndexHtml, 'utf-8');

  // -- STEP 5 - Generate dist/panorama-pannellum-display.html
  fs.writeFileSync(path.resolve('dist/panorama-pannellum-display.html'), displayTemplate, 'utf-8');

  console.log('Successfully generated panorama-index.html and panorama-pannellum-display.html!');
}