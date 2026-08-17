import fs from 'fs';
import path from 'path';

export async function build_Home_page(navHtml) {
  try {
    const pageTemplate = fs.readFileSync(path.resolve('src/templates/home-page/home-page.html'), 'utf-8');

    const finalHtml = pageTemplate.replace(/<!--NAV_MENU-->/g, navHtml);

    fs.writeFileSync(path.resolve('dist/index.html'), finalHtml, 'utf-8');
    
	console.log('      Successfully generated index.html with injected menu!');
  
} catch (error) {
    console.error('Error building Home page:', error);
  }
}