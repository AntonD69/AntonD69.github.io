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