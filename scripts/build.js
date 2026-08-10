import { buildParkrunPage } from './build-parkruns.js';
import { build_PlacesBeen_Page } from './build-PlacesBeenPage.js';
import { build_GeocachesFound_Page } from './build-geocachesFound-page.js';
import * as utils from './utils.js';


import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import csv from 'csv-parser';
import { Readable } from 'stream';

function buildMainPage(navHtml){
    const layoutTemplate = fs.readFileSync(path.resolve('src/templates/index-page.html'), 'utf-8');

    // 3. Inject Navigation into layout
    let finalHtml = layoutTemplate.replace('<!--NAV_MENU-->', navHtml);

    // 4. Inject main page content (example content replacement)
    finalHtml = finalHtml.replace('{{ content }}', '<h1>Welcome to DamhuisClan</h1>');

    // 5. Output compiled HTML
    fs.writeFileSync(path.resolve('index.html'), finalHtml, 'utf-8');

    console.log('      Successfully generated index.html with injected menu!');  
}

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
    buildMainPage(navHtml);

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
