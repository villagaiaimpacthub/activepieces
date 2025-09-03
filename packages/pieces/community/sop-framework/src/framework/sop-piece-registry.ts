/**
 * SOP Piece Registry - Registration and discovery system for SOP pieces
 * 
 * This class manages the registration, discovery, and lifecycle of SOP pieces,
 * providing a centralized registry for all SOP workflow components.
 */

import { BaseSoPiece } from './base-sop-piece';
import { SOPPieceType, SOPPieceCategory, SOPMetadata } from '../types/sop-types';
import { nanoid } from 'nanoid';

/**
 * SOP Piece Registration Info
 */
export interface SOPPieceRegistration {
    id: string;
    name: string;
    displayName: string;
    description: string;
    version: string;
    pieceType: SOPPieceType;
    category: SOPPieceCategory;
    tags: string[];
    metadata: SOPMetadata;
    instance: BaseSoPiece;
    registeredAt: string;
    registeredBy: string;
    enabled: boolean;
    dependencies: string[];
    integrationPoints: string[];
    logoUrl?: string;
    documentationUrl?: string;
    supportUrl?: string;
}

/**
 * SOP Piece Query Interface
 */
export interface SOPPieceQuery {
    name?: string;
    pieceType?: SOPPieceType;
    category?: SOPPieceCategory;
    tags?: string[];
    enabled?: boolean;
    searchText?: string;
}

/**
 * SOP Piece Registry Manager
 */
export class SOPPieceRegistry {
    private static instance: SOPPieceRegistry;
    private pieces: Map<string, SOPPieceRegistration> = new Map();
    private nameIndex: Map<string, string> = new Map();
    private typeIndex: Map<SOPPieceType, Set<string>> = new Map();
    private categoryIndex: Map<SOPPieceCategory, Set<string>> = new Map();
    private tagIndex: Map<string, Set<string>> = new Map();
    private eventListeners: Map<string, Array<(event: any) => void>> = new Map();

    private constructor() {
        this.initializeIndices();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): SOPPieceRegistry {
        if (!SOPPieceRegistry.instance) {
            SOPPieceRegistry.instance = new SOPPieceRegistry();
        }
        return SOPPieceRegistry.instance;
    }

    /**
     * Initialize search indices
     */
    private initializeIndices(): void {
        // Initialize type index
        Object.values(SOPPieceType).forEach(type => {
            this.typeIndex.set(type, new Set());
        });

        // Initialize category index
        Object.values(SOPPieceCategory).forEach(category => {
            this.categoryIndex.set(category, new Set());
        });
    }

    /**
     * Register a SOP piece
     */
    public register(piece: BaseSoPiece, options: {
        name: string;
        registeredBy: string;
        enabled?: boolean;
        dependencies?: string[];
        integrationPoints?: string[];
        logoUrl?: string;
        documentationUrl?: string;
        supportUrl?: string;
    }): string {
        const id = nanoid();
        const pieceConfig = piece.getPieceConfiguration();
        const now = new Date().toISOString();

        const registration: SOPPieceRegistration = {
            id,
            name: options.name,
            displayName: pieceConfig.displayName,
            description: pieceConfig.description,
            version: pieceConfig.version || '1.0.0',
            pieceType: pieceConfig.sopPieceType,
            category: pieceConfig.sopCategory,
            tags: pieceConfig.tags || [],
            metadata: pieceConfig.metadata,
            instance: piece,
            registeredAt: now,
            registeredBy: options.registeredBy,
            enabled: options.enabled !== false,
            dependencies: options.dependencies || [],
            integrationPoints: options.integrationPoints || [],
            logoUrl: options.logoUrl,
            documentationUrl: options.documentationUrl,
            supportUrl: options.supportUrl
        };

        // Check for name conflicts
        if (this.nameIndex.has(options.name)) {
            throw new Error(`SOP piece with name '${options.name}' is already registered`);
        }

        // Store registration
        this.pieces.set(id, registration);
        this.nameIndex.set(options.name, id);

        // Update indices
        this.updateIndices(id, registration);

        // Emit registration event
        this.emitEvent('piece_registered', {
            id,
            name: options.name,
            pieceType: registration.pieceType,
            category: registration.category,
            registeredBy: options.registeredBy,
            timestamp: now
        });

        console.log(`SOP piece '${options.name}' registered successfully with ID: ${id}`);
        return id;
    }

