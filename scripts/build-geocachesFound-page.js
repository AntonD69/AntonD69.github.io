import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import csv from 'csv-parser';
import { Readable } from 'stream';
import * as utils from './utils.js';

import { rename, readdir, writeFile } from 'node:fs/promises';
//import { join } from 'node:path';

export async function build_GeocachesFound_Page(navHtml) {
    //-- STEP 2 -  Create Geocaches-Found page
    const geocacheJsonFile = 'data/geocachesFound.json'
    const rawData = fs.readFileSync(path.resolve(geocacheJsonFile), 'utf-8');
    const geocachesFoundJson = JSON.parse(rawData);
    const cardTemplate = fs.readFileSync(path.resolve('src/templates/geocaching/geocacheFound-card.html'), 'utf-8');
    const pageTemplate = fs.readFileSync(path.resolve('src/templates/geocaching/geocachesFound-page.html'), 'utf-8');
    
    const referencedImages = new Set();

    //STEP 1 -- Ensure all images exist
    const imagesDir = path.resolve('public/images/geocaches/photos');

    console.log('      🔎 image folder: ' + imagesDir);

    // Check for missing images
    const missingImages = [];


/************************************************************************************************************** */
/* Rename files from numbers to GCCode
/************************************************************************************************************** */

    // // // // // // const allFiles = await readdir(imagesDir, { withFileTypes: true });

    // // // // // // const numberedFiles = allFiles
    // // // // // //     .filter(file => file.isFile() && /^\d/.test(file.name))
    // // // // // //     .map(file => file.name);

    // // // // // // for (const fileName of numberedFiles) {
    // // // // // //     const index2 = fileName.indexOf("_");
        
    // // // // // //     if (index2 > 0) {
    // // // // // //         const parts = fileName.split("_");
            
    // // // // // //         // 1. Properly strip leading zeros (0110 -> 110)
    // // // // // //         const filepart = parts[0].replace(/^0+/, "");

    // // // // // //         console.log("part '" + filepart + "' of '" + fileName + "'");

    // // // // // //         // Ensure type equality (cast find number if JSON stores it as an integer)
    // // // // // //         const match = geocachesFoundJson.find(item => String(item.Find) === filepart);

    // // // // // //         if (match) {
    // // // // // //             const newFileName = match.GcCode + "_" + parts.slice(1).join("_");
    // // // // // //             console.log(" Match : '" + newFileName + "'");

    // // // // // //             // 2. Include full file paths with imagesDir
    // // // // // //             const oldPath = join(imagesDir, fileName);
    // // // // // //             const newPath = join(imagesDir, newFileName);

    // // // // // //             // 3. Promise-based rename with await
    // // // // // //             console.log(oldPath + " --> " + newPath);
    // // // // // //             await rename(oldPath, newPath);
    // // // // // //         } else {
    // // // // // //             // 4. Safely log the missing match without calling match.GcCode
    // // // // // //             console.log("error : No match found in JSON for find #" + filepart);
    // // // // // //         }
    // // // // // //     }
    // // // // // //     }

    // // // // // // geocachesFoundJson.forEach((geocache, index) => {
    // // // // // //     const fromImageName = ("0000" + geocache.Find).slice(-4) + ".jpg"
    // // // // // //     const toImageName =  geocache.GcCode + "_01.jpg"

    // // // // // //     const fromImagePath = path.join(imagesDir, fromImageName);
    // // // // // //     const toImagePath = path.join(imagesDir, toImageName );

    // // // // // //     if (fs.existsSync(fromImagePath)) {
    // // // // // //       console.log ("Rename '" + fromImagePath + "' to '" + toImagePath + "'");
    // // // // // //         try {
    // // // // // //             //rename(fromImagePath,  toImagePath);
    // // // // // //             console.log('File renamed successfully');
    // // // // // //         } catch (error) {
    // // // // // //             console.error('Error renaming file:', error);
    // // // // // //         }
    // // // // // //     }
    // // // // // //     else {
    // // // // // //       //console.log ("File '" + fromImagePath + "' does not exist");
    // // // // // //     }
    // // // // // // });

    // // // // // // console.log('      Successfully generated renamed files!.');

/************************************************************************************************************** */
/************************************************************************************************************** */
/************************************************************************************************************** */
/************************************************************************************************************** */
/************************************************************************************************************** */

    geocachesFoundJson.forEach((geocache, index) => {
        
        if (geocache.ImageLink === ""){

            console.log (geocache.GcCode + "was empty");

            const imageName = (geocache.GcCode) + "_01.jpg"

            const imagePath = path.join(imagesDir, imageName);
            
            referencedImages.add(imageName);

            if (!fs.existsSync(imagePath)) {
                geocache.ImageLink = "default.png"

                missingImages.push({
                    index,
                    name: geocache.Name,
                    code: geocache.GcCode,
                    fileName: imageName
                })
            } else {
                geocache.ImageLink = imageName
            }
        }
    });

    fs.writeFileSync(geocacheJsonFile, JSON.stringify(geocachesFoundJson, null, 2), 'utf-8');

/*********************************************************** */
    // const logEntries = [];
    
    // const outputPath = './output.txt';

    // for (const geocache of geocachesFoundJson) {
    //     logEntries.push(geocache.Find + "\t" + geocache.ImageLink);
    // }
    
    // await writeFile(outputPath, logEntries.join('\n'), 'utf8');
/*********************************************************** */


    // console.log('      ✓ Saved ImageLink to original json file.');
  
    // // Report findings in console
    // if (missingImages.length > 0) {
    //     console.warn(`        ⚠️ Found ${missingImages.length} missing image(s):`);
    //     missingImages.forEach(report => {
    //         console.warn(`        ⚠️  ${report.index}, ${report.name} - ${report.code} - : Missing file "${report.fileName}"`);
    //     });
    // } else {
    //     console.log('      ✓ All visited geocache photos verified.');
    // }

 
    //  //-- Orphaned files:
    // const unreferencedFiles = [];

    // console.log ("referencedImages: " + referencedImages.size);

    // const firstItem = referencedImages.values().next().value;

    // console.log ("referencedImages[0]: " + firstItem)

    // if (fs.existsSync(imagesDir)) {
    //     const diskFiles = fs.readdirSync(imagesDir);

    //     diskFiles.forEach(file => {
    //         // Ignore hidden files like .DS_Store or subdirectories
    //         const fullPath = path.join(imagesDir, file);
            
    //         if (fs.statSync(fullPath).isFile() && !file.startsWith('.')) {
    //             if (!referencedImages.has(file)) {
    //                 console.log ("disk file: " + file)
    //                 unreferencedFiles.push(file);
    //             }
    //         }
    //     });
    // }

    // if (unreferencedFiles.length > 0) {
    //     unreferencedFiles.forEach(file => {
    //         //console.warn(`  - Unused file: "${file}"`);
    //     });
    //     console.warn(`\n📂 Found ${unreferencedFiles.length} file(s) in folder NOT listed in JSON:`);

    // } else {
    //     console.log('      ✓ No unreferenced files found in images directory.');
    // }

/************************************************************************************************************** */
/************************************************************************************************************** */
/************************************************************************************************************** */
/************************************************************************************************************** */
/************************************************************************************************************** */

//--- Start Page Build
    try {
        // 1. Read source data and templates
        const rawData = fs.readFileSync(path.resolve('data/geocachesFound.json'), 'utf-8');
        const geocaches = JSON.parse(rawData);
        const cardTemplate = fs.readFileSync(path.resolve('src/templates/geocaching/geocacheFound-card.html'), 'utf-8');
        const pageTemplate = fs.readFileSync(path.resolve('src/templates/geocaching/geocachesFound-page.html'), 'utf-8');

        // 2. Render each item into card HTML
        const cardsHtml = geocaches.map(item => {
            const imageLink = (item.ImageLink && item.ImageLink[0] !== '') 
            ? item.ImageLink[0] 
            : 'default.jpg';

            const foundByText = item.FoundBy ? `Found by: ${item.FoundBy}` : '';

            return utils.renderTemplate(cardTemplate, {
            ...item,
            Find: item.Find || '',
            GcCode: item.GcCode || '',
            Name: item.Name || 'Unnamed Cache',
            Detail: item.Detail || '',
            Date: item.Date || '',
            Coords: item.Coords || '',
            FoundBy: foundByText,
            ImageLink: imageLink
            });
        }).join('\n');

        // 3. Inject navigation menu, total count, and card grid
        const finalHtml = pageTemplate
            .replace('<!--NAV_MENU-->', navHtml)
            .replace('{{ total_count }}', geocaches.length)
            .replace('{{ content }}', cardsHtml);

        // 4. Output geocaches-found.html at project root
        fs.writeFileSync(path.resolve('geocaches-found.html'), finalHtml, 'utf-8');

        console.log('       Successfully generated geocaches-found.html with injected menu!');
    } catch (error) {
        console.error('Error building Geocaches Found page:', error);
    }

    console.log('      Successfully generated geocaches-found.html with injected menu!.');
}