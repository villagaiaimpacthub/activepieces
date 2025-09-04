#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 TASK A2.3: Quick Build Test');
console.log('Working Directory:', process.cwd());

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
    console.log('❌ No package.json found - not in project root');
    process.exit(1);
}

console.log('✅ Found package.json');

// Check if .env exists
if (fs.existsSync('.env')) {
    console.log('✅ Found .env file');
} else {
    console.log('⚠️ No .env file found');
}

// Test if nx command is available
exec('npx nx --version', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ NX not available:', error.message);
        return;
    }
    
    console.log('✅ NX version:', stdout.trim());
    
    // List available projects
    exec('npx nx show projects', (error, stdout, stderr) => {
        if (error) {
            console.log('❌ Could not list projects:', error.message);
            return;
        }
        
        console.log('\n📋 Available NX Projects:');
        console.log(stdout);
        
        // Test server-api build
        console.log('\n🔨 Testing Server API Build...');
        const buildProcess = exec('npx nx build server-api', { timeout: 120000 });
        
        let buildOutput = '';
        
        buildProcess.stdout.on('data', (data) => {
            buildOutput += data;
            process.stdout.write(data);
        });
        
        buildProcess.stderr.on('data', (data) => {
            buildOutput += data;
            process.stderr.write(data);
        });
        
        buildProcess.on('close', (code) => {
            console.log(`\n🎯 Server API Build Result: ${code === 0 ? '✅ SUCCESS' : '❌ FAILED'} (Exit Code: ${code})`);
            
            if (code === 0) {
                // Check build artifacts
                if (fs.existsSync('dist/packages/server/api')) {
                    console.log('✅ Build artifacts found at dist/packages/server/api');
                    
                    // Test engine build
                    console.log('\n🔨 Testing Engine Build...');
                    const engineProcess = exec('npx nx build engine', { timeout: 120000 });
                    
                    engineProcess.stdout.on('data', (data) => {
                        process.stdout.write(data);
                    });
                    
                    engineProcess.stderr.on('data', (data) => {
                        process.stderr.write(data);
                    });
                    
                    engineProcess.on('close', (engineCode) => {
                        console.log(`\n🎯 Engine Build Result: ${engineCode === 0 ? '✅ SUCCESS' : '❌ FAILED'} (Exit Code: ${engineCode})`);
                        
                        if (engineCode === 0 && fs.existsSync('dist/packages/engine')) {
                            console.log('✅ Engine artifacts found at dist/packages/engine');
                        }
                        
                        // Calculate score
                        let score = 0;
                        if (code === 0) score += 50; // Server API
                        if (engineCode === 0) score += 30; // Engine
                        if (fs.existsSync('dist/packages/server/api')) score += 10;
                        if (fs.existsSync('dist/packages/engine')) score += 10;
                        
                        console.log(`\n🎯 PARTIAL BUILD SCORE: ${score}/100`);
                        
                        if (score >= 80) {
                            console.log('🟢 BUILD SUCCESS: Components built successfully');
                            console.log('✅ Ready to test backend startup');
                        } else if (score >= 50) {
                            console.log('🟡 PARTIAL SUCCESS: Some builds working');
                        } else {
                            console.log('🔴 BUILD FAILED: Critical build issues');
                        }
                    });
                } else {
                    console.log('❌ Build artifacts not found');
                }
            }
        });
    });
});