    /**
     * Unregister a SOP piece
     */
    public unregister(nameOrId: string): boolean {
        const id = this.nameIndex.has(nameOrId) ? this.nameIndex.get(nameOrId)! : nameOrId;
        const registration = this.pieces.get(id);

        if (!registration) {
            return false;
        }

        // Remove from main storage
        this.pieces.delete(id);
        this.nameIndex.delete(registration.name);

        // Remove from indices
        this.removeFromIndices(id, registration);

        // Emit unregistration event
        this.emitEvent('piece_unregistered', {
            id,
            name: registration.name,
            pieceType: registration.pieceType,
            category: registration.category,
            timestamp: new Date().toISOString()
        });

        console.log(`SOP piece '${registration.name}' unregistered successfully`);
        return true;
    }

    /**
     * Get piece by name or ID
     */
    public get(nameOrId: string): SOPPieceRegistration | null {
        const id = this.nameIndex.has(nameOrId) ? this.nameIndex.get(nameOrId)! : nameOrId;
        return this.pieces.get(id) || null;
    }

    /**
     * Get piece instance by name or ID
     */
    public getInstance(nameOrId: string): BaseSoPiece | null {
        const registration = this.get(nameOrId);
        return registration?.instance || null;
    }

    /**
     * List all registered pieces
     */
    public list(): SOPPieceRegistration[] {
        return Array.from(this.pieces.values());
    }

