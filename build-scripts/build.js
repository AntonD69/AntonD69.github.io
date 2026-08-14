import { buildParkrunPage } from './build-parkruns.js';
import { build_PlacesBeen_Page } from './build-PlacesBeenPage.js';
import { build_GeocachesFound_Page } from './build-geocachesFound-page.js';
import { build_Home_Page } from './build-home-page.js';

import * as utils from './utils.js';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import csv from 'csv-parser';
import { Readable } from 'stream';

function buildSite() {
	console.log('+-------------------------------+');
	console.log('| Copying folder for Production |');
	console.log('+-------------------------------+');
	const publicImagesDir = path.resolve('public/images');
	const targetImagesDir = path.resolve('images');
	
	utils.copyRecursiveSync(publicImagesDir, targetImagesDir)

	const sourceScriptsDir = path.resolve('src/scripts');
	const targetScriptsDir = path.resolve('scripts');
  
  utils.copyRecursiveSync(sourceScriptsDir, targetScriptsDir)

	console.log('+------------------------------+');
	console.log('| Generating Nav Menu          |');
	console.log('+------------------------------+');

	console.log('  - Building navigation...');
	const siteConfig = JSON.parse(fs.readFileSync(path.resolve('data/site-config.json'), 'utf-8'));
	const navTemplate = fs.readFileSync(path.resolve('src/templates/nav-menu/nav-menu.html'), 'utf-8');

	const navHtml = utils.generateNavMenu(siteConfig.navLinks, 'index.html', navTemplate);

  console.log('+------------------------------+');
  console.log('| Generating static HTML files |');
  console.log('+------------------------------+');


	console.log('  - Building Main page...');
	build_Home_Page(navHtml);


    //-- Create Parkrun Page
    console.log('  - Building Parkrun page ...');
    buildParkrunPage(navHtml);

    //-- Create Places Visited Page
    console.log('  - Building Places-Been page ...');
    build_PlacesBeen_Page(navHtml);

    //-- Create Geocaches Found Page
    console.log('  - Building Geocaches-Found page ...');
    build_GeocachesFound_Page(navHtml);
    
  console.log('+------------------------------------------+');
  console.log('| Successfully generated static HTML files |');
  console.log('+------------------------------------------+');


  //-- Places Visited

  //-- DamhuisClan site

  //-- Panoramas

  //-- Drone Adventures

  //-- Geocaching

  //-- Turkana 4

  //-- Workshop projects
  //--    keyrings
  //--    Cnc Carving
  //--    Other Projects

  //-- Blog posts
  
}

buildSite();