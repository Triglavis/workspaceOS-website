#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const token = process.env.CLOUDFLARE_ANALYTICS_TOKEN;

if (!token) {
  console.warn('WARNING: CLOUDFLARE_ANALYTICS_TOKEN not set; skipping Cloudflare Analytics injection.');
  process.exit(0);
}

const projectRoot = path.join(__dirname, '..');
const ignoreAtRoot = new Set(['.git', 'node_modules', 'scripts']);
const placeholders = [
  'WORKSPACEOS_CLOUDFLARE_TOKEN_PLACEHOLDER',
  'c71909abc8ce48cd99072246781b8353'
];
const htmlFiles = [];

const collectHtmlFiles = (dir, isRoot = false) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (isRoot && ignoreAtRoot.has(entry.name)) {
        continue;
      }
      collectHtmlFiles(entryPath);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(entryPath);
    }
  }
};

collectHtmlFiles(projectRoot, true);

let filesUpdated = 0;

for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  for (const placeholder of placeholders) {
    if (!content.includes(placeholder)) {
      continue;
    }

    content = content.split(placeholder).join(token);
    updated = true;
  }

  if (!updated) {
    continue;
  }

  fs.writeFileSync(filePath, content);
  filesUpdated += 1;
  console.log(`Updated ${path.relative(projectRoot, filePath)}`);
}

if (filesUpdated === 0) {
  console.log('Info: No analytics placeholders found to replace.');
  process.exit(0);
}

console.log('Injected Cloudflare Analytics token into ' + filesUpdated + ` file${filesUpdated === 1 ? '' : 's'}.`);
