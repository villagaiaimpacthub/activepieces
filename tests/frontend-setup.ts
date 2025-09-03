// Frontend-specific test setup
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Initialize the Angular testing environment
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Mock window and browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Frontend test utilities
export class FrontendTestUtils {
  static mockHttpClient() {
    return {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
    };
  }

  static mockRouter() {
    return {
      navigate: jest.fn(),
      navigateByUrl: jest.fn(),
      url: '/test',
      events: {
        subscribe: jest.fn(),
      },
    };
  }

  static mockActivatedRoute(params: any = {}, queryParams: any = {}) {
    return {
      params: { subscribe: (fn: any) => fn(params) },
      queryParams: { subscribe: (fn: any) => fn(queryParams) },
      snapshot: {
        params,
        queryParams,
      },
    };
  }

  static mockMatDialog() {
    return {
      open: jest.fn(() => ({
        afterClosed: jest.fn(() => ({ subscribe: jest.fn() })),
        close: jest.fn(),
      })),
      closeAll: jest.fn(),
    };
  }

  static mockMatSnackBar() {
    return {
      open: jest.fn(() => ({
        onAction: jest.fn(() => ({ subscribe: jest.fn() })),
        dismiss: jest.fn(),
      })),
    };
  }

  static createMockFormBuilder() {
    return {
      group: jest.fn(() => ({
        get: jest.fn(),
        value: {},
        valid: true,
        invalid: false,
        errors: null,
        markAsTouched: jest.fn(),
        markAsUntouched: jest.fn(),
        setValue: jest.fn(),
        patchValue: jest.fn(),
        reset: jest.fn(),
      })),
      control: jest.fn(),
      array: jest.fn(),
    };
  }
}

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
});