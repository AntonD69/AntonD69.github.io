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

	// --- Helper function to construct large multi-column buttons
    function renderFavButton(link, title, description) {
        if (!title || !link) return '';

        const cleanLink = link.trim();
        const isYoutube = /youtube\.com|youtu\.be/i.test(cleanLink);

        // YouTube SVG icon vs External Link Emoji
        const iconHtml = isYoutube
            ? `<svg class="fav-icon yt-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
            : `<span class="fav-icon link-icon">🔗</span>`;

        return `
        <a href="${cleanLink}" target="_blank" rel="noopener noreferrer" class="btn-fav ${isYoutube ? 'btn-yt' : 'btn-ext'}">
            <div class="fav-icon-col">
                ${iconHtml}
            </div>
            <div class="fav-text-col">
                <span class="fav-title">${title}</span>
                ${description ? `<span class="fav-desc">${description}</span>` : ''}
            </div>
        </a>`;
    }

	function getLightTintHex(hexColor) {
		if (!hexColor || typeof hexColor !== 'string') return '#f4f4f4';
		let cleanHex = hexColor.trim();
		if (!cleanHex.startsWith('#')) cleanHex = `#${cleanHex}`;
		
		// Append '1f' (~12% alpha transparency) to 6-digit hex
		return cleanHex.length === 7 ? `${cleanHex}1f` : cleanHex;
	}


    allItemsJson.forEach((item, index) => {
        let imageName = (item.Image || '').trim();

        if (imageName) {
            imageName = imageName.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        } else {
            // Fallback image if missing in JSON
            imageName = 'unknown.webp';
        }

		if (!item.Colour || typeof item.Colour !== 'string' || !item.Colour.trim()) {
			item.Colour = '#333333'; // Default fallback color
		} else {
			item.Colour = item.Colour.trim();
			// Prepend # if missing in JSON
			if (!item.Colour.startsWith('#')) {
				item.Colour = `#${item.Colour}`;
			}
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

		const validColor = (item.Colour && item.Colour.trim()) ? item.Colour.trim() : '#ff0000';
		item.Colour = validColor.startsWith('#') ? validColor : `#${validColor}`;
		item.CardBgTint = getLightTintHex(item.Colour);
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

        // Generate HTML for Favourite buttons dynamically
        const fav1Html = renderFavButton(item['Fovourite1-link'], item['Favourite1-Title'], item['Favourite1-Description']);
        const fav2Html = renderFavButton(item['Fovourite2-link'], item['Favourite2-Title'], item['Favourite2-Description']);
        const fav3Html = renderFavButton(item['Fovourite3-link'], item['Favourite3-Title'], item['Favourite3-Description']);

        // Render template passing both the extracted string properties and generated button HTML
		return utils.renderTemplate(cardTemplate, {
			...item,
			PhotoUrl: item.ImageLink,
			CardBgTint: item.CardBgTint, // <-- Explicitly pass the 12% opacity hex string
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