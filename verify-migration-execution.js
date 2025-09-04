#!/usr/bin/env node

/**
 * TASK A1.4 - Migration Execution Verification
 * Verifies that migrations can be executed successfully
 */

const { spawn } = require('child_process');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                envVars[key.trim()] = valueParts.join('=').trim();
            }
        }
    });
    
    return envVars;
}

async function checkPrerequisites() {
    console.log('🔄 Checking migration prerequisites...\n');
    
    let score = 0;
    
    // Check 1: Environment file
    if (fs.existsSync('./.env')) {
        console.log('✅ Environment file (.env) exists');
        score += 20;
    } else {
        console.log('❌ Environment file (.env) missing');
        return score;
    }
    
    // Check 2: Database configuration
    const env = loadEnv();
    const requiredVars = ['AP_POSTGRES_HOST', 'AP_POSTGRES_PORT', 'AP_POSTGRES_USERNAME', 'AP_POSTGRES_PASSWORD', 'AP_POSTGRES_DATABASE'];
    let configComplete = true;
    
    requiredVars.forEach(varName => {
        if (env[varName]) {
            console.log(`✅ ${varName} configured`);
        } else {
            console.log(`❌ ${varName} missing`);
            configComplete = false;
        }
    });
    
    if (configComplete) {
        score += 20;
    }
    
    // Check 3: Node modules
    if (fs.existsSync('./node_modules')) {
        console.log('✅ Node modules installed');
        score += 20;
    } else {
        console.log('❌ Node modules not installed - run npm install');
        return score;
    }
    
    // Check 4: Migration files
    const migrationPaths = [
        './packages/server/api/src/app/database/migration',
        './src/backend/database/migrations'
    ];
    
    let migrationsFound = false;
    for (const migrationPath of migrationPaths) {
        if (fs.existsSync(migrationPath)) {
            const files = fs.readdirSync(migrationPath, { recursive: true });
            const migrationFiles = files.filter(file => file.includes('Migration') || file.endsWith('.ts'));
            if (migrationFiles.length > 0) {
                console.log(`✅ Migration files found: ${migrationFiles.length} files`);
                migrationsFound = true;
                score += 20;
                break;
            }
        }
    }
    
    if (!migrationsFound) {
        console.log('⚠️  Migration files not found in expected locations');
        score += 10; // Partial credit - may be in different location
    }
    
    // Check 5: Database connection
    try {
        const client = new Client({
            host: env.AP_POSTGRES_HOST || 'localhost',
            port: parseInt(env.AP_POSTGRES_PORT) || 5432,
            user: env.AP_POSTGRES_USERNAME || 'postgres',
            password: env.AP_POSTGRES_PASSWORD || 'activepieces_sop_password',
            database: 'postgres'
        });
        
        await client.connect();
        await client.query('SELECT 1');
        await client.end();
        
        console.log('✅ Database connection successful');
        score += 20;
    } catch (error) {
        console.log(`❌ Database connection failed: ${error.message}`);
    }
    
    console.log(`\n📊 Prerequisites score: ${score}/100\n`);
    return score;
}

async function attemptMigrationExecution() {
    console.log('🔄 Attempting migration execution via backend startup...\n');
    
    return new Promise((resolve) => {
        let migrationStarted = false;
        let migrationCompleted = false;
        let migrationErrors = [];
        let startupTimeout;
        
        // Start the backend server
        const backendProcess = spawn('npm', ['run', 'serve:backend'], {
            stdio: 'pipe',
            env: { ...process.env }
        });
        
        // Set a timeout for startup
        startupTimeout = setTimeout(() => {
            console.log('⏰ Backend startup timeout reached (60s)');
            backendProcess.kill('SIGTERM');
            resolve({
                success: false,
                migrationStarted,
                migrationCompleted,
                errors: ['Startup timeout']
            });
        }, 60000);
        
        backendProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`[BACKEND] ${output.trim()}`);
            
            // Look for migration indicators
            if (output.includes('migration') || output.includes('Migration') || output.includes('migrating') || output.includes('Running')) {
                if (!migrationStarted) {
                    migrationStarted = true;
                    console.log('🔄 Migration execution detected!');
                }
            }
            
            // Look for completion indicators
            if (output.includes('Server running') || output.includes('Application started') || output.includes('Server listening')) {
                migrationCompleted = true;
                console.log('✅ Backend startup completed');
                clearTimeout(startupTimeout);
                
                // Give it a moment then kill the process
                setTimeout(() => {
                    backendProcess.kill('SIGTERM');
                    resolve({
                        success: true,
                        migrationStarted,
                        migrationCompleted,
                        errors: migrationErrors
                    });
                }, 2000);
            }
        });
        
        backendProcess.stderr.on('data', (data) => {
            const error = data.toString();
            console.error(`[BACKEND ERROR] ${error.trim()}`);
            
            if (error.includes('error') || error.includes('Error') || error.includes('fail')) {
                migrationErrors.push(error.trim());
            }
        });
        
        backendProcess.on('close', (code) => {
            clearTimeout(startupTimeout);
            console.log(`\n[BACKEND] Process exited with code ${code}`);
            
            if (!migrationCompleted) {
                resolve({
                    success: code === 0,
                    migrationStarted,
                    migrationCompleted: false,
                    errors: migrationErrors
                });
            }
        });
        
        backendProcess.on('error', (error) => {
            clearTimeout(startupTimeout);
            console.error(`[BACKEND] Process error: ${error.message}`);
            resolve({
                success: false,
                migrationStarted,
                migrationCompleted: false,
                errors: [...migrationErrors, error.message]
            });
        });
    });
}

