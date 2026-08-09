import fs from 'fs';
// import path from 'path';
// import fetch from 'node-fetch';
// import csv from 'csv-parser';
// import { Readable } from 'stream';

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

export function generateNavMenu(links, activePage) {
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
