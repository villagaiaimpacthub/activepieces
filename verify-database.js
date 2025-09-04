#!/usr/bin/env node

/**
 * Database Setup Verification Script
 * 
 * This script verifies PostgreSQL service status, creates the required database,
 * and tests database connectivity for the ActivePieces SOP tool.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
    log(`✓ ${message}`, 'green');
}

function logError(message) {
    log(`✗ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠ ${message}`, 'yellow');
}

// Load environment variables from .env file
function loadEnvConfig() {
    const envPath = path.join(__dirname, '.env');
    
    if (!fs.existsSync(envPath)) {
        throw new Error('.env file not found. Please ensure A1.2 (Environment Setup) is complete.');
    }

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

    return {
        host: envVars.AP_POSTGRES_HOST || 'localhost',
        port: envVars.AP_POSTGRES_PORT || '5432',
        username: envVars.AP_POSTGRES_USERNAME || 'postgres',
        password: envVars.AP_POSTGRES_PASSWORD || 'activepieces_sop_password',
        database: envVars.AP_POSTGRES_DATABASE || 'activepieces_sop',
        databaseUrl: envVars.DATABASE_URL
    };
}

// Check if PostgreSQL service is running
function checkPostgreSQLService() {
    logStep('1', 'Checking PostgreSQL service status...');
    
    try {
        // Try different methods to check PostgreSQL status
        let isRunning = false;
        
        try {
            // Method 1: Try connecting with psql
            execSync('pg_isready', { stdio: 'ignore' });
            isRunning = true;
        } catch (error) {
            // Method 2: Check if process is running
            try {
                if (process.platform === 'darwin') {
                    execSync('pgrep -f postgres', { stdio: 'ignore' });
                    isRunning = true;
                } else if (process.platform === 'linux') {
                    execSync('systemctl is-active --quiet postgresql', { stdio: 'ignore' });
                    isRunning = true;
                }
            } catch (e) {
                // Method 3: Try to connect to port
                try {
                    const config = loadEnvConfig();
                    execSync(`nc -z ${config.host} ${config.port}`, { stdio: 'ignore' });
                    isRunning = true;
                } catch (portError) {
                    isRunning = false;
                }
            }
        }
        
        if (isRunning) {
            logSuccess('PostgreSQL service is running');
            return true;
        } else {
            logError('PostgreSQL service is not running');
            logWarning('Please start PostgreSQL service:');
            if (process.platform === 'darwin') {
                log('  - Using Homebrew: brew services start postgresql', 'yellow');
                log('  - Using PostgreSQL.app: Start the application', 'yellow');
                log('  - Using MacPorts: sudo port load postgresql13-server', 'yellow');
            } else if (process.platform === 'linux') {
                log('  - Ubuntu/Debian: sudo systemctl start postgresql', 'yellow');
                log('  - CentOS/RHEL: sudo systemctl start postgresql', 'yellow');
            }
            return false;
        }
    } catch (error) {
        logError(`Failed to check PostgreSQL service: ${error.message}`);
        return false;
    }
}

// Test database connection using environment credentials
function testDatabaseConnection(config) {
    logStep('2', 'Testing database connection...');
    
    return new Promise((resolve) => {
        const { Client } = require('pg');
        const client = new Client({
            host: config.host,
            port: config.port,
            user: config.username,
            password: config.password,
            database: 'postgres' // Connect to default postgres database first
        });
        
        client.connect()
            .then(() => {
                logSuccess('Successfully connected to PostgreSQL server');
                client.end();
                resolve(true);
            })
            .catch(error => {
                logError(`Failed to connect to PostgreSQL: ${error.message}`);
                if (error.code === 'ECONNREFUSED') {
                    logWarning('Connection refused. Ensure PostgreSQL is running and accessible.');
                } else if (error.code === '28P01') {
                    logWarning('Authentication failed. Check username and password in .env file.');
                } else {
                    logWarning(`Connection error code: ${error.code}`);
                }
                resolve(false);
            });
    });
}

// Create the activepieces_sop database if it doesn't exist
function createDatabase(config) {
    logStep('3', `Creating database '${config.database}' if it doesn't exist...`);
    
    return new Promise((resolve) => {
        const { Client } = require('pg');
        const client = new Client({
            host: config.host,
            port: config.port,
            user: config.username,
            password: config.password,
            database: 'postgres' // Connect to default postgres database
        });
        
        client.connect()
            .then(() => {
                // Check if database exists
                return client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [config.database]);
            })
            .then(result => {
                if (result.rows.length > 0) {
                    logSuccess(`Database '${config.database}' already exists`);
                    client.end();
                    resolve(true);
                } else {
                    // Create the database
                    return client.query(`CREATE DATABASE ${config.database}`);
                }
            })
            .then(() => {
                if (arguments.length > 0) { // Only log if we actually created the database
                    logSuccess(`Database '${config.database}' created successfully`);
                }
                client.end();
                resolve(true);
            })
            .catch(error => {
                logError(`Failed to create database: ${error.message}`);
                client.end();
                resolve(false);
            });
    });
}

// Test connection to the specific activepieces_sop database
function testTargetDatabase(config) {
    logStep('4', `Testing connection to '${config.database}' database...`);
    
    return new Promise((resolve) => {
        const { Client } = require('pg');
        const client = new Client({
            host: config.host,
            port: config.port,
            user: config.username,
            password: config.password,
            database: config.database
        });
        
        client.connect()
            .then(() => {
                logSuccess(`Successfully connected to '${config.database}' database`);
                return client.query('SELECT NOW() as current_time');
            })
            .then(result => {
                logSuccess(`Database query successful. Current time: ${result.rows[0].current_time}`);
                client.end();
                resolve(true);
            })
            .catch(error => {
                logError(`Failed to connect to target database: ${error.message}`);
                client.end();
                resolve(false);
            });
    });
}

// Test DATABASE_URL connection string
function testDatabaseUrl(config) {
    logStep('5', 'Testing DATABASE_URL connection string...');
    
    if (!config.databaseUrl) {
        logError('DATABASE_URL not found in .env file');
        return Promise.resolve(false);
    }
    
    return new Promise((resolve) => {
        const { Client } = require('pg');
        const client = new Client({
            connectionString: config.databaseUrl
        });
        
        client.connect()
            .then(() => {
                logSuccess('DATABASE_URL connection successful');
                return client.query('SELECT version()');
            })
            .then(result => {
                logSuccess(`PostgreSQL version: ${result.rows[0].version.split(' ').slice(0, 2).join(' ')}`);
                client.end();
                resolve(true);
            })
            .catch(error => {
                logError(`DATABASE_URL connection failed: ${error.message}`);
                client.end();
                resolve(false);
            });
    });
}

// Main verification function
async function verifyDatabase() {
    log('\n=== DATABASE SETUP VERIFICATION (A1.3) ===', 'bright');
    log('Verifying PostgreSQL setup for ActivePieces SOP Tool\n', 'blue');
    
    let score = 0;
    let maxScore = 100;
    
    try {
        // Load configuration
        const config = loadEnvConfig();
        log(`Database Configuration:`, 'cyan');
        log(`  Host: ${config.host}`);
        log(`  Port: ${config.port}`);
        log(`  Username: ${config.username}`);
        log(`  Database: ${config.database}`);
        log(`  Database URL: ${config.databaseUrl ? 'Configured' : 'Missing'}\n`);
        
        // Step 1: Check PostgreSQL service (20 points)
        if (checkPostgreSQLService()) {
            score += 20;
        } else {
            logError('CRITICAL: PostgreSQL service is not running. Cannot proceed.');
            logError('Please start PostgreSQL and run this script again.');
            process.exit(1);
        }
        
        // Step 2: Test connection (20 points)
        if (await testDatabaseConnection(config)) {
            score += 20;
        } else {
            logError('CRITICAL: Cannot connect to PostgreSQL. Check configuration.');
            process.exit(1);
        }
        
        // Step 3: Create database (20 points)
        if (await createDatabase(config)) {
            score += 20;
        } else {
            logError('CRITICAL: Failed to create database.');
            process.exit(1);
        }
        
        // Step 4: Test target database (20 points)
        if (await testTargetDatabase(config)) {
            score += 20;
        } else {
            logError('CRITICAL: Cannot connect to target database.');
            process.exit(1);
        }
        
        // Step 5: Test DATABASE_URL (20 points)
        if (await testDatabaseUrl(config)) {
            score += 20;
        } else {
            logWarning('DATABASE_URL test failed, but database is accessible via individual parameters');
            score += 10; // Partial credit
        }
        
    } catch (error) {
        logError(`Verification failed: ${error.message}`);
        process.exit(1);
    }
    
    // Final results
    log('\n=== VERIFICATION RESULTS ===', 'bright');
    
    if (score >= 90) {
        logSuccess(`Database setup complete! Score: ${score}/${maxScore}`);
        logSuccess('✓ PostgreSQL service is running');
        logSuccess('✓ Database connection successful');
        logSuccess(`✓ Database '${loadEnvConfig().database}' is ready`);
        logSuccess('✓ Ready for migrations (A1.4)');
        
        log('\nNext Steps:', 'cyan');
        log('  1. Run database migrations (Task A1.4)');
        log('  2. Start the application development server');
        log('  3. Access the SOP tool interface\n');
        
        process.exit(0);
        
    } else if (score >= 60) {
        logWarning(`Database setup partially complete. Score: ${score}/${maxScore}`);
        logWarning('Some issues found but database is functional.');
        process.exit(0);
        
    } else {
        logError(`Database setup failed. Score: ${score}/${maxScore}`);
        logError('Critical issues prevent database usage.');
        process.exit(1);
    }
}

// Run verification if script is executed directly
if (require.main === module) {
    // Check if pg module is available
    try {
        require('pg');
    } catch (error) {
        logError('PostgreSQL client (pg) not found. Installing dependencies...');
        try {
            execSync('npm install pg', { stdio: 'inherit' });
            logSuccess('PostgreSQL client installed successfully');
        } catch (installError) {
            logError('Failed to install PostgreSQL client. Please run: npm install pg');
            process.exit(1);
        }
    }
    
    verifyDatabase().catch(error => {
        logError(`Unexpected error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = {
    verifyDatabase,
    loadEnvConfig,
    checkPostgreSQLService,
    testDatabaseConnection,
    createDatabase,
    testTargetDatabase,
    testDatabaseUrl
};