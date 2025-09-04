#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Running TypeScript compilation diagnostic for SOP Framework...\n');

const sopFrameworkPath = path.join(__dirname, 'packages/pieces/community/sop-framework');
const tsconfigPath = path.join(sopFrameworkPath, 'tsconfig.json');

// Test TypeScript compilation with detailed output
const tscProcess = spawn('npx', ['tsc', '--noEmit', '--project', tsconfigPath], {
    cwd: __dirname,
    stdio: 'pipe'
});

let stdout = '';
let stderr = '';

tscProcess.stdout.on('data', (data) => {
    stdout += data.toString();
});

tscProcess.stderr.on('data', (data) => {
    stderr += data.toString();
});

tscProcess.on('close', (code) => {
    console.log(`📊 TypeScript compilation completed with exit code: ${code}\n`);
    
    if (stdout) {
        console.log('📝 STDOUT:');
        console.log(stdout);
        console.log('\n');
    }
    
    if (stderr) {
        console.log('❌ STDERR (Compilation Errors):');
        console.log(stderr);
        console.log('\n');
    }
    
    if (code === 0) {
        console.log('✅ TypeScript compilation successful - no errors found!');
    } else {
        console.log('🚨 TypeScript compilation failed - errors need to be fixed');
        
        // Attempt to parse and categorize errors
        if (stderr) {
            const lines = stderr.split('\n');
            const errorCategories = {
                'Cannot find module': [],
                'Type error': [],
                'Property does not exist': [],
                'Import error': []
            };
            
            lines.forEach(line => {
                if (line.includes('Cannot find module')) {
                    errorCategories['Cannot find module'].push(line);
                } else if (line.includes('error TS')) {
                    errorCategories['Type error'].push(line);
                } else if (line.includes('Property') && line.includes('does not exist')) {
                    errorCategories['Property does not exist'].push(line);
                } else if (line.includes('import') || line.includes('Import')) {
                    errorCategories['Import error'].push(line);
                }
            });
            
            console.log('\n📋 Error Summary:');
            Object.entries(errorCategories).forEach(([category, errors]) => {
                if (errors.length > 0) {
                    console.log(`\n${category}: ${errors.length} errors`);
                    errors.slice(0, 3).forEach(error => console.log(`  - ${error.trim()}`));
                    if (errors.length > 3) {
                        console.log(`  ... and ${errors.length - 3} more`);
                    }
                }
            });
        }
    }
});

tscProcess.on('error', (error) => {
    console.error('❌ Failed to start TypeScript compilation:', error);
});