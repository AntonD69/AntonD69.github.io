// import fs from 'fs';
// import path from 'path';
// import fetch from 'node-fetch';
// import csv from 'csv-parser';
// import { Readable } from 'stream';
// import * as utils from './utils.js';

// import { rename, readdir, writeFile } from 'node:fs/promises';
// import { join } from 'node:path';

// export async function copy_geocache_files() {

//     const rawData = fs.readFileSync(path.resolve('src/data/AllGeocaches.json'), 'utf-8');
//     const geocachesFoundJson = JSON.parse(rawData);

//     console.log("   geocachesFoundJson : " + geocachesFoundJson.length);

//     const imagesDir = path.resolve('public/images/rename_geocaches');
//     const allFiles = await readdir(imagesDir, { withFileTypes: true });

//     console.log("   imagesDir : " + imagesDir);
//     console.log("   allFiles : " + allFiles.length);

//     const numberedFiles = allFiles
//         .filter(file => file.isFile() && /^\d/.test(file.name))
//         .map(file => file.name);

//     console.log("   numberedFiles : " + numberedFiles.length);

//     for (const fileName of numberedFiles.slice(0, 200)) {
//         console.log("   fileName: " + fileName);

//         const parts = fileName.split(/[_.]+/);
        
//         if (parts.length <= 1) {
//             console.log("   fileName Error: " + fileName);
//         }
//         else if (parts.length === 2) {
//             //console.log("   2. fileName: " + fileName + " parts: ", parts);

//             // Strip leading zeros safely (handling edge case if number is '0' or '00')
//             const searchIndex = parts[0].replace(/^0+/, '') || '0';
            
//             // Compare as numbers for direct accuracy
//             const geocacheEntry = geocachesFoundJson.find(item => item.F === Number(searchIndex));

// 			if (geocacheEntry == null)
// 			{
//             	console.log("   Error ");
// 			}
// 			else
// 			{
// 				const newFileName = geocacheEntry.GC + "_01." + parts[1]
// 				console.log("   2. file: " + fileName + " --> " + newFileName);

// 				const oldPath = join(imagesDir, fileName);
// 				const newPath = join(imagesDir, newFileName);

// 				// 3. Promise-based rename with await
// 				console.log(oldPath + " --> " + newPath);
// 				await rename(oldPath, newPath);				
// 			}
//         }
//         else if (parts.length === 3) {
//             const searchIndex = parts[0].replace(/^0+/, '') || '0';
            
//             // Compare as numbers for direct accuracy
//             const geocacheEntry = geocachesFoundJson.find(item => item.F === Number(searchIndex));

// 			if (geocacheEntry == null)
// 			{
//             	console.log("   Error ");
// 			}
// 			else
// 			{
// 				const newFileName = geocacheEntry.GC + "_" + parts[1] + "." + parts[2];

// 				const oldPath = join(imagesDir, fileName);
// 				const newPath = join(imagesDir, newFileName);

// 				// 3. Promise-based rename with await
// 				console.log(oldPath + " --> " + newPath);
// 				await rename(oldPath, newPath);				
// 			}
// 		}
//         else 
// 			{
//             console.log("   fileName Error: " + fileName);
//         }
//     }

//     console.log('\n   Successfully processed the files.');    
// }

// copy_geocache_files();