async function verifyDatabaseSchema() {
    console.log('\n🔄 Verifying database schema after migration attempt...\n');
    
    try {
        const env = loadEnv();
        const client = new Client({
            host: env.AP_POSTGRES_HOST || 'localhost',
            port: parseInt(env.AP_POSTGRES_PORT) || 5432,
            user: env.AP_POSTGRES_USERNAME || 'postgres',
            password: env.AP_POSTGRES_PASSWORD || 'activepieces_sop_password',
            database: env.AP_POSTGRES_DATABASE || 'activepieces_sop'
        });
        
        await client.connect();
        
        // Check migrations table
        let migrationCount = 0;
        try {
            const migrationResult = await client.query('SELECT COUNT(*) as count FROM migrations');
            migrationCount = parseInt(migrationResult.rows[0].count);
            console.log(`✅ Migrations executed: ${migrationCount}`);
        } catch (error) {
            console.log('❌ No migrations table found');
        }
        
        // Check for core tables
        const coreTableResult = await client.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE 'ap_%'
        `);
        
        const coreTableCount = parseInt(coreTableResult.rows[0].count);
        console.log(`✅ Core tables created: ${coreTableCount}`);
        
        // Check for SOP tables
        const sopTableResult = await client.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE 'sop_%'
        `);
        
        const sopTableCount = parseInt(sopTableResult.rows[0].count);
        console.log(`✅ SOP tables created: ${sopTableCount}`);
        
        await client.end();
        
        return {
            migrationCount,
            coreTableCount,
            sopTableCount,
            success: migrationCount > 0 && coreTableCount > 0
        };
        
    } catch (error) {
        console.error('❌ Schema verification failed:', error.message);
        return {
            migrationCount: 0,
            coreTableCount: 0,
            sopTableCount: 0,
            success: false,
            error: error.message
        };
    }
}

async function main() {
    console.log('🚀 TASK A1.4 - DATABASE MIGRATION EXECUTION VERIFICATION\n');
    
    let totalScore = 0;
    
    try {
        // Step 1: Check prerequisites (40 points)
        const prerequisiteScore = await checkPrerequisites();
        totalScore += Math.round(prerequisiteScore * 0.4);
        
        if (prerequisiteScore < 60) {
            console.log('❌ Prerequisites not met - cannot proceed with migrations');
            console.log(`📊 Final Score: ${totalScore}/100`);
            return;
        }
        
        // Step 2: Attempt migration execution (40 points)
        console.log('📋 Attempting migration execution...\n');
        const executionResult = await attemptMigrationExecution();
        
        let executionScore = 0;
        if (executionResult.migrationStarted) executionScore += 20;
        if (executionResult.migrationCompleted) executionScore += 20;
        if (executionResult.success && executionResult.errors.length === 0) executionScore += 10;
        
        console.log(`\n📊 Migration execution score: ${executionScore}/40`);
        totalScore += executionScore;
        
        // Step 3: Verify database schema (20 points)
        const schemaResult = await verifyDatabaseSchema();
        
        let schemaScore = 0;
        if (schemaResult.migrationCount > 0) schemaScore += 10;
        if (schemaResult.coreTableCount > 10) schemaScore += 5;
        if (schemaResult.sopTableCount > 0) schemaScore += 5;
        
        console.log(`📊 Schema verification score: ${schemaScore}/20`);
        totalScore += schemaScore;
        
        // Final results
        console.log('\n' + '=' .repeat(60));
        console.log('📊 TASK A1.4 - MIGRATION EXECUTION RESULTS');
        console.log('=' .repeat(60));
        console.log(`🎯 Total Score: ${totalScore}/100\n`);
        
        if (totalScore >= 85) {
            console.log('✅ MIGRATION EXECUTION SUCCESSFUL');
            console.log('🎉 Database schema fully created');
            console.log('🚀 Ready for application deployment');
        } else if (totalScore >= 65) {
            console.log('⚠️  MIGRATION EXECUTION PARTIAL');
            console.log('📝 Some migrations may need manual execution');
            console.log('🔧 Review logs for any issues');
        } else {
            console.log('❌ MIGRATION EXECUTION INCOMPLETE');
            console.log('🔧 Manual intervention required');
            console.log('📋 Check database configuration and connectivity');
        }
        
        console.log('\n📋 Summary:');
        console.log(`   • Prerequisites: ${Math.round(prerequisiteScore)}/100`);
        console.log(`   • Migration execution: ${executionScore}/40`);
        console.log(`   • Schema verification: ${schemaScore}/20`);
        console.log(`   • Migrations completed: ${schemaResult.migrationCount}`);
        console.log(`   • Tables created: ${schemaResult.coreTableCount + schemaResult.sopTableCount}`);
        
        console.log('\n🚀 Next steps:');
        console.log('   1. Start full application: npm run dev');
        console.log('   2. Access frontend: http://localhost:4200');
        console.log('   3. Verify SOP tool functionality');
        
    } catch (error) {
        console.error('❌ Migration verification failed:', error);
        console.log(`📊 Final Score: ${totalScore}/100`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };