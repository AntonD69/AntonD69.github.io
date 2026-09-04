import fs from 'fs';
import path from 'path';
import * as utils from './utils.js';

export function build_OtherAdventures_page(navHtml) {
    const imagesDir = path.resolve('dist/webp-images/interests/other-adventures');
    const jsonFilePath = path.resolve('src/data/other-adventures.json');
    const cardTemplate = fs.readFileSync(path.resolve('src/templates/interests/other-adventure-card.html'), 'utf-8');
    const pageTemplate = fs.readFileSync(path.resolve('src/templates/interests/other-adventures-page.html'), 'utf-8');

    const rawData = fs.readFileSync(jsonFilePath, 'utf-8');
    const allItemsJson = JSON.parse(rawData);
    
    // -- STEP 1 - Check for missing images & normalize WebP links
    const missingImages = [];
    const referencedImages = new Set();

    allItemsJson.forEach((item, index) => {
        let imageName = (item.Image || '').trim();

        if (imageName) {
            imageName = imageName.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        } else {
            // Fallback image if missing in JSON
            imageName = 'unknown.webp';
        }

        const imagePath = path.join(imagesDir, imageName);

        // Verify existence in dist/webp-images, fallback to default.webp if missing
        if (!fs.existsSync(imagePath)) {
            missingImages.push({
                index,
                name: item.Name,
                imageName: imageName
            });
            imageName = 'default.webp';
        }

        referencedImages.add(imageName);
        item.ImageLink = imageName;

        // --- Extract Favourite Titles and Descriptions from FovouriteX-T&D ---
        for (let i = 1; i <= 3; i++) {
            const tdValue = item[`Fovourite${i}-T&D`];

            if (tdValue && typeof tdValue === 'string' && tdValue.includes('|')) {
                const parts = tdValue.split('|');
                item[`Favourite${i}-Title`] = parts[0].trim();
                item[`Favourite${i}-Description`] = parts.slice(1).join('|').trim();
            } else if (tdValue && typeof tdValue === 'string') {
                item[`Favourite${i}-Title`] = tdValue.trim();
                item[`Favourite${i}-Description`] = '';
            } else {
                item[`Favourite${i}-Title`] = null;
                item[`Favourite${i}-Description`] = null;
            }
        }
    });

    // STEP 2 -- Save updated JSON file back to disk with parsed keys & .webp links
    fs.writeFileSync(jsonFilePath, JSON.stringify(allItemsJson, null, 2), 'utf-8');

    // STEP 3 -- Report findings in console
    if (missingImages.length > 0) {
        console.warn(`        ⚠️ Found ${missingImages.length} missing image(s):`);
        missingImages.forEach(item => {
            console.warn(`        ⚠️  ${item.name} - Missing file "${item.imageName}"`);
        });
    } else {
        console.log('      ✓ All visited images verified in WebP folder.');
    }

    // --- Start Page Build
    const cardsHtml = allItemsJson.map(item => {

        // Generate HTML for Favourite buttons dynamically (hides button if link/title is missing)
        let fav1Html = '';
        if (item['Favourite1-Title'] && item['Fovourite1-link']) {
            fav1Html = `
            <a href="${item['Fovourite1-link'].trim()}" target="_blank" rel="noopener noreferrer" class="btn-fav">
                <span class="btn-fav-label">▶️ ${item['Favourite1-Title']}</span>
                ${item['Favourite1-Description'] ? `<span class="btn-fav-desc">${item['Favourite1-Description']}</span>` : ''}
            </a>`;
        }

        let fav2Html = '';
        if (item['Favourite2-Title'] && item['Fovourite2-link']) {
            fav2Html = `
            <a href="${item['Fovourite2-link'].trim()}" target="_blank" rel="noopener noreferrer" class="btn-fav">
                <span class="btn-fav-label">▶️ ${item['Favourite2-Title']}</span>
                ${item['Favourite2-Description'] ? `<span class="btn-fav-desc">${item['Favourite2-Description']}</span>` : ''}
            </a>`;
        }

        let fav3Html = '';
        if (item['Favourite3-Title'] && item['Fovourite3-link']) {
            fav3Html = `
            <a href="${item['Fovourite3-link'].trim()}" target="_blank" rel="noopener noreferrer" class="btn-fav">
                <span class="btn-fav-label">▶️ ${item['Favourite3-Title']}</span>
                ${item['Favourite3-Description'] ? `<span class="btn-fav-desc">${item['Favourite3-Description']}</span>` : ''}
            </a>`;
        }

        // Render template passing both the extracted string properties and generated button HTML
        return utils.renderTemplate(cardTemplate, {
            ...item,
            PhotoUrl: item.ImageLink,
            fav1_html: fav1Html,
            fav2_html: fav2Html,
            fav3_html: fav3Html
        });
    }).join('\n');

    // Inject cards and navigation into page layout
    const otherAdventuresFinalHtml = pageTemplate
        .replace('<!--NAV_MENU-->', navHtml)
        .replace('{{ content }}', cardsHtml);

    fs.writeFileSync(path.resolve('dist/interests-other-adventures.html'), otherAdventuresFinalHtml, 'utf-8');

    console.log('');
    console.log("      Successfully generated 'interests-other-adventures.html' with injected menu!");
}