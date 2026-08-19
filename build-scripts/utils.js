import fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';
import { glob } from 'glob';
import sharp from 'sharp';


export async function convertAndResizeImagesAssets() {
	const srcDir = 'public/images';
	const distDir = 'dist/webp-images';

	const files = await glob(`${srcDir}/**/*.{png,jpg,jpeg}`, { nodir: true });

	let convertedCount = 0;
	let skippedCount = 0;

	console.log(`  Checking ${files.length} images in ${srcDir}...`);

	for (const file of files) {
		const relativePath = path.relative(srcDir, file);
		const parsed = path.parse(relativePath);
		const targetFolder = path.join(distDir, parsed.dir);
		const targetPath = path.join(targetFolder, `${parsed.name}.webp`);

		// Ensure output subfolder exists
		fs.mkdirSync(targetFolder, { recursive: true });

		// --- INCREMENTAL CACHE CHECK ---
		const srcStats = fs.statSync(file);
		if (fs.existsSync(targetPath)) {
			const targetStats = fs.statSync(targetPath);
			// Skip if output WebP is newer than source file
			if (targetStats.mtimeMs > srcStats.mtimeMs) {
			skippedCount++;
			continue;
			}
		}

		// --- METADATA & DYNAMIC ORIENTATION RESIZING ---
		try{
			const image = sharp(file);
			const metadata = await image.metadata();

			const isPortrait = (metadata.height || 0) > (metadata.width || 0);

			const resizeOptions = isPortrait
			? { height: 480, withoutEnlargement: true }
			: { width: 480, withoutEnlargement: true };

			// Transform and write to dist
			await image
			.resize(resizeOptions)
			.webp({ quality: 80 })
			.toFile(targetPath);

			convertedCount++;
			//console.log(`[Converted] ${relativePath} -> ${parsed.name}.webp`);
		} catch (err) {
			console.error(`\n❌ ERROR processing file: ${file}`);
			console.error(`Reason: ${err.message}\n`);
			// Skip this broken file and continue processing the rest of the images
		}
	}

	console.log(`\n✨ Conversion complete: ${convertedCount} processed, ${skippedCount} skipped (cached).`);
}

export async function updateAndVerifyJsonImageFilesForWebp() {
	const jsonFiles = await glob('src/data/**/*.json'); // Adjust to your JSON folder
	const distWebpDir = 'dist/webp-images';
	const missingImages = [];

	// 1. Get a map/list of all generated .webp files in dist/webp-images and all subfolders
	const allWebpFiles = await glob(`${distWebpDir}/**/*.webp`, { nodir: true });

	// Normalize paths to relative filenames for fast lookup
	const webpSet = new Set(allWebpFiles.map(file => path.basename(file)));

	for (const jsonFile of jsonFiles) {
	const rawData = fs.readFileSync(jsonFile, 'utf8');

	// Matches any image filename ending in .png, .jpg, or .jpeg
	const updatedData = rawData.replace(/(?:[\w\/-]+\/)?([^\/"]+)\.(png|jpg|jpeg)/gi, (match, filename) => {
		const webpFileName = `${filename}.webp`;

		// Check if the file exists anywhere inside dist/webp-images (including subfolders)
		if (!webpSet.has(webpFileName)) {
		missingImages.push({
			sourceJson: jsonFile,
			expectedAsset: webpFileName
		});
		}

		// Return only the clean filename with .webp extension
		return webpFileName;
	});

	fs.writeFileSync(jsonFile, updatedData, 'utf8');
	}

	if (missingImages.length > 0) {
		console.warn('\n⚠️ MISSING WEBP ASSETS REPORT:');
		console.table(missingImages);
	} else {
		console.log('\n✅ All JSON image links updated to .webp and verified across all subfolders!');
	}
}

export function copyRecursiveSync(src, dest) {
	if (fs.existsSync(src)) {
		// Copy directory recursively (requires Node.js 16.7+)
		fs.rmSync(dest, { recursive: true, force: true });
		console.log(`  Clear out old files in ${dest}`);

		fs.cpSync(src, dest, { recursive: true, force: true });
		console.log(`  Successfully copied ${src} -> ${dest}`);
	} else {
		console.warn(`  Source path non-existent, skipped copying: ${src}`);
	}
}

// Helper function to replace {{ key }} placeholders
export function renderTemplate(template, data) {
	let result = template;

	// Handle conditional logic like {{ #if pb }}class-name{{ /if }}
	result = result.replace(/\{\{\s*#if\s+(\w+)\s*\}\}(.*?)\{\{\s*\/if\s*\}\}/g, (_, key, content) => {
		return data[key] ? content : '';
	});

	// Handle variable replacements like {{ name }}
	Object.keys(data).forEach(key => {
		const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
		result = result.replace(regex, data[key]);
	});

	return result;
}

// scripts/utils.js
export function generateNavMenu(navLinks, currentPage, templateHtml) {
	const menuItemsHtml = navLinks.map(link => {
		const isActive = link.url.includes(currentPage) ? 'active' : '';

		if (link.children && link.children.length > 0) {
			const dropdownItems = link.children.map(child => `
				<li>
				<a href="${child.subdomain || ''}${child.url}" class="dropdown-item">
					${child.label}
				</a>
				</li>
			`).join('');

			return `
				<li class="nav-item has-dropdown">
				<a href="${link.subdomain || ''}${link.url}" class="nav-link ${isActive}">
					${link.label} <span class="arrow">&darr;</span>
				</a>
				<ul class="dropdown-menu">
					${dropdownItems}
				</ul>
				</li>
			`;
		}

		return `
			<li class="nav-item">
				<a href="${link.subdomain || ''}${link.url}" class="nav-link ${isActive}">
					${link.label}
				</a>
			</li>
		`;
  	}).join('');

	return templateHtml.replace('<!--NAV_ITEMS-->', menuItemsHtml);
}


/*==================================================
    FETCH GOOGLE SHEET CODE
==================================================*/

export function parseTypedValue(key, rawValue) {
  /**
   * Automatically converts raw string values into JS types.
   * - "true"/"false" -> boolean
   * - "123" / "45.6" -> number
   * - "tag1, tag2" -> array (if column name ends in `[]` or `_list`)
   * - "" -> null
   */

  if (rawValue === null || rawValue === undefined) return null;
  const trimmed = String(rawValue).trim();

  // Empty cells
  if (trimmed === '') return null;

  // Booleans
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;

  // Numbers (ensures non-empty and valid numeric string)
  if (!isNaN(trimmed) && trimmed !== '') {
    return Number(trimmed);
  }

  // Lists/Arrays (Handles comma-separated values if column header indicates a list)
  if (key.endsWith('[]') || key.endsWith('_list')) {
    return trimmed.split(',').map(item => item.trim());
  }

  // Fallback to plain String
  return trimmed;
}

export async function fetchAndTransformSheet(dataname, goole_sheet_csv_url, output_path) {
  console.log('Fetching ' + dataname + ' data from Google sheet ...');

  console.log ("dataname: " + dataname);
  console.log ("goole_sheet_csv_url: " + goole_sheet_csv_url);
  console.log ("output_path: " + output_path);
 
  try {
    const response = await fetch(goole_sheet_csv_url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const csvText = await response.text();

    // Parse raw CSV text into array of key-value records
    const rawRecords = parse(csvText, {
      columns: true,            // Uses the first row as object keys
      skip_empty_lines: true,   // Skips blank lines in the sheet
      trim: true                // Trims whitespace around headers/cells
    });

    // Transform string values into typed JSON fields
    const typedRecords = rawRecords.map(row => {
      const typedRow = {};

      for (const [key, value] of Object.entries(row)) {
        // Clean key name if it ended with array markers like "tags[]" -> "tags"
        const cleanKey = key.replace(/\[\]$/, '');
        typedRow[cleanKey] = parseTypedValue(key, value);
      }

      return typedRow;
    });

    // Ensure output folder exists
    const dir = path.dirname(output_path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write formatted JSON to file
    fs.writeFileSync(output_path, JSON.stringify(typedRecords, null, 2), 'utf-8');
    console.log(`Successfully written ${typedRecords.length} records to: ${output_path}`);

  } catch (error) {
    console.error('Failed to get data from Google Sheets:', error.message);
    process.exit(1);
  }
}