    /**
     * Find pieces by query
     */
    public find(query: SOPPieceQuery): SOPPieceRegistration[] {
        let results: Set<string> | null = null;

        // Apply name filter
        if (query.name) {
            const id = this.nameIndex.get(query.name);
            results = id ? new Set([id]) : new Set();
        }

        // Apply piece type filter
        if (query.pieceType) {
            const typeResults = this.typeIndex.get(query.pieceType) || new Set();
            results = results ? this.intersectSets(results, typeResults) : typeResults;
        }

        // Apply category filter
        if (query.category) {
            const categoryResults = this.categoryIndex.get(query.category) || new Set();
            results = results ? this.intersectSets(results, categoryResults) : categoryResults;
        }

        // Apply tags filter
        if (query.tags && query.tags.length > 0) {
            let tagResults = new Set<string>();
            query.tags.forEach(tag => {
                const tagPieces = this.tagIndex.get(tag) || new Set();
                tagPieces.forEach(id => tagResults.add(id));
            });
            results = results ? this.intersectSets(results, tagResults) : tagResults;
        }

        // If no specific filters, get all pieces
        if (results === null) {
            results = new Set(this.pieces.keys());
        }

        // Convert to registrations and apply remaining filters
        let pieces = Array.from(results)
            .map(id => this.pieces.get(id)!)
            .filter(piece => {
                // Apply enabled filter
                if (query.enabled !== undefined && piece.enabled !== query.enabled) {
                    return false;
                }
                return true;
            });

        // Apply search text filter
        if (query.searchText) {
            const searchLower = query.searchText.toLowerCase();
            pieces = pieces.filter(piece => {
                return piece.name.toLowerCase().includes(searchLower) ||
                       piece.displayName.toLowerCase().includes(searchLower) ||
                       piece.description.toLowerCase().includes(searchLower) ||
                       piece.tags.some(tag => tag.toLowerCase().includes(searchLower));
            });
        }

        return pieces.sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Get pieces by type
     */
    public getByType(pieceType: SOPPieceType): SOPPieceRegistration[] {
        return this.find({ pieceType });
    }

    /**
     * Get pieces by category
     */
    public getByCategory(category: SOPPieceCategory): SOPPieceRegistration[] {
        return this.find({ category });
    }

    /**
     * Get enabled pieces only
     */
    public getEnabled(): SOPPieceRegistration[] {
        return this.find({ enabled: true });
    }

    /**
     * Enable/disable a piece
     */
    public setEnabled(nameOrId: string, enabled: boolean): boolean {
        const registration = this.get(nameOrId);
        if (!registration) {
            return false;
        }

        registration.enabled = enabled;
        
        // Emit state change event
        this.emitEvent('piece_state_changed', {
            id: registration.id,
            name: registration.name,
            enabled,
            timestamp: new Date().toISOString()
        });

        return true;
    }

    /**
     * Get registry statistics
     */
    public getStatistics(): {
        totalPieces: number;
        enabledPieces: number;
        disabledPieces: number;
        piecesByType: Record<SOPPieceType, number>;
        piecesByCategory: Record<SOPPieceCategory, number>;
        mostUsedTags: Array<{ tag: string; count: number }>;
    } {
        const pieces = this.list();
        const enabled = pieces.filter(p => p.enabled);
        const disabled = pieces.filter(p => !p.enabled);

        // Count by type
        const piecesByType: Record<SOPPieceType, number> = {} as any;
        Object.values(SOPPieceType).forEach(type => {
            piecesByType[type] = pieces.filter(p => p.pieceType === type).length;
        });

        // Count by category
        const piecesByCategory: Record<SOPPieceCategory, number> = {} as any;
        Object.values(SOPPieceCategory).forEach(category => {
            piecesByCategory[category] = pieces.filter(p => p.category === category).length;
        });

        // Count tags
        const tagCounts: Record<string, number> = {};
        pieces.forEach(piece => {
            piece.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        const mostUsedTags = Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            totalPieces: pieces.length,
            enabledPieces: enabled.length,
            disabledPieces: disabled.length,
            piecesByType,
            piecesByCategory,
            mostUsedTags
        };
    }

    /**
     * Validate piece dependencies
     */
    public validateDependencies(nameOrId: string): {
        isValid: boolean;
        missingDependencies: string[];
        circularDependencies: string[];
    } {
        const registration = this.get(nameOrId);
        if (!registration) {
            return {
                isValid: false,
                missingDependencies: [],
                circularDependencies: []
            };
        }

        const missingDependencies: string[] = [];
        const circularDependencies: string[] = [];

        // Check for missing dependencies
        registration.dependencies.forEach(dep => {
            if (!this.nameIndex.has(dep)) {
                missingDependencies.push(dep);
            }
        });

        // Check for circular dependencies
        const visited = new Set<string>();
        const checkCircular = (pieceName: string, path: string[]): void => {
            if (path.includes(pieceName)) {
                circularDependencies.push(path.join(' -> ') + ' -> ' + pieceName);
                return;
            }
            
            if (visited.has(pieceName)) {
                return;
            }
            
            visited.add(pieceName);
            const pieceReg = this.get(pieceName);
            if (pieceReg) {
                pieceReg.dependencies.forEach(dep => {
                    checkCircular(dep, [...path, pieceName]);
                });
            }
        };

        checkCircular(registration.name, []);

        return {
            isValid: missingDependencies.length === 0 && circularDependencies.length === 0,
            missingDependencies,
            circularDependencies
        };
    }

    /**
     * Export registry data
     */
    public export(): {
        pieces: SOPPieceRegistration[];
        metadata: {
            exportedAt: string;
            totalPieces: number;
        };
    } {
        return {
            pieces: this.list(),
            metadata: {
                exportedAt: new Date().toISOString(),
                totalPieces: this.pieces.size
            }
        };
    }

    /**
     * Clear registry
     */
    public clear(): void {
        this.pieces.clear();
        this.nameIndex.clear();
        this.initializeIndices();
        
        this.emitEvent('registry_cleared', {
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Update search indices for a piece
     */
    private updateIndices(id: string, registration: SOPPieceRegistration): void {
        // Update type index
        this.typeIndex.get(registration.pieceType)?.add(id);

        // Update category index
        this.categoryIndex.get(registration.category)?.add(id);

        // Update tag index
        registration.tags.forEach(tag => {
            if (!this.tagIndex.has(tag)) {
                this.tagIndex.set(tag, new Set());
            }
            this.tagIndex.get(tag)!.add(id);
        });
    }

    /**
     * Remove from search indices
     */
    private removeFromIndices(id: string, registration: SOPPieceRegistration): void {
        // Remove from type index
        this.typeIndex.get(registration.pieceType)?.delete(id);

        // Remove from category index
        this.categoryIndex.get(registration.category)?.delete(id);

        // Remove from tag index
        registration.tags.forEach(tag => {
            this.tagIndex.get(tag)?.delete(id);
            if (this.tagIndex.get(tag)?.size === 0) {
                this.tagIndex.delete(tag);
            }
        });
    }

    /**
     * Intersect two sets
     */
    private intersectSets<T>(set1: Set<T>, set2: Set<T>): Set<T> {
        const result = new Set<T>();
        set1.forEach(item => {
            if (set2.has(item)) {
                result.add(item);
            }
        });
        return result;
    }

    /**
     * Add event listener
     */
    public addEventListener(eventType: string, listener: (event: any) => void): void {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType)!.push(listener);
    }

    /**
     * Remove event listener
     */
    public removeEventListener(eventType: string, listener: (event: any) => void): void {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emit event
     */
    private emitEvent(eventType: string, data: any): void {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener({ eventType, data, timestamp: new Date().toISOString() });
                } catch (error) {
                    console.error('Error in registry event listener:', error);
                }
            });
        }
    }
}