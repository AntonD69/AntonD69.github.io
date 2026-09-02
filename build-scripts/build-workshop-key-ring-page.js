import fs from 'fs';
import path from 'path';
import * as utils from './utils.js';

export async function build_workshop_key_ring_page(navHtml) {
    const keyringJsonFile = 'src/data/workshop-keyrings.json';
    const rawData = fs.readFileSync(path.resolve(keyringJsonFile), 'utf-8');
    const keyrings = JSON.parse(rawData);
    const cardTemplate = fs.readFileSync(path.resolve('src/templates/workshop/key-rings/keyring-card.html'), 'utf-8');
    const pageTemplate = fs.readFileSync(path.resolve('src/templates/workshop/key-rings/keyrings-page.html'), 'utf-8');

    // 1. Convert image extensions to webp
    keyrings.forEach((keyring) => {
        keyring.Images = (keyring.Images || []).map(img => img.replace(/\.[^/.]+$/, ".webp"));
    });

    fs.writeFileSync(keyringJsonFile, JSON.stringify(keyrings, null, 2), 'utf-8');

    try {
        // Exclude the last item as in your original script
        const keyringsToRender = keyrings.slice(0, -1);

        // 2. Calculate running total starting from ID 1 upward
        // Sort ascending by ID to accumulate quantities correctly from lowest ID
        const sortedAsc = [...keyringsToRender].sort((a, b) => a.ID - b.ID);
        
        let cumulativeTotal = 0;
        const totalsMap = new Map();

        sortedAsc.forEach((item) => {
            cumulativeTotal += Number(item.Quantity || 0);
            totalsMap.set(item.ID, cumulativeTotal);
        });

        // 3. Render cards with running total and image data
		const cardsHtml = keyringsToRender.map(item => {
			const validImages = (item.Images || []).filter(img => img && img.trim() !== '');
			const firstImage = validImages[0] || '';

			// Convert array to JSON and safely escape single quotes for HTML attribute usage
			const imagesJsonString = JSON.stringify(validImages).replace(/'/g, "&apos;");

			return utils.renderTemplate(cardTemplate, {
				...item,
				ImageName: firstImage,
				ImagesJson: imagesJsonString,
				RunningTotal: totalsMap.get(item.ID) || 0
			});
		}).join('\n');

        const finalHtml = pageTemplate
            .replace(/<!--NAV_MENU-->/g, navHtml)
            .replace(/\{\{\s*total_count\s*\}\}/g, keyrings.length)
            .replace(/\{\{\s*grid\s*\}\}/g, cardsHtml);

        fs.writeFileSync(path.resolve('dist/workshop/keyrings.html'), finalHtml, 'utf-8');

        console.log('      Successfully generated workshop-Keyring page');
    } catch (error) {
        console.error('Error building workshop-Keyring page:', error);
    }
}