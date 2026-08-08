import { buildParkrunPage } from './build-parkruns.js';

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import csv from 'csv-parser';
import { Readable } from 'stream';

function copyRecursiveSync(src, dest) {
  if (fs.existsSync(src)) {
    // Copy directory recursively (requires Node.js 16.7+)
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`Successfully copied ${src} -> ${dest}`);
  } else {
    console.warn(`Source path non-existent, skipped copying: ${src}`);
  }
}

// Helper function to replace {{ key }} placeholders
function renderTemplate(template, data) {
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

function generateNavMenu(links, activePage) {
  const itemsHtml = links.map(link => {
    // Determine active state for highlighting
    const isActive = link.url.includes(activePage) ? 'class="active"' : '';
    return `        <li><a href="${link.url}" ${isActive}>${link.label}</a></li>`;
  }).join('\n');

  return `
    <nav class="site-nav">
      <ul>
${itemsHtml}
      </ul>
    </nav>
  `;
}

function buildSite() {
  console.log('Generating static HTML files...');

  //--  Copy public images to root/images so relative paths like ./images/... work everywhere
  const publicImagesDir = path.resolve('public/images');
  const targetImagesDir = path.resolve('images');

  copyRecursiveSync(publicImagesDir, targetImagesDir)

  //-- Create Navigation
  console.log('  Building site with navigation...');

    // 1. Read configurations and templates
    const siteConfig = JSON.parse(fs.readFileSync(path.resolve('data/site-config.json'), 'utf-8'));
    const layoutTemplate = fs.readFileSync(path.resolve('src/templates/index-page.html'), 'utf-8');
    
    // 2. Build navigation HTML string
    const navHtml = generateNavMenu(siteConfig.navLinks, 'index.html');

    // 3. Inject Navigation into layout
    let finalHtml = layoutTemplate.replace('<!--NAV_MENU-->', navHtml);

    // 4. Inject main page content (example content replacement)
    finalHtml = finalHtml.replace('{{ content }}', '<h1>Welcome to DamhuisClan</h1>');

    // 5. Output compiled HTML
    fs.writeFileSync(path.resolve('index.html'), finalHtml, 'utf-8');

    console.log('  Successfully generated index.html with injected menu!');  
 
    //-- Create Main Page
    buildParkrunPage(navHtml);

   console.log('Successfully generated parkruns.html.');


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