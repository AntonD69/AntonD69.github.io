import fs from 'fs';
import path from 'path';
import * as utils from './utils.js';

function parseDetail(detailStr) {
  if (!detailStr || detailStr.length < 6) {
    return { country: 'UNKNOWN', province: 'UNKNOWN' };
  }
  const country = detailStr.substring(2, 4).toUpperCase();
  const province = detailStr.substring(4, 6).toUpperCase();
  return { country, province };
}

export async function build_GeocachesFound_page(navHtml) {
    const geocacheJsonFile = 'src/data/geocachesFound.json';
    const rawData = fs.readFileSync(path.resolve(geocacheJsonFile), 'utf-8');
    const geocaches = JSON.parse(rawData);
    const cardTemplate = fs.readFileSync(path.resolve('src/templates/geocaching/geocache-found-card.html'), 'utf-8');
    const pageTemplate = fs.readFileSync(path.resolve('src/templates/geocaching/geocaches-found-page.html'), 'utf-8');
    const imagesFolder = path.resolve('dist/webp-images/geocaches/photos');

	// Image auditing & array normalization
	geocaches.forEach((geocache) => {
		let imageName = '';

		// 1. Extract raw filename regardless of array or string format
		if (Array.isArray(geocache.ImageLink) && geocache.ImageLink.length > 0) {
			imageName = geocache.ImageLink[0];
		} else if (typeof geocache.ImageLink === 'string' && geocache.ImageLink !== '') {
			imageName = geocache.ImageLink;
		}

		// 2. If missing, fall back to GcCode naming pattern
		if (!imageName) {
			imageName = `${geocache.GcCode}_01.webp`;
		} else {
			// Force replace .jpg / .jpeg extensions with .webp
			imageName = imageName.replace(/\.(jpg|jpeg|png)$/i, '.webp');
		}

		// 3. Verify existence in dist folder, defaulting to 'default.webp' if missing
		const imagePath = path.join(imagesFolder, imageName);
		const finalImage = fs.existsSync(imagePath) ? imageName : 'default.webp';

		// 4. Standardize ImageLink property as an array containing the .webp name
		geocache.ImageLink = [finalImage];

		//console.log(`Processing single geocache - imageName = '${finalImage}'`);
	});

    fs.writeFileSync(geocacheJsonFile, JSON.stringify(geocaches, null, 2), 'utf-8');

    try {
        const cardsHtml = geocaches.map(item => {
            const imageLink = item.ImageLink && item.ImageLink[0] ? item.ImageLink[0] : 'default.jpg';
            const foundByText = item.FoundBy ? `Found by: ${item.FoundBy}` : '';
            
            const year = item.Date ? item.Date.substring(0, 4) : 'UNKNOWN';
            const { country, province } = parseDetail(item.Detail);

            return utils.renderTemplate(cardTemplate, {
                ...item,
                Find: item.Find || '',
                GcCode: item.GcCode || '',
                Name: item.Name || 'Unnamed Cache',
                Detail: item.Detail || '',
                Date: item.Date || '',
                Coords: item.Coords || '',
                FoundBy: foundByText,
                ImageLink: imageLink,
                // Injected metadata attributes for filtering
                Year: year,
                Country: country,
                Province: province
            });
        }).join('\n');

		const finalHtml = pageTemplate
			.replace(/<!--NAV_MENU-->/g, navHtml)
			.replace(/\{\{\s*total_count\s*\}\}/g, geocaches.length)
			.replace(/\{\{\s*content\s*\}\}/g, cardsHtml);

        fs.writeFileSync(path.resolve('dist/geocaching-geocaches-found.html'), finalHtml, 'utf-8');
        console.log('      Successfully generated geocaching-geocaches-found.html');
    } catch (error) {
        console.error('Error building Geocaches Found page:', error);
    }
}