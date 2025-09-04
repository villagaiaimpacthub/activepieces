#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Change to the project directory
process.chdir(__dirname);

console.log('🔧 TESTING NX PROJECT GRAPH PROCESSING');
console.log('======================================');

console.log(`Working directory: ${process.cwd()}`);
console.log('');

// Test 1: NX project graph processing
console.log('1️⃣ Testing NX project graph processing...');
try {
    const graphOutput = execSync('npx nx graph --no-open', { 
        encoding: 'utf8', 
        timeout: 30000,
        stdio: ['inherit', 'pipe', 'pipe']
    });
    console.log('✅ NX project graph processed successfully');
    console.log('Graph output:', graphOutput);
} catch (error) {
    console.log('❌ NX project graph failed');
    console.log('Error output:', error.stderr || error.message);
    console.log('Exit code:', error.status);
}

console.log('');

// Test 2: NX workspace status
console.log('2️⃣ Testing NX workspace status...');
try {
    const projectsOutput = execSync('npx nx show projects', { 
        encoding: 'utf8', 
        timeout: 15000,
        stdio: ['inherit', 'pipe', 'pipe']
    });
    console.log('✅ NX workspace projects detected successfully');
    console.log('Projects found:');
    projectsOutput.split('\n').forEach(project => {
        if (project.trim()) {
            console.log(`  - ${project.trim()}`);
        }
    });
} catch (error) {
    console.log('❌ NX workspace status failed');
    console.log('Error output:', error.stderr || error.message);
}

console.log('');

// Test 3: Backend project configuration
console.log('3️⃣ Testing backend project configuration...');
try {
    const serverApiOutput = execSync('npx nx show project server-api', { 
        encoding: 'utf8', 
        timeout: 10000,
        stdio: ['inherit', 'pipe', 'pipe']
    });
    console.log('✅ Backend project configuration valid');
} catch (error) {
    console.log('❌ Backend project configuration failed');
    console.log('Error output:', error.stderr || error.message);
}

console.log('');

// Test 4: Engine project configuration  
console.log('4️⃣ Testing engine project configuration...');
try {
    const engineOutput = execSync('npx nx show project engine', { 
        encoding: 'utf8', 
        timeout: 10000,
        stdio: ['inherit', 'pipe', 'pipe']
    });
    console.log('✅ Engine project configuration valid');
} catch (error) {
    console.log('❌ Engine project configuration failed');
    console.log('Error output:', error.stderr || error.message);
}

console.log('');

// Test 5: SOP Framework project configuration
console.log('5️⃣ Testing SOP framework project configuration...');
try {
    const sopOutput = execSync('npx nx show project sop-framework', { 
        encoding: 'utf8', 
        timeout: 10000,
        stdio: ['inherit', 'pipe', 'pipe']
    });
    console.log('✅ SOP framework project configuration valid');
} catch (error) {
    console.log('❌ SOP framework project configuration failed');
    console.log('Error output:', error.stderr || error.message);
}

console.log('');

// Test 6: Dev backend command test (dry run)
console.log('6️⃣ Testing dev:backend script dry run...');
try {
    console.log('Checking npm script configuration...');
    const packageJson = require('./package.json');
    const devBackendScript = packageJson.scripts['dev:backend'];
    if (devBackendScript) {
        console.log('✅ dev:backend script found:', devBackendScript);
    } else {
        console.log('❌ dev:backend script not found in package.json');
    }
} catch (error) {
    console.log('❌ Failed to check dev:backend script');
    console.log('Error:', error.message);
}

console.log('');
console.log('🏁 NX DIAGNOSIS COMPLETE');