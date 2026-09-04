import fs from 'fs';
import path from 'path';

export async function build_static_page_with_menu(navHtml, templateFile, outputFileName) {
	try{
		const pageTemplate = fs.readFileSync(path.resolve(templateFile), 'utf-8');

		const finalHtml = pageTemplate
			.replace(/<!--NAV_MENU-->/g, navHtml);
				
		fs.writeFileSync(path.resolve('dist/' + outputFileName ), finalHtml, 'utf-8');

		console.log('      Successfully generated "' + outputFileName + '" page');
    } catch (error) {
        console.error('Error building page: ', error);
    }
}