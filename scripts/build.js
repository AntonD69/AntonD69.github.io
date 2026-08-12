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
  //--  STEP 1 -- Copy public images to root/images so relative paths like ./images/... work everywhere
  const publicImagesDir = path.resolve('public/images');
  const targetImagesDir = path.resolve('images');
  
  utils.copyRecursiveSync(publicImagesDir, targetImagesDir)

  console.log('+------------------------------+');
  console.log('| Generating static HTML files |');
  console.log('+------------------------------+');



  //-- Create Navigation
  console.log('  - Building navigation ...');

    // 1. Read configurations and templates
    const siteConfig = JSON.parse(fs.readFileSync(path.resolve('data/site-config.json'), 'utf-8'));
    
    // 2. Build navigation HTML string
    const navHtml = utils.generateNavMenu(siteConfig.navLinks, 'index.html');

    //-- Create Main Page
    console.log('  - Building Main page ...');
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
