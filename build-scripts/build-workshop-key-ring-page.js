import fs from 'fs';
import path from 'path';
import * as utils from './utils.js';

export async function build_workshop_key_ring_page(navHtml) {
    const keyringJsonFile = 'src/data/workshop-keyrings.json';
    const rawData = fs.readFileSync(path.resolve(keyringJsonFile), 'utf-8');
    const keyrings = JSON.parse(rawData);
    const cardTemplate = fs.readFileSync(path.resolve('src/templates/workshop/key-rings/keyring-card.html'), 'utf-8');
    const pageTemplate = fs.readFileSync(path.resolve('src/templates/workshop/key-rings/keyrings-page.html'), 'utf-8');
    const imagesFolder = path.resolve('dist/webp-images/workshop/keyrings');

	keyrings.forEach((keyring) => {
		keyring.Images = (keyring.Images || []).map(img => img.replace(/\.[^/.]+$/, ".webp")) 
	});

    fs.writeFileSync(keyringJsonFile, JSON.stringify(keyrings, null, 2), 'utf-8');

    try {
		// Exclude the last item using .slice(0, -1)
        const keyringsToRender = keyrings.slice(0, -1);

        const cardsHtml = keyringsToRender.map(item => {
            const imageLink = item.Images[0];
            
            return utils.renderTemplate(cardTemplate, {
                ...item,
                ImageName: imageLink
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