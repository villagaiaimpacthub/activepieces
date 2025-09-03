// Integration test setup
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as request from 'supertest';

// Load test environment
config({ path: '.env.test' });

// Integration test database configuration
export const integrationDbConfig = {
  type: 'postgres' as const,
  host: process.env.TEST_DATABASE_HOST || 'localhost',
  port: parseInt(process.env.TEST_DATABASE_PORT || '5433'),
  username: process.env.TEST_DATABASE_USER || 'test_user',
  password: process.env.TEST_DATABASE_PASSWORD || 'test_password',
  database: process.env.TEST_DATABASE_NAME || 'activepieces_sop_test',
  entities: ['src/backend/database/entities/*.ts'],
  synchronize: true,
  logging: false,
  dropSchema: true,
};

// Global test app and database
let testApp: INestApplication;
let testDataSource: DataSource;

export class IntegrationTestUtils {
  static async createTestApp(AppModule: any): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    
    // Apply middleware and global configurations
    // Similar to main.ts but for testing
    
    await app.init();
    return app;
  }

  static async setupDatabase(): Promise<DataSource> {
    const dataSource = new DataSource(integrationDbConfig);
    await dataSource.initialize();
    return dataSource;
  }

  static async cleanDatabase(dataSource: DataSource): Promise<void> {
    const entities = dataSource.entityMetadatas;
    
    // Disable foreign key checks
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');
    
    // Clear all tables
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
    }
    
    // Re-enable foreign key checks
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');
  }

  static createAuthenticatedRequest(app: INestApplication, token?: string) {
    const req = request(app.getHttpServer());
    
    if (token) {
      return {
        get: (path: string) => req.get(path).set('Authorization', `Bearer ${token}`),
        post: (path: string) => req.post(path).set('Authorization', `Bearer ${token}`),
        put: (path: string) => req.put(path).set('Authorization', `Bearer ${token}`),
        delete: (path: string) => req.delete(path).set('Authorization', `Bearer ${token}`),
        patch: (path: string) => req.patch(path).set('Authorization', `Bearer ${token}`),
      };
    }
    
    return req;
  }

  static async createTestUser(app: INestApplication) {
    const userData = {
      email: 'test@example.com',
      password: 'testPassword123',
      firstName: 'Test',
      lastName: 'User',
    };

    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    return {
      user: response.body.user,
      token: response.body.accessToken,
    };
  }

  static async loginUser(app: INestApplication, email: string, password: string) {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    return {
      user: response.body.user,
      token: response.body.accessToken,
    };
  }

  static createTestSopProject() {
    return {
      name: 'Test SOP Project',
      description: 'A test SOP project for integration testing',
      metadata: {
        category: 'testing',
        priority: 'high',
      },
    };
  }

  static createTestSopStep(projectId: string) {
    return {
      projectId,
      name: 'Test SOP Step',
      description: 'A test step for SOP integration testing',
      stepType: 'action',
      configuration: {
        action: 'test_action',
        parameters: {
          testParam: 'testValue',
        },
      },
      position: 1,
    };
  }

  static async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = 10000,
    interval: number = 100
  ): Promise<void> {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }
}

// Setup and teardown for integration tests
beforeAll(async () => {
  // Only setup if we're running integration tests
  if (process.env.JEST_PROJECT_NAME === 'integration') {
    try {
      testDataSource = await IntegrationTestUtils.setupDatabase();
    } catch (error) {
      console.warn('Integration test database not available:', error.message);
      console.warn('Skipping database-dependent integration tests');
    }
  }
});

afterAll(async () => {
  if (testApp) {
    await testApp.close();
  }
  if (testDataSource?.isInitialized) {
    await testDataSource.destroy();
  }
});

beforeEach(async () => {
  if (testDataSource?.isInitialized) {
    await IntegrationTestUtils.cleanDatabase(testDataSource);
  }
});

export { testApp, testDataSource };