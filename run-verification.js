#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

try {
    const scriptPath = path.join(__dirname, 'verify-database.js');
    execSync(`node ${scriptPath}`, { 
        stdio: 'inherit',
        cwd: __dirname
    });
} catch (error) {
    console.error('Verification script failed:', error.message);
    process.exit(1);
}