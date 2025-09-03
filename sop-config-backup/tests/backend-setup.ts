// Backend-specific test setup
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { config } from 'dotenv';

// Load test environment
config({ path: '.env.test' });

// Test database configuration
export const testDbConfig = {
  type: 'sqlite' as const,
  database: ':memory:',
  entities: ['src/backend/database/entities/*.ts'],
  synchronize: true,
  logging: false,
};

// Global test data source
let globalDataSource: DataSource;

// Setup test database before all tests
beforeAll(async () => {
  globalDataSource = new DataSource(testDbConfig);
  await globalDataSource.initialize();
});

// Cleanup after all tests
afterAll(async () => {
  if (globalDataSource?.isInitialized) {
    await globalDataSource.destroy();
  }
});

// Clean database before each test
beforeEach(async () => {
  if (globalDataSource?.isInitialized) {
    const entities = globalDataSource.entityMetadatas;
    
    for (const entity of entities) {
      const repository = globalDataSource.getRepository(entity.name);
      await repository.clear();
    }
  }
});

// Test utilities for backend
export class TestUtils {
  static async createTestingModule(
    providers: any[] = [],
    imports: any[] = []
  ): Promise<TestingModule> {
    const moduleBuilder = Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDbConfig),
        ...imports,
      ],
      providers: [
        ...providers,
      ],
    });

    return moduleBuilder.compile();
  }

  static mockRepository<T = any>(): Partial<Repository<T>> {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getOne: jest.fn(),
        getManyAndCount: jest.fn(),
      })),
    };
  }

  static mockService<T = any>(methods: Partial<T> = {}): T {
    const mockMethods: any = {};
    
    // Create jest mocks for all provided methods
    Object.keys(methods).forEach(key => {
      mockMethods[key] = jest.fn().mockReturnValue(methods[key as keyof T]);
    });

    return mockMethods;
  }

  static createMockRequest(overrides: any = {}) {
    return {
      user: { id: 'test-user-id', email: 'test@example.com' },
      body: {},
      query: {},
      params: {},
      headers: { 'user-agent': 'test' },
      ip: '127.0.0.1',
      ...overrides,
    };
  }

  static createMockResponse() {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    return res;
  }
}

// Export data source for use in tests
export { globalDataSource as testDataSource };