#!/usr/bin/env node

/**
 * Test script to ensure no development flags are enabled in production
 * This should be run before committing/pushing to production
 */

const fs = require('fs');
const path = require('path');

// Files to check for dev flags
const filesToCheck = [
    'gravitational-singularity.js',
    'script.js',
    'index.html'
];

// Pattern to find DEV_FLAGS objects
const devFlagPattern = /DEV_FLAGS\s*=\s*\{([^}]+)\}/g;
const flagValuePattern = /(\w+)\s*:\s*(true|false)/g;

// Check for localhost detection code (this is OK in production)
const localhostPattern = /isLocalhost/g;

let hasErrors = false;
const errors = [];

console.log('🔍 Checking for enabled development flags...\n');

filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Warning: ${file} not found, skipping...`);
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for localhost detection (informational only)
    if (content.match(localhostPattern)) {
        console.log(`ℹ️  ${file} contains localhost detection (OK for production)`);
    }
    
    const matches = content.match(devFlagPattern);
    
    if (matches) {
        matches.forEach(match => {
            let flagMatch;
            while ((flagMatch = flagValuePattern.exec(match)) !== null) {
                const flagName = flagMatch[1];
                const flagValue = flagMatch[2];
                
                if (flagValue === 'true') {
                    hasErrors = true;
                    errors.push({
                        file: file,
                        flag: flagName,
                        value: flagValue
                    });
                } else {
                    console.log(`✅ ${file}: ${flagName} = ${flagValue}`);
                }
            }
        });
    }
});

console.log('');

if (hasErrors) {
    console.error('❌ PRODUCTION CHECK FAILED!\n');
    console.error('The following development flags are enabled and must be set to false:\n');
    
    errors.forEach(error => {
        console.error(`  📁 ${error.file}`);
        console.error(`     Flag: ${error.flag} = ${error.value}`);
        console.error(`     ⚠️  This must be set to false before pushing to production!\n`);
    });
    
    console.error('To fix this issue:');
    console.error('1. Open the files listed above');
    console.error('2. Set all DEV_FLAGS values to false');
    console.error('3. Run this test again: node scripts/test-dev-flags.js\n');
    
    process.exit(1);
} else {
    console.log('✅ SUCCESS: All development flags are properly disabled!');
    console.log('Safe to push to production.\n');
    process.exit(0);
}
