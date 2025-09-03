/**
 * SOP Workflow Context - Manages context and state for SOP workflow execution
 * 
 * This class provides context management capabilities for SOP workflows,
 * including state tracking, data persistence, and cross-step communication.
 */

import { SOPExecutionContext, SOPEventData, SOPExecutionState } from '../types/sop-types';
import { nanoid } from 'nanoid';

/**
 * SOP Context Data Interface
 */
export interface SOPContextData {
    workflowId: string;
    workflowName: string;
    currentStep: string;
    stepHistory: string[];
    globalVariables: Record<string, any>;
    stepVariables: Record<string, Record<string, any>>;
    sharedData: Record<string, any>;
    notifications: SOPNotification[];
    escalations: SOPEscalation[];
    approvals: SOPApproval[];
    timestamps: Record<string, string>;
    metadata: Record<string, any>;
}

/**
 * SOP Notification Interface
 */
export interface SOPNotification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    recipient: string;
    sentAt: string;
    readAt?: string;
    actionRequired?: boolean;
    actionUrl?: string;
}

/**
 * SOP Escalation Interface
 */
export interface SOPEscalation {
    id: string;
    stepId: string;
    reason: string;
    escalatedTo: string;
    escalatedBy: string;
    escalatedAt: string;
    resolved: boolean;
    resolvedAt?: string;
    resolution?: string;
}

/**
 * SOP Approval Interface
 */
export interface SOPApproval {
    id: string;
    stepId: string;
    approver: string;
    requestedAt: string;
    approvedAt?: string;
    rejectedAt?: string;
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    comments?: string;
    attachments?: string[];
}

/**
 * SOP Workflow Context Manager
 */
export class SOPWorkflowContext {
    private contextData: SOPContextData;
    private executionContext: SOPExecutionContext | null = null;
    private eventListeners: Map<string, Array<(event: SOPEventData) => void>> = new Map();

    constructor() {
        this.contextData = this.createEmptyContext();
    }

    /**
     * Create empty context data structure
     */
    private createEmptyContext(): SOPContextData {
        return {
            workflowId: nanoid(),
            workflowName: '',
            currentStep: '',
            stepHistory: [],
            globalVariables: {},
            stepVariables: {},
            sharedData: {},
            notifications: [],
            escalations: [],
            approvals: [],
            timestamps: {
                workflowStarted: new Date().toISOString()
            },
            metadata: {}
        };
    }

    /**
     * Initialize workflow context
     */
    public initialize(executionContext: SOPExecutionContext): void {
        this.executionContext = executionContext;
        this.contextData.workflowName = executionContext.sopMetadata.title;
        this.contextData.currentStep = executionContext.sopMetadata.sopId;
        this.contextData.globalVariables = { ...executionContext.variables };
        this.contextData.timestamps.initialized = new Date().toISOString();
        
        // Emit initialization event
        this.emitEvent({
            eventId: nanoid(),
            eventType: 'workflow_initialized',
            timestamp: new Date().toISOString(),
            sopId: executionContext.sopMetadata.sopId,
            executionId: executionContext.executionId,
            userId: executionContext.executedBy,
            data: {
                workflowId: this.contextData.workflowId,
                workflowName: this.contextData.workflowName
            }
        });
    }

    /**
     * Update workflow state
     */
    public updateState(executionContext: SOPExecutionContext): void {
        if (!this.executionContext) {
            throw new Error('Workflow context not initialized');
        }

        this.executionContext = executionContext;
        this.contextData.currentStep = executionContext.sopMetadata.sopId;
        this.contextData.stepHistory.push(executionContext.sopMetadata.sopId);
        this.contextData.timestamps.lastUpdated = new Date().toISOString();
        
        // Merge variables
        Object.assign(this.contextData.globalVariables, executionContext.variables);
        
        // Emit state update event
        this.emitEvent({
            eventId: nanoid(),
            eventType: 'workflow_state_updated',
            timestamp: new Date().toISOString(),
            sopId: executionContext.sopMetadata.sopId,
            executionId: executionContext.executionId,
            userId: executionContext.executedBy,
            data: {
                currentState: executionContext.currentState,
                currentStep: this.contextData.currentStep
            }
        });
    }

    /**
     * Set global variable
     */
    public setGlobalVariable(key: string, value: any): void {
        this.contextData.globalVariables[key] = value;
        this.contextData.timestamps.variableUpdated = new Date().toISOString();
        
        this.emitEvent({
            eventId: nanoid(),
            eventType: 'variable_updated',
            timestamp: new Date().toISOString(),
            sopId: this.executionContext?.sopMetadata.sopId || '',
            executionId: this.executionContext?.executionId,
            userId: this.executionContext?.executedBy || 'system',
            data: {
                variableType: 'global',
                key,
                value
            }
        });
    }

    /**
     * Get global variable
     */
    public getGlobalVariable(key: string): any {
        return this.contextData.globalVariables[key];
    }

    /**
     * Set step-specific variable
     */
    public setStepVariable(stepId: string, key: string, value: any): void {
        if (!this.contextData.stepVariables[stepId]) {
            this.contextData.stepVariables[stepId] = {};
        }
        this.contextData.stepVariables[stepId][key] = value;
        this.contextData.timestamps.variableUpdated = new Date().toISOString();
        
        this.emitEvent({
            eventId: nanoid(),
            eventType: 'variable_updated',
            timestamp: new Date().toISOString(),
            sopId: this.executionContext?.sopMetadata.sopId || '',
            executionId: this.executionContext?.executionId,
            userId: this.executionContext?.executedBy || 'system',
            data: {
                variableType: 'step',
                stepId,
                key,
                value
            }
        });
    }

    /**
     * Get step-specific variable
     */
    public getStepVariable(stepId: string, key: string): any {
        return this.contextData.stepVariables[stepId]?.[key];
    }

    /**
     * Set shared data
     */
    public setSharedData(key: string, value: any): void {
        this.contextData.sharedData[key] = value;
        this.contextData.timestamps.sharedDataUpdated = new Date().toISOString();
        
        this.emitEvent({
            eventId: nanoid(),
            eventType: 'shared_data_updated',
            timestamp: new Date().toISOString(),
            sopId: this.executionContext?.sopMetadata.sopId || '',
            executionId: this.executionContext?.executionId,
            userId: this.executionContext?.executedBy || 'system',
            data: {
                key,
                value
            }
        });
    }

    /**
     * Get shared data
     */
    public getSharedData(key: string): any {
        return this.contextData.sharedData[key];
    }

    /**
     * Add notification
     */
    public addNotification(notification: Omit<SOPNotification, 'id' | 'sentAt'>): void {
        const fullNotification: SOPNotification = {
            ...notification,
            id: nanoid(),
            sentAt: new Date().toISOString()
        };
        
        this.contextData.notifications.push(fullNotification);
        
        this.emitEvent({
            eventId: nanoid(),
            eventType: 'notification_added',
            timestamp: new Date().toISOString(),
            sopId: this.executionContext?.sopMetadata.sopId || '',
            executionId: this.executionContext?.executionId,
            userId: this.executionContext?.executedBy || 'system',
            data: fullNotification
        });
    }

    /**
     * Add escalation
     */
    public addEscalation(escalation: Omit<SOPEscalation, 'id' | 'escalatedAt' | 'resolved'>): void {
        const fullEscalation: SOPEscalation = {
            ...escalation,
            id: nanoid(),
            escalatedAt: new Date().toISOString(),
            resolved: false
        };
        
        this.contextData.escalations.push(fullEscalation);
        
        this.emitEvent({
            eventId: nanoid(),
            eventType: 'escalation_created',
            timestamp: new Date().toISOString(),
            sopId: this.executionContext?.sopMetadata.sopId || '',
            executionId: this.executionContext?.executionId,
            userId: this.executionContext?.executedBy || 'system',
            data: fullEscalation
        });
    }

    /**
     * Add approval request
     */
    public addApprovalRequest(approval: Omit<SOPApproval, 'id' | 'requestedAt' | 'status'>): void {
        const fullApproval: SOPApproval = {
            ...approval,
            id: nanoid(),
            requestedAt: new Date().toISOString(),
            status: 'pending'
        };
        
        this.contextData.approvals.push(fullApproval);
        
        this.emitEvent({
            eventId: nanoid(),
            eventType: 'approval_requested',
            timestamp: new Date().toISOString(),
            sopId: this.executionContext?.sopMetadata.sopId || '',
            executionId: this.executionContext?.executionId,
            userId: this.executionContext?.executedBy || 'system',
            data: fullApproval
        });
    }

    /**
     * Get current context data
     */
    public getContextData(): SOPContextData {
        return { ...this.contextData };
    }

    /**
     * Get current execution context
     */
    public getExecutionContext(): SOPExecutionContext | null {
        return this.executionContext;
    }

    /**
     * Get workflow status summary
     */
    public getWorkflowStatus(): {
        workflowId: string;
        currentStep: string;
        state: SOPExecutionState;
        stepCount: number;
        pendingApprovals: number;
        activeEscalations: number;
        unreadNotifications: number;
    } {
        return {
            workflowId: this.contextData.workflowId,
            currentStep: this.contextData.currentStep,
            state: this.executionContext?.currentState || SOPExecutionState.PENDING,
            stepCount: this.contextData.stepHistory.length,
            pendingApprovals: this.contextData.approvals.filter(a => a.status === 'pending').length,
            activeEscalations: this.contextData.escalations.filter(e => !e.resolved).length,
            unreadNotifications: this.contextData.notifications.filter(n => !n.readAt).length
        };
    }

    /**
     * Export context data for persistence
     */
    public export(): {
        contextData: SOPContextData;
        executionContext: SOPExecutionContext | null;
    } {
        return {
            contextData: this.contextData,
            executionContext: this.executionContext
        };
    }

    /**
     * Import context data from persistence
     */
    public import(data: {
        contextData: SOPContextData;
        executionContext: SOPExecutionContext | null;
    }): void {
        this.contextData = data.contextData;
        this.executionContext = data.executionContext;
    }

    /**
     * Register event listener
     */
    public addEventListener(eventType: string, listener: (event: SOPEventData) => void): void {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType)!.push(listener);
    }

    /**
     * Remove event listener
     */
    public removeEventListener(eventType: string, listener: (event: SOPEventData) => void): void {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emit event to listeners
     */
    private emitEvent(event: SOPEventData): void {
        const listeners = this.eventListeners.get(event.eventType);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(event);
                } catch (error) {
                    console.error('Error in event listener:', error);
                }
            });
        }
        
        // Also emit to 'all' listeners
        const allListeners = this.eventListeners.get('all');
        if (allListeners) {
            allListeners.forEach(listener => {
                try {
                    listener(event);
                } catch (error) {
                    console.error('Error in event listener:', error);
                }
            });
        }
    }

    /**
     * Clear context data
     */
    public clear(): void {
        this.contextData = this.createEmptyContext();
        this.executionContext = null;
        this.eventListeners.clear();
    }
}