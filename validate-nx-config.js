#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Change to the project directory
process.chdir(__dirname);

console.log('🔧 VALIDATING NX CONFIGURATION');
console.log('==============================');

let allTestsPassed = true;

// Test 1: NX workspace validation
console.log('1️⃣ Testing NX workspace validation...');
try {
    const validationOutput = execSync('npx nx show projects --json', { 
        encoding: 'utf8', 
        timeout: 30000,
        stdio: ['inherit', 'pipe', 'pipe']
    });
    
    const projects = JSON.parse(validationOutput);
    const projectCount = projects.length;
    console.log(`✅ NX workspace valid with ${projectCount} projects detected`);
    
    // Check if critical projects exist
    const criticalProjects = ['server-api', 'engine', 'sop-framework'];
    const missingProjects = criticalProjects.filter(p => !projects.includes(p));
    
    if (missingProjects.length > 0) {
        console.log(`❌ Critical projects missing: ${missingProjects.join(', ')}`);
        allTestsPassed = false;
    } else {
        console.log('✅ All critical projects detected');
    }
    
} catch (error) {
    console.log('❌ NX workspace validation failed');
    console.log('Error:', error.stderr || error.message);
    allTestsPassed = false;
}

console.log('');

// Test 2: Project configuration validation
console.log('2️⃣ Testing specific project configurations...');

const projectsToTest = [
    { name: 'server-api', path: 'packages/server/api/project.json' },
    { name: 'engine', path: 'packages/engine/project.json' },
    { name: 'sop-framework', path: 'packages/pieces/community/sop-framework/project.json' }
];

for (const project of projectsToTest) {
    try {
        const configOutput = execSync(`npx nx show project ${project.name} --json`, { 
            encoding: 'utf8', 
            timeout: 10000,
            stdio: ['inherit', 'pipe', 'pipe']
        });
        
        const config = JSON.parse(configOutput);
        console.log(`✅ ${project.name}: Configuration valid`);
        
        // Check if referenced files exist
        const projectConfig = JSON.parse(fs.readFileSync(project.path, 'utf8'));
        if (projectConfig.targets.build?.options?.tsConfig) {
            const tsConfigPath = projectConfig.targets.build.options.tsConfig;
            if (fs.existsSync(tsConfigPath)) {
                console.log(`  ✓ TypeScript config exists: ${tsConfigPath}`);
            } else {
                console.log(`  ❌ TypeScript config missing: ${tsConfigPath}`);
                allTestsPassed = false;
            }
        }
        
        if (projectConfig.targets.test?.options?.jestConfig) {
            const jestConfigPath = projectConfig.targets.test.options.jestConfig;
            if (fs.existsSync(jestConfigPath)) {
                console.log(`  ✓ Jest config exists: ${jestConfigPath}`);
            } else {
                console.log(`  ❌ Jest config missing: ${jestConfigPath}`);
                allTestsPassed = false;
            }
        }
        
    } catch (error) {
        console.log(`❌ ${project.name}: Configuration failed`);
        console.log('  Error:', error.stderr || error.message);
        allTestsPassed = false;
    }
}

console.log('');

// Test 3: Lint configuration validation
console.log('3️⃣ Testing lint configuration...');
try {
    // Test if the SOP framework lint target works
    const lintOutput = execSync('npx nx lint sop-framework --dry-run', { 
        encoding: 'utf8', 
        timeout: 15000,
        stdio: ['inherit', 'pipe', 'pipe']
    });
    console.log('✅ SOP framework lint configuration valid');
} catch (error) {
    console.log('❌ SOP framework lint configuration failed');
    console.log('Error:', error.stderr || error.message);
    allTestsPassed = false;
}

console.log('');

// Test 4: Build configuration validation
console.log('4️⃣ Testing build configuration...');
try {
    // Test if the SOP framework build target works (dry run)
    const buildOutput = execSync('npx nx build sop-framework --dry-run', { 
        encoding: 'utf8', 
        timeout: 15000,
        stdio: ['inherit', 'pipe', 'pipe']
    });
    console.log('✅ SOP framework build configuration valid');
} catch (error) {
    console.log('❌ SOP framework build configuration failed');
    console.log('Error:', error.stderr || error.message);
    allTestsPassed = false;
}

console.log('');

// Test 5: Graph processing test
console.log('5️⃣ Testing project graph processing...');
try {
    const graphOutput = execSync('npx nx graph --no-open', { 
        encoding: 'utf8', 
        timeout: 30000,
        stdio: ['inherit', 'pipe', 'pipe']
    });
    console.log('✅ NX project graph processed successfully');
} catch (error) {
    console.log('❌ NX project graph processing failed');
    console.log('Error:', error.stderr || error.message);
    allTestsPassed = false;
}

console.log('');
console.log('🏁 NX CONFIGURATION VALIDATION COMPLETE');
console.log('=======================================');

if (allTestsPassed) {
    console.log('✅ ALL TESTS PASSED - NX configuration is valid');
    console.log('✅ npm run dev:backend should work without NX graph errors');
    process.exit(0);
} else {
    console.log('❌ SOME TESTS FAILED - NX configuration needs fixes');
    process.exit(1);
}