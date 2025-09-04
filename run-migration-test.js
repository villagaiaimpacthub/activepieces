#!/usr/bin/env node

/**
 * TASK A1.4 - Database Migration Execution Script
 * Tests database connection and then triggers migration execution
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function executeCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        console.log(`🔄 Executing: ${command} ${args.join(' ')}`);
        
        const child = spawn(command, args, {
            stdio: 'inherit',
            cwd: options.cwd || process.cwd(),
            env: { ...process.env, ...options.env }
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });
        
        child.on('error', (error) => {
            reject(error);
        });
    });
}

async function main() {
    console.log('🚀 TASK A1.4 - Database Migration Execution\n');
    
    try {
        // Step 1: Test database connection
        console.log('📋 Step 1: Testing database connection...');
        await executeCommand('node', ['test-db-connection.js']);
        console.log('✅ Database connection verified\n');
        
        // Step 2: Check if npm packages are installed
        console.log('📋 Step 2: Verifying npm packages...');
        if (!fs.existsSync('./node_modules')) {
            console.log('📦 Installing npm packages...');
            await executeCommand('npm', ['install']);
            console.log('✅ Packages installed\n');
        } else {
            console.log('✅ Packages already installed\n');
        }
        
        // Step 3: Start backend to trigger migrations
        console.log('📋 Step 3: Starting backend to execute migrations...');
        console.log('ℹ️  Backend will auto-run migrations on startup');
        console.log('ℹ️  Press Ctrl+C to stop once migrations complete\n');
        
        await executeCommand('npm', ['run', 'dev:backend']);
        
    } catch (error) {
        console.error('❌ Migration execution failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };