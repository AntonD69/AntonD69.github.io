import fs from 'fs';
import path from 'path';
import * as utils from './utils.js';


export function build_PlacesBeen_page(navHtml) {
    const jsonFilePath = path.resolve('src/data/places-been.json');
    const rawData = fs.readFileSync(jsonFilePath, 'utf-8');
    const allVisitedPlacesJson = JSON.parse(rawData);
    const cardTemplate = fs.readFileSync(path.resolve('src/templates/places-been/place-been-card.html'), 'utf-8');
    const pageTemplate = fs.readFileSync(path.resolve('src/templates/places-been/places-been-page.html'), 'utf-8');
    
    // STEP 1 -- Point image verification to compiled WebP folder in dist
    const imagesDir = path.resolve('dist/webp-images/places-been/been');

    // Check for missing images & normalize WebP links
    const missingImages = [];
    const referencedImages = new Set();

    allVisitedPlacesJson.forEach((place, index) => {
        let imageName = (place.ImageLink || '').trim();

        if (imageName) {
            // Force replace .jpg / .jpeg / .png extensions with .webp
            imageName = imageName.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        } else {
            // Fallback image if missing in JSON
            imageName = 'default-place.webp';
        }

        const imagePath = path.join(imagesDir, imageName);

        // Verify existence in dist/webp-images, fallback to default-place.webp if missing
        if (!fs.existsSync(imagePath)) {
            missingImages.push({
                index,
                name: place.Name,
                date: place.Date,
                fileName: imageName
            });
            imageName = 'default-place.webp';
        }

        referencedImages.add(imageName);
        place.ImageLink = imageName;
    });

    // Save updated JSON file back to disk with .webp links
    fs.writeFileSync(jsonFilePath, JSON.stringify(allVisitedPlacesJson, null, 2), 'utf-8');

    // Report findings in console
    if (missingImages.length > 0) {
        console.warn(`        ⚠️ Found ${missingImages.length} missing image(s):`);
        missingImages.forEach(place => {
            console.warn(`        ⚠️  ${place.name} - ${place.date} - : Missing file "${place.fileName}"`);
        });
    } else {
        console.log('      ✓ All visited place images verified in WebP folder.');
    }

    // -- Orphaned files check:
    const unreferencedFiles = [];

    if (fs.existsSync(imagesDir)) {
        const diskFiles = fs.readdirSync(imagesDir);

        diskFiles.forEach(file => {
            // Ignore hidden files like .DS_Store or subdirectories
            const fullPath = path.join(imagesDir, file);
            if (fs.statSync(fullPath).isFile() && !file.startsWith('.')) {
                if (!referencedImages.has(file)) {
                    unreferencedFiles.push(file);
                }
            }
        });
    }

    if (unreferencedFiles.length > 0) {
        console.warn(`\n📂 Found ${unreferencedFiles.length} file(s) in folder NOT listed in JSON:`);
        unreferencedFiles.forEach(file => {
            console.warn(`  - Unused file: "${file}"`);
        });
    } else {
        console.log('      ✓ No unreferenced files found in images directory.');
    }

    // --- Start Page Build
    const cardsHtml = allVisitedPlacesJson.map(place => {
        // 1. YouTube Button HTML
        const hasYoutube = place.YoutubeLink && place.YoutubeLink.trim() !== '';
        
        const youtubeBtnHtml = hasYoutube
        ? `<a href="${place.YoutubeLink.trim()}" target="_blank" rel="noopener noreferrer" class="btn-action youtube-btn">
            <svg class="yt-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            Video
            </a>`
        : '';

        // 2. GPX Track Button HTML
        const hasGpx = place.GpxTrackLink && place.GpxTrackLink.trim() !== '';
        
        const gpxBtnHtml = hasGpx
        ? `<a href="./gpx/${encodeURIComponent(place.GpxTrackLink.trim())}" download class="btn-action gpx-btn">
            🗺️ GPX Track
            </a>`
        : '';

        // 3. Coords link
        const hasCoords = place.Coords && place.Coords.trim() !== '';
        
        const link_coords_html = hasCoords
        ? `<span><a href="https://www.google.com/maps/search/?api=1&query=${place.Coords}" target="googleMapTab" rel="noopener">${place.Coords.replace(' E','<br/>E').replace(' W','<br/>W')}</a></span>`
        : '';

        // 4. Vehicle Badge Icon
        const vehicleIcon = place.Vehicle === 'bike' ? '🏍️' : '🚗';
        const vehicleBadgeHtml = `<span class="vehicle-badge" title="Visited via ${place.Vehicle}">${vehicleIcon}</span>`;

        return utils.renderTemplate(cardTemplate, {
            ...place,
            ImageLink: place.ImageLink, // Guaranteed to be .webp from normalization loop
			Category: place.PointType || 'all',
            youtube_btn_html: youtubeBtnHtml,
            gpx_btn_html: gpxBtnHtml,
            vehicle_badge_html: vehicleBadgeHtml,
            link_coords_html: link_coords_html 
        });
    }).join('\n');

    // Inject cards and navigation into page layout
    const visitedPlacesFinalHtml = pageTemplate
        .replace('<!--NAV_MENU-->', navHtml)
        .replace('{{ content }}', cardsHtml);

    fs.writeFileSync(path.resolve('dist/places-been.html'), visitedPlacesFinalHtml, 'utf-8');

    console.log('');
    console.log("      Successfully generated 'places-been.html' with injected menu!");
}