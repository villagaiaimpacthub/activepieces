/**
 * SOP Helper Utilities
 */

import { nanoid } from 'nanoid';
import {
    SOPExecutionState,
    SOPPriority,
    SOPComplianceStatus,
    SOPMetadata,
    SOPExecutionContext
} from '../types/sop-types';
import {
    SOP_STATE_TRANSITIONS,
    SOP_PRIORITY_LEVELS,
    SOP_COMPLIANCE_HIERARCHY,
    SOP_REGEX
} from '../constants/sop-constants';

/**
 * Generate unique SOP ID
 */
export function generateSOPId(): string {
    return `sop-${nanoid()}`;
}

/**
 * Generate execution ID
 */
export function generateExecutionId(): string {
    return `exec-${nanoid()}`;
}

/**
 * Check if state transition is valid
 */
export function isValidStateTransition(currentState: SOPExecutionState, newState: SOPExecutionState): boolean {
    const allowedTransitions = SOP_STATE_TRANSITIONS[currentState];
    return allowedTransitions.includes(newState);
}

/**
 * Get next possible states for current state
 */
export function getNextPossibleStates(currentState: SOPExecutionState): SOPExecutionState[] {
    return SOP_STATE_TRANSITIONS[currentState] || [];
}

/**
 * Compare priority levels
 */
export function comparePriorities(priority1: SOPPriority, priority2: SOPPriority): number {
    return SOP_PRIORITY_LEVELS[priority1] - SOP_PRIORITY_LEVELS[priority2];
}

/**
 * Get highest priority from list
 */
export function getHighestPriority(priorities: SOPPriority[]): SOPPriority {
    return priorities.reduce((highest, current) => 
        comparePriorities(current, highest) > 0 ? current : highest
    );
}

/**
 * Compare compliance statuses
 */
export function compareComplianceStatus(status1: SOPComplianceStatus, status2: SOPComplianceStatus): number {
    return SOP_COMPLIANCE_HIERARCHY[status1] - SOP_COMPLIANCE_HIERARCHY[status2];
}

/**
 * Get worst compliance status from list
 */
export function getWorstComplianceStatus(statuses: SOPComplianceStatus[]): SOPComplianceStatus {
    return statuses.reduce((worst, current) => 
        compareComplianceStatus(current, worst) > 0 ? current : worst
    );
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

/**
 * Format file size in bytes to human readable string
 */
export function formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime()) as any;
    }

    if (obj instanceof Array) {
        return obj.map(item => deepClone(item)) as any;
    }

    if (typeof obj === 'object') {
        const cloned = {} as any;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }

    return obj;
}

/**
 * Merge objects deeply
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return deepMerge(target, ...sources);
}

/**
 * Check if value is an object
 */
function isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Sanitize string for safe use in HTML/JSON
 */
export function sanitizeString(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
    return SOP_REGEX.EMAIL.test(email);
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
    return SOP_REGEX.PHONE.test(phone);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
    return SOP_REGEX.URL.test(url);
}

/**
 * Validate SOP ID format
 */
export function isValidSOPId(id: string): boolean {
    return SOP_REGEX.SOP_ID.test(id);
}

/**
 * Validate version format
 */
export function isValidVersion(version: string): boolean {
    return SOP_REGEX.VERSION.test(version);
}

/**
 * Generate hash from string
 */
export function generateHash(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(16);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>): void => {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    maxDelay: number = 10000
): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            
            if (attempt === maxRetries) {
                throw lastError;
            }
            
            const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError!;
}

/**
 * Create timeout promise
 */
export function createTimeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
    });
}

/**
 * Execute with timeout
 */
export async function executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
): Promise<T> {
    return Promise.race([
        promise,
        createTimeoutPromise(timeoutMs)
    ]);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
}

/**
 * Check if array is empty or null
 */
export function isEmptyArray(arr: any[]): boolean {
    return !arr || arr.length === 0;
}

/**
 * Check if object is empty
 */
export function isEmptyObject(obj: object): boolean {
    return !obj || Object.keys(obj).length === 0;
}

/**
 * Get nested property value
 */
export function getNestedProperty(obj: any, path: string, defaultValue: any = undefined): any {
    if (!obj || !path) return defaultValue;
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
        if (current === null || current === undefined || !(key in current)) {
            return defaultValue;
        }
        current = current[key];
    }
    
    return current;
}

/**
 * Set nested property value
 */
export function setNestedProperty(obj: any, path: string, value: any): void {
    if (!obj || !path) return;
    
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    
    let current = obj;
    for (const key of keys) {
        if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    
    current[lastKey] = value;
}

/**
 * Remove nested property
 */
export function removeNestedProperty(obj: any, path: string): boolean {
    if (!obj || !path) return false;
    
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    
    let current = obj;
    for (const key of keys) {
        if (!(key in current)) {
            return false;
        }
        current = current[key];
    }
    
    if (lastKey in current) {
        delete current[lastKey];
        return true;
    }
    
    return false;
}

/**
 * Flatten object to dot notation
 */
export function flattenObject(obj: any, prefix: string = ''): Record<string, any> {
    const flattened: Record<string, any> = {};
    
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            
            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
                Object.assign(flattened, flattenObject(obj[key], newKey));
            } else {
                flattened[newKey] = obj[key];
            }
        }
    }
    
    return flattened;
}

/**
 * Unflatten object from dot notation
 */
export function unflattenObject(obj: Record<string, any>): any {
    const result: any = {};
    
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            setNestedProperty(result, key, obj[key]);
        }
    }
    
    return result;
}

/**
 * Create enum from array
 */
export function createEnum<T extends string>(values: T[]): Record<T, T> {
    return values.reduce((acc, value) => {
        acc[value] = value;
        return acc;
    }, {} as Record<T, T>);
}

/**
 * Check if value is in enum
 */
export function isInEnum<T>(enumObj: Record<string, T>, value: any): value is T {
    return Object.values(enumObj).includes(value);
}

/**
 * Convert string to camelCase
 */
export function toCamelCase(str: string): string {
    return str.toLowerCase().replace(/([-_\s]+)(\w)/g, (_, __, letter) => letter.toUpperCase());
}

/**
 * Convert string to PascalCase
 */
export function toPascalCase(str: string): string {
    const camelCase = toCamelCase(str);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[_\s]+/g, '-')
        .toLowerCase();
}

/**
 * Convert string to snake_case
 */
export function toSnakeCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[-\s]+/g, '_')
        .toLowerCase();
}

/**
 * Truncate string with ellipsis
 */
export function truncateString(str: string, maxLength: number, suffix: string = '...'): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Check if string is JSON
 */
export function isJsonString(str: string): boolean {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T = any>(str: string, defaultValue: T = null as T): T {
    try {
        return JSON.parse(str);
    } catch {
        return defaultValue;
    }
}

/**
 * Safe JSON stringify
 */
export function safeJsonStringify(obj: any, replacer?: (key: string, value: any) => any, space?: number): string {
    try {
        return JSON.stringify(obj, replacer, space);
    } catch (error) {
        return `{"error": "Failed to stringify: ${error.message}"}`;
    }
}