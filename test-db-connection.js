#!/usr/bin/env node

/**
 * Simple Database Connection Test
 * Tests PostgreSQL connection using environment variables
 */

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

async function testConnection() {
    console.log('🔄 Testing PostgreSQL connection...\n');
    
    try {
        const env = loadEnv();
        
        // Test connection to postgres database first
        const client = new Client({
            host: env.AP_POSTGRES_HOST || 'localhost',
            port: parseInt(env.AP_POSTGRES_PORT) || 5432,
            user: env.AP_POSTGRES_USERNAME || 'postgres',
            password: env.AP_POSTGRES_PASSWORD || 'activepieces_sop_password',
            database: 'postgres' // Connect to default database first
        });
        
        await client.connect();
        console.log('✅ Connected to PostgreSQL server');
        
        // Check if our target database exists
        const dbResult = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [env.AP_POSTGRES_DATABASE]);
        
        if (dbResult.rows.length === 0) {
            console.log(`📝 Creating database '${env.AP_POSTGRES_DATABASE}'...`);
            await client.query(`CREATE DATABASE ${env.AP_POSTGRES_DATABASE}`);
            console.log('✅ Database created successfully');
        } else {
            console.log(`✅ Database '${env.AP_POSTGRES_DATABASE}' already exists`);
        }
        
        await client.end();
        
        // Now test connection to our target database
        const targetClient = new Client({
            host: env.AP_POSTGRES_HOST || 'localhost',
            port: parseInt(env.AP_POSTGRES_PORT) || 5432,
            user: env.AP_POSTGRES_USERNAME || 'postgres',
            password: env.AP_POSTGRES_PASSWORD || 'activepieces_sop_password',
            database: env.AP_POSTGRES_DATABASE || 'activepieces_sop'
        });
        
        await targetClient.connect();
        console.log(`✅ Connected to target database '${env.AP_POSTGRES_DATABASE}'`);
        
        // Test query
        const result = await targetClient.query('SELECT NOW() as current_time, version()');
        console.log(`⏰ Current time: ${result.rows[0].current_time}`);
        console.log(`📊 PostgreSQL version: ${result.rows[0].version.split(' ').slice(0, 2).join(' ')}`);
        
        await targetClient.end();
        
        // Test DATABASE_URL
        if (env.DATABASE_URL) {
            const urlClient = new Client({ connectionString: env.DATABASE_URL });
            await urlClient.connect();
            console.log('✅ DATABASE_URL connection successful');
            await urlClient.end();
        }
        
        console.log('\n🎉 Database setup verification COMPLETE!');
        console.log('📝 Ready for migrations (Task A1.4)');
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Troubleshooting:');
            console.log('   1. Check if PostgreSQL is running:');
            console.log('      - macOS: brew services start postgresql');
            console.log('      - Linux: sudo systemctl start postgresql');
            console.log('   2. Verify PostgreSQL is listening on port 5432');
            console.log('   3. Check firewall settings');
        } else if (error.code === '28P01') {
            console.log('\n💡 Authentication failed:');
            console.log('   1. Check username and password in .env');
            console.log('   2. Verify PostgreSQL user exists');
            console.log('   3. Check pg_hba.conf for authentication method');
        }
        
        process.exit(1);
    }
}

if (require.main === module) {
    testConnection();
}

module.exports = { testConnection, loadEnv };