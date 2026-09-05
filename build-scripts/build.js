import { build_Parkrun_page } from './build-parkruns.js';
import { build_PlacesBeen_page } from './build-PlacesBeen-page.js';
import { build_GeocachesFound_page } from './build-geocachesFound-page.js';
import { build_Home_page } from './build-home-page.js';
import { build_workshop_key_ring_page } from './build-workshop-keyring-page.js';
import { build_OtherAdventures_page } from './build-other-adventures-page.js';
import { build_static_page_with_menu } from './build-static-page-with-menu.js'

import * as utils from './utils.js';
import fs from 'fs';
import path from 'path';

async function buildSite() {
	console.log('+-------------------------------+');
	console.log('| Copying folder for Production |');
	console.log('+-------------------------------+');

	await utils.convertAndResizeImagesAssets().catch(console.error);

	console.log ("next updateAndVerifyJsonImageFilesForWebp");
	
	await utils.updateAndVerifyJsonImageFilesForWebp().catch(console.error);

	const sourceScriptsDir = path.resolve('src/scripts');
	const targetScriptsDir = path.resolve('dist/scripts');
  
	utils.copyRecursiveSync(sourceScriptsDir, targetScriptsDir)

	const sourceCssFolder = path.resolve('src/styles');
	const targetCssFolder = path.resolve('dist/css');
  
	utils.copyRecursiveSync(sourceCssFolder, targetCssFolder)

	const sourceGpxFolder = path.resolve('public/gpx-tracks');
	const targetGpxFolder = path.resolve('dist/gpx-tracks');
  
	utils.copyRecursiveSync(sourceGpxFolder, targetGpxFolder)

	console.log('+---------------------+');
	console.log('| Generating Nav Menu |');
	console.log('+---------------------+');

	console.log('  - Building navigation...');
	//const siteConfig = JSON.parse(fs.readFileSync(path.resolve('src/data/site-config.json'), 'utf-8'));
	const navTemplate = fs.readFileSync(path.resolve('src/templates/nav-menu/nav-menu.html'), 'utf-8');


	console.log('+------------------------------+');
	console.log('| Generating static HTML files |');
	console.log('+------------------------------+');

	console.log('  ⚡ Building Main page...');
	build_Home_page(navTemplate);

    //-- Create Parkrun Page
    console.log('  ⚡ Building Parkrun page ...');
    build_Parkrun_page(navTemplate);

    //-- Create Places Visited Page
    console.log('  ⚡ Building Places-Been page ...');
    build_PlacesBeen_page(navTemplate);

    //-- Create Geocaches Found Page
    console.log('  ⚡ Building Geocaches-Found page ...');
    build_GeocachesFound_page(navTemplate);

    console.log('  ⚡ Building Workshop-keyring-page ...');
    build_workshop_key_ring_page(navTemplate);

    console.log('  ⚡ Building interests-other-adventures-page ...');
    build_OtherAdventures_page(navTemplate);

	console.log('+-----------------------------------+');
	console.log('| Copy static HTML files & add menu |');
	console.log('+-----------------------------------+');

	build_static_page_with_menu(navTemplate, 'src/templates/geocaching/geocoins-page.html', 'geocaching-geocoins-1.html');

	build_static_page_with_menu(navTemplate, 'src/templates/workshop/cnc-projects-page.html', 'workshop-cnc-projects-1.html');

	build_static_page_with_menu(navTemplate, 'src/templates/workshop/electronics-page.html', 'workshop-electronics-1.html');

	build_static_page_with_menu(navTemplate, 'src/templates/workshop/wood-working-page.html', 'workshop-wood-working-1.html');

	
  console.log('+------------------------------------------+');
  console.log('| Successfully generated static HTML files |');
  console.log('+------------------------------------------+');


  //-- DamhuisClan site

  //-- Panoramas

  //-- Drone Adventures

  //-- Turkana 4

  //-- Workshop projects
  //--    Cnc Carving
  //--    Other Projects

  //-- Blog posts  
}

buildSite();