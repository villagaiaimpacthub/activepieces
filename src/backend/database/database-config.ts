import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'activepieces_sop',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development' ? 'all' : ['error'],
  entities: ['src/backend/database/entities/*.ts'],
  migrations: ['src/backend/database/migrations/*.ts'],
  subscribers: ['src/backend/database/subscribers/*.ts'],
  cli: {
    entitiesDir: 'src/backend/database/entities',
    migrationsDir: 'src/backend/database/migrations',
    subscribersDir: 'src/backend/database/subscribers',
  },
});

// Initialize data source
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection initialized successfully');
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
};