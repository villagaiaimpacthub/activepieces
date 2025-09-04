/**
 * Compliance Triggers
 * 
 * Trigger definitions for compliance-related events including violation detection,
 * risk threshold breaches, audit schedule events, remediation deadlines,
 * certificate expiration, and monitoring alerts.
 */

import { createTrigger, TriggerStrategy, Property } from '@activepieces/pieces-framework';
import {
    ComplianceFramework,
    ComplianceStatus,
    RiskSeverity,
    ComplianceFinding,
    RemediationItem,
    ComplianceResult,
    OperationalMetric,
    ComplianceCertificate,
    EvidenceItem
} from '../common/compliance-types';

/**
 * Compliance Violation Detected Trigger
 * Fires when a compliance violation is detected during assessment
 */
export const complianceViolationTrigger = createTrigger({
    name: 'compliance_violation_detected',
    displayName: 'Compliance Violation Detected',
    description: 'Triggered when a compliance violation is detected during assessment or monitoring',
    
    props: {
        framework: Property.MultiSelectDropdown({
            displayName: 'Compliance Framework',
            description: 'Filter violations by specific compliance frameworks',
            required: false,
            options: {
                options: [
                    { label: 'GDPR', value: ComplianceFramework.GDPR },
                    { label: 'HIPAA', value: ComplianceFramework.HIPAA },
                    { label: 'SOX', value: ComplianceFramework.SOX },
                    { label: 'PCI DSS', value: ComplianceFramework.PCI_DSS },
                    { label: 'ISO 27001', value: ComplianceFramework.ISO_27001 },
                    { label: 'CCPA', value: ComplianceFramework.CCPA },
                    { label: 'NIST', value: ComplianceFramework.NIST }
                ]
            }
        }),
        
        minimumSeverity: Property.StaticDropdown({
            displayName: 'Minimum Severity',
            description: 'Only trigger for violations at or above this severity level',
            required: false,
            defaultValue: RiskSeverity.MEDIUM,
            options: {
                options: [
                    { label: 'Informational', value: RiskSeverity.INFORMATIONAL },
                    { label: 'Low', value: RiskSeverity.LOW },
                    { label: 'Medium', value: RiskSeverity.MEDIUM },
                    { label: 'High', value: RiskSeverity.HIGH },
                    { label: 'Critical', value: RiskSeverity.CRITICAL }
                ]
            }
        }),
        
        rulePattern: Property.ShortText({
            displayName: 'Rule Pattern',
            description: 'Filter violations by rule ID pattern (regex supported)',
            required: false
        }),
        
        organizationScope: Property.Array({
            displayName: 'Organization Scope',
            description: 'Filter violations by organizational units or systems',
            required: false
        }),
        
        notificationThreshold: Property.Number({
            displayName: 'Notification Threshold',
            description: 'Number of violations before triggering (prevents spam)',
            required: false,
            defaultValue: 1
        })
    },
    
    type: TriggerStrategy.WEBHOOK,
    
    async run(context) {
        // In a real implementation, this would:
        // 1. Set up webhook endpoint for violation events
        // 2. Filter events based on configured criteria
        // 3. Return violation data when criteria are met
        
        return [
            {
                id: 'violation_001',
                timestamp: new Date().toISOString(),
                framework: ComplianceFramework.GDPR,
                severity: RiskSeverity.HIGH,
                ruleId: 'GDPR_001',
                ruleName: 'Data Subject Rights',
                violationType: 'CONTROL_FAILURE',
                description: 'Data subject request not processed within required timeframe',
                affectedSystems: ['customer-portal', 'data-warehouse'],
                evidence: ['audit_log_001.json', 'incident_report_001.pdf'],
                businessImpact: 'HIGH',
                riskScore: 85,
                requiresImmediateAction: true,
                metadata: {
                    detectedBy: 'automated_scan',
                    detectionTime: new Date().toISOString(),
                    lastCompliantCheck: '2024-01-15T10:00:00Z',
                    escalationLevel: 1,
                    assignedTo: 'compliance-team'
                }
            }
        ];
    }
});

/**
 * Risk Threshold Exceeded Trigger
 * Fires when compliance risk score exceeds configured threshold
 */
export const riskThresholdExceededTrigger = createTrigger({
    name: 'risk_threshold_exceeded',
    displayName: 'Risk Threshold Exceeded',
    description: 'Triggered when compliance risk score exceeds the configured threshold',
    
    props: {
        riskThreshold: Property.Number({
            displayName: 'Risk Threshold',
            description: 'Risk score threshold (0-100) that triggers the alert',
            required: true,
            defaultValue: 75
        }),
        
        framework: Property.MultiSelectDropdown({
            displayName: 'Compliance Framework',
            description: 'Monitor risk for specific compliance frameworks',
            required: false,
            options: {
                options: [
                    { label: 'GDPR', value: ComplianceFramework.GDPR },
                    { label: 'HIPAA', value: ComplianceFramework.HIPAA },
                    { label: 'SOX', value: ComplianceFramework.SOX },
                    { label: 'PCI DSS', value: ComplianceFramework.PCI_DSS },
                    { label: 'ISO 27001', value: ComplianceFramework.ISO_27001 }
                ]
            }
        }),
        
        evaluationPeriod: Property.StaticDropdown({
            displayName: 'Evaluation Period',
            description: 'Time window for risk assessment',
            required: false,
            defaultValue: 'DAILY',
            options: {
                options: [
                    { label: 'Real-time', value: 'REALTIME' },
                    { label: 'Hourly', value: 'HOURLY' },
                    { label: 'Daily', value: 'DAILY' },
                    { label: 'Weekly', value: 'WEEKLY' }
                ]
            }
        }),
        
        includeTrend: Property.Checkbox({
            displayName: 'Include Trend Analysis',
            description: 'Include risk trend information in trigger data',
            required: false,
            defaultValue: true
        })
    },
    
    type: TriggerStrategy.WEBHOOK,
    
    async run(context) {
        return [
            {
                id: 'risk_alert_001',
                timestamp: new Date().toISOString(),
                currentRiskScore: 82,
                thresholdExceeded: 75,
                framework: ComplianceFramework.PCI_DSS,
                riskCategory: 'DATA_SECURITY',
                topRiskFactors: [
                    {
                        factor: 'Unencrypted data transmission',
                        contribution: 35,
                        severity: RiskSeverity.HIGH
                    },
                    {
                        factor: 'Weak access controls',
                        contribution: 25,
                        severity: RiskSeverity.MEDIUM
                    },
                    {
                        factor: 'Missing security patches',
                        contribution: 22,
                        severity: RiskSeverity.HIGH
                    }
                ],
                trend: {
                    direction: 'INCREASING',
                    previousScore: 68,
                    changePercentage: 20.5,
                    trendPeriod: '7_DAYS'
                },
                recommendedActions: [
                    'Implement end-to-end encryption',
                    'Review and strengthen access controls',
                    'Apply critical security patches immediately'
                ],
                affectedAssets: ['payment-gateway', 'customer-database', 'api-server'],
                estimatedImpact: {
                    business: 'HIGH',
                    financial: 'MEDIUM',
                    regulatory: 'CRITICAL'
                }
            }
        ];
    }
});

/**
 * Audit Schedule Trigger
 * Fires based on scheduled audit activities and compliance reviews
 */
export const auditScheduleTrigger = createTrigger({
    name: 'audit_schedule_event',
    displayName: 'Audit Schedule Event',
    description: 'Triggered based on scheduled audit activities, compliance reviews, and assessment deadlines',
    
    props: {
        auditType: Property.MultiSelectDropdown({
            displayName: 'Audit Types',
            description: 'Types of audits to monitor',
            required: false,
            options: {
                options: [
                    { label: 'Internal Audit', value: 'INTERNAL' },
                    { label: 'External Audit', value: 'EXTERNAL' },
                    { label: 'Regulatory Review', value: 'REGULATORY' },
                    { label: 'Self-Assessment', value: 'SELF_ASSESSMENT' },
                    { label: 'Third-Party Assessment', value: 'THIRD_PARTY' },
                    { label: 'Certification Audit', value: 'CERTIFICATION' }
                ]
            }
        }),
        
        notificationPeriod: Property.StaticDropdown({
            displayName: 'Notification Period',
            description: 'How far in advance to trigger notifications',
            required: false,
            defaultValue: '7_DAYS',
            options: {
                options: [
                    { label: '1 Day', value: '1_DAY' },
                    { label: '3 Days', value: '3_DAYS' },
                    { label: '7 Days', value: '7_DAYS' },
                    { label: '14 Days', value: '14_DAYS' },
                    { label: '30 Days', value: '30_DAYS' }
                ]
            }
        }),
        
        framework: Property.MultiSelectDropdown({
            displayName: 'Compliance Framework',
            description: 'Audit schedule for specific frameworks',
            required: false,
            options: {
                options: [
                    { label: 'GDPR', value: ComplianceFramework.GDPR },
                    { label: 'HIPAA', value: ComplianceFramework.HIPAA },
                    { label: 'SOX', value: ComplianceFramework.SOX },
                    { label: 'ISO 27001', value: ComplianceFramework.ISO_27001 }
                ]
            }
        }),
        
        includePreparation: Property.Checkbox({
            displayName: 'Include Preparation Tasks',
            description: 'Include audit preparation task reminders',
            required: false,
            defaultValue: true
        })
    },
    
    type: TriggerStrategy.WEBHOOK,
    
    async run(context) {
        return [
            {
                id: 'audit_event_001',
                timestamp: new Date().toISOString(),
                eventType: 'AUDIT_SCHEDULED',
                auditType: 'EXTERNAL',
                auditName: 'Annual SOX Compliance Audit',
                framework: ComplianceFramework.SOX,
                scheduledDate: '2024-03-15T09:00:00Z',
                daysUntilAudit: 7,
                auditor: {
                    name: 'External Audit Firm LLC',
                    contact: 'audit@externalfirm.com',
                    leadAuditor: 'John Smith, CPA'
                },
                scope: [
                    'Financial reporting controls',
                    'IT general controls',
                    'Entity-level controls',
                    'Process-level controls'
                ],
                preparationTasks: [
                    {
                        id: 'prep_001',
                        task: 'Gather evidence documentation',
                        assignedTo: 'compliance-team',
                        dueDate: '2024-03-10T17:00:00Z',
                        status: 'PENDING',
                        priority: 'HIGH'
                    },
                    {
                        id: 'prep_002',
                        task: 'Review control testing results',
                        assignedTo: 'internal-audit',
                        dueDate: '2024-03-12T17:00:00Z',
                        status: 'IN_PROGRESS',
                        priority: 'HIGH'
                    },
                    {
                        id: 'prep_003',
                        task: 'Prepare management assertions',
                        assignedTo: 'management',
                        dueDate: '2024-03-13T17:00:00Z',
                        status: 'NOT_STARTED',
                        priority: 'MEDIUM'
                    }
                ],
                expectedDuration: '2_WEEKS',
                deliverables: [
                    'Management letter',
                    'SOX compliance opinion',
                    'Deficiency report',
                    'Recommendations letter'
                ],
                lastAuditDate: '2023-03-15T09:00:00Z',
                lastAuditResult: 'QUALIFIED_OPINION'
            }
        ];
    }
});

/**
 * Remediation Deadline Trigger
 * Fires when remediation items are approaching or have passed their deadlines
 */
export const remediationDeadlineTrigger = createTrigger({
    name: 'remediation_deadline',
    displayName: 'Remediation Deadline',
    description: 'Triggered when remediation items are approaching or have passed their deadlines',
    
    props: {
        warningPeriod: Property.StaticDropdown({
            displayName: 'Warning Period',
            description: 'How far in advance to warn about approaching deadlines',
            required: false,
            defaultValue: '3_DAYS',
            options: {
                options: [
                    { label: '1 Day', value: '1_DAY' },
                    { label: '3 Days', value: '3_DAYS' },
                    { label: '7 Days', value: '7_DAYS' },
                    { label: '14 Days', value: '14_DAYS' }
                ]
            }
        }),
        
        minimumPriority: Property.StaticDropdown({
            displayName: 'Minimum Priority',
            description: 'Only trigger for remediation items at or above this priority',
            required: false,
            defaultValue: RemediationPriority.MEDIUM,
            options: {
                options: [
                    { label: 'Low', value: RemediationPriority.LOW },
                    { label: 'Medium', value: RemediationPriority.MEDIUM },
                    { label: 'High', value: RemediationPriority.HIGH },
                    { label: 'Immediate', value: RemediationPriority.IMMEDIATE }
                ]
            }
        }),
        
        includeOverdue: Property.Checkbox({
            displayName: 'Include Overdue Items',
            description: 'Also trigger for items that are already overdue',
            required: false,
            defaultValue: true
        }),
        
        assigneeFilter: Property.Array({
            displayName: 'Assignee Filter',
            description: 'Only trigger for items assigned to specific users/teams',
            required: false
        })
    },
    
    type: TriggerStrategy.WEBHOOK,
    
    async run(context) {
        return [
            {
                id: 'remediation_deadline_001',
                timestamp: new Date().toISOString(),
                eventType: 'DEADLINE_APPROACHING',
                remediationItem: {
                    id: 'remediation_001',
                    title: 'Implement Data Encryption',
                    description: 'Encrypt sensitive data at rest and in transit',
                    priority: RemediationPriority.HIGH,
                    assignedTo: 'security-team',
                    dueDate: '2024-02-20T17:00:00Z',
                    status: 'IN_PROGRESS',
                    framework: ComplianceFramework.GDPR,
                    relatedRules: ['GDPR_032', 'GDPR_025'],
                    estimatedEffort: 40,
                    actualEffort: 24,
                    progressPercentage: 60,
                    verificationRequired: true
                },
                daysUntilDeadline: 3,
                isOverdue: false,
                escalationLevel: 1,
                dependencies: [
                    {
                        id: 'dep_001',
                        description: 'Hardware procurement',
                        status: 'COMPLETED'
                    },
                    {
                        id: 'dep_002',
                        description: 'Security policy approval',
                        status: 'PENDING'
                    }
                ],
                impactAnalysis: {
                    businessRisk: 'HIGH',
                    regulatoryRisk: 'CRITICAL',
                    potentialFines: 500000,
                    complianceScore: -15
                },
                recommendedActions: [
                    'Expedite security policy approval',
                    'Allocate additional resources',
                    'Consider phased implementation'
                ],
                escalationChain: [
                    'security-team-lead',
                    'compliance-officer',
                    'cto'
                ]
            }
        ];
    }
});

/**
 * Certificate Expiration Trigger
 * Fires when compliance certificates are approaching expiration
 */
export const certificateExpirationTrigger = createTrigger({
    name: 'certificate_expiration',
    displayName: 'Certificate Expiration',
    description: 'Triggered when compliance certificates are approaching their expiration dates',
    
    props: {
        warningPeriod: Property.StaticDropdown({
            displayName: 'Warning Period',
            description: 'How far in advance to warn about certificate expiration',
            required: false,
            defaultValue: '90_DAYS',
            options: {
                options: [
                    { label: '30 Days', value: '30_DAYS' },
                    { label: '60 Days', value: '60_DAYS' },
                    { label: '90 Days', value: '90_DAYS' },
                    { label: '180 Days', value: '180_DAYS' },
                    { label: '1 Year', value: '1_YEAR' }
                ]
            }
        }),
        
        certificateTypes: Property.MultiSelectDropdown({
            displayName: 'Certificate Types',
            description: 'Types of certificates to monitor',
            required: false,
            options: {
                options: [
                    { label: 'SOC 2', value: 'SOC2' },
                    { label: 'ISO 27001', value: 'ISO27001' },
                    { label: 'PCI DSS', value: 'PCI_DSS' },
                    { label: 'HIPAA', value: 'HIPAA' },
                    { label: 'FedRAMP', value: 'FEDRAMP' },
                    { label: 'CSA STAR', value: 'CSA_STAR' }
                ]
            }
        }),
        
        framework: Property.MultiSelectDropdown({
            displayName: 'Compliance Framework',
            description: 'Monitor certificates for specific frameworks',
            required: false,
            options: {
                options: [
                    { label: 'ISO 27001', value: ComplianceFramework.ISO_27001 },
                    { label: 'SOC 2', value: ComplianceFramework.SOC2 },
                    { label: 'PCI DSS', value: ComplianceFramework.PCI_DSS }
                ]
            }
        }),
        
        includeRenewalProcess: Property.Checkbox({
            displayName: 'Include Renewal Process',
            description: 'Include renewal process information in trigger data',
            required: false,
            defaultValue: true
        })
    },
    
    type: TriggerStrategy.WEBHOOK,
    
    async run(context) {
        return [
            {
                id: 'cert_expiry_001',
                timestamp: new Date().toISOString(),
                certificate: {
                    id: 'cert_iso27001_001',
                    framework: ComplianceFramework.ISO_27001,
                    certifiedEntity: 'Acme Corporation',
                    certificateNumber: 'ISO27001-2023-001',
                    issuedDate: '2023-01-15T00:00:00Z',
                    validFrom: '2023-01-15T00:00:00Z',
                    validUntil: '2024-01-15T00:00:00Z',
                    certificationLevel: 'COMPREHENSIVE',
                    issuedBy: 'Certification Authority Inc',
                    scope: [
                        'Information Security Management System',
                        'Cloud Infrastructure',
                        'Customer Data Processing'
                    ]
                },
                daysUntilExpiration: 75,
                expirationWarningLevel: 'MEDIUM',
                renewalProcess: {
                    estimatedDuration: '6_MONTHS',
                    keyMilestones: [
                        {
                            milestone: 'Initial assessment',
                            estimatedDate: '2023-07-15T00:00:00Z',
                            status: 'COMPLETED'
                        },
                        {
                            milestone: 'Gap analysis',
                            estimatedDate: '2023-08-15T00:00:00Z',
                            status: 'COMPLETED'
                        },
                        {
                            milestone: 'External audit',
                            estimatedDate: '2023-11-15T00:00:00Z',
                            status: 'SCHEDULED'
                        },
                        {
                            milestone: 'Certificate issuance',
                            estimatedDate: '2023-12-15T00:00:00Z',
                            status: 'PENDING'
                        }
                    ],
                    estimatedCost: 75000,
                    requiredResources: [
                        'Compliance team (200 hours)',
                        'IT team (150 hours)',
                        'External auditor fees',
                        'Documentation review'
                    ]
                },
                businessImpact: {
                    riskLevel: 'HIGH',
                    customerImpact: 'SIGNIFICANT',
                    contractualRequirements: [
                        'Enterprise customer contracts require ISO 27001',
                        'Government contracts mandate current certification'
                    ],
                    financialImpact: {
                        potentialLoss: 2000000,
                        contractsAtRisk: 15,
                        renewalInvestment: 75000
                    }
                },
                recommendedActions: [
                    'Begin renewal process immediately',
                    'Schedule gap analysis review',
                    'Notify key stakeholders',
                    'Update project timeline'
                ]
            }
        ];
    }
});

/**
 * Monitoring Alert Trigger
 * Fires when compliance monitoring detects anomalies or threshold breaches
 */
export const monitoringAlertTrigger = createTrigger({
    name: 'monitoring_alert',
    displayName: 'Monitoring Alert',
    description: 'Triggered when compliance monitoring detects anomalies, threshold breaches, or unusual patterns',
    
    props: {
        alertTypes: Property.MultiSelectDropdown({
            displayName: 'Alert Types',
            description: 'Types of monitoring alerts to trigger on',
            required: false,
            options: {
                options: [
                    { label: 'Threshold Breach', value: 'THRESHOLD_BREACH' },
                    { label: 'Anomaly Detection', value: 'ANOMALY' },
                    { label: 'System Failure', value: 'SYSTEM_FAILURE' },
                    { label: 'Policy Violation', value: 'POLICY_VIOLATION' },
                    { label: 'Data Quality Issue', value: 'DATA_QUALITY' },
                    { label: 'Access Violation', value: 'ACCESS_VIOLATION' }
                ]
            }
        }),
        
        severityFilter: Property.MultiSelectDropdown({
            displayName: 'Severity Filter',
            description: 'Only trigger for alerts at these severity levels',
            required: false,
            options: {
                options: [
                    { label: 'Critical', value: RiskSeverity.CRITICAL },
                    { label: 'High', value: RiskSeverity.HIGH },
                    { label: 'Medium', value: RiskSeverity.MEDIUM },
                    { label: 'Low', value: RiskSeverity.LOW },
                    { label: 'Informational', value: RiskSeverity.INFORMATIONAL }
                ]
            }
        }),
        
        monitoringScope: Property.Array({
            displayName: 'Monitoring Scope',
            description: 'Systems or processes to monitor for alerts',
            required: false
        }),
        
        alertFrequency: Property.StaticDropdown({
            displayName: 'Alert Frequency',
            description: 'How often to check for monitoring alerts',
            required: false,
            defaultValue: 'REAL_TIME',
            options: {
                options: [
                    { label: 'Real-time', value: 'REAL_TIME' },
                    { label: 'Every 5 minutes', value: '5_MINUTES' },
                    { label: 'Every 15 minutes', value: '15_MINUTES' },
                    { label: 'Hourly', value: 'HOURLY' },
                    { label: 'Daily', value: 'DAILY' }
                ]
            }
        })
    },
    
    type: TriggerStrategy.WEBHOOK,
    
    async run(context) {
        return [
            {
                id: 'monitoring_alert_001',
                timestamp: new Date().toISOString(),
                alertType: 'THRESHOLD_BREACH',
                severity: RiskSeverity.HIGH,
                title: 'Failed Login Attempts Exceeded Threshold',
                description: 'The number of failed login attempts has exceeded the configured threshold of 100 per hour',
                source: 'authentication-system',
                framework: ComplianceFramework.ISO_27001,
                metric: {
                    name: 'Failed Login Attempts',
                    currentValue: 247,
                    threshold: 100,
                    unit: 'attempts/hour',
                    previousValue: 45,
                    trend: 'INCREASING'
                },
                affectedSystems: [
                    'web-portal',
                    'mobile-app',
                    'api-gateway'
                ],
                detectionMethod: 'automated_threshold_monitoring',
                timeWindow: {
                    start: '2024-01-20T10:00:00Z',
                    end: '2024-01-20T11:00:00Z',
                    duration: '1_HOUR'
                },
                geographicDistribution: {
                    'US': 89,
                    'CN': 78,
                    'RU': 45,
                    'BR': 23,
                    'Other': 12
                },
                potentialCauses: [
                    'Brute force attack',
                    'Credential stuffing',
                    'System integration issue',
                    'User training needed'
                ],
                immediateActions: [
                    'Block suspicious IP addresses',
                    'Enable additional MFA requirements',
                    'Notify security team',
                    'Review access logs'
                ],
                complianceImpact: {
                    framework: ComplianceFramework.ISO_27001,
                    controlsAffected: ['A.9.4.2', 'A.12.4.1'],
                    riskLevel: 'HIGH',
                    reportingRequired: true
                },
                escalationRequired: true,
                escalationChain: [
                    'security-analyst',
                    'security-manager',
                    'ciso'
                ]
            }
        ];
    }
});

/**
 * Evidence Collection Alert Trigger
 * Fires when evidence collection fails or evidence quality issues are detected
 */
export const evidenceCollectionAlertTrigger = createTrigger({
    name: 'evidence_collection_alert',
    displayName: 'Evidence Collection Alert',
    description: 'Triggered when evidence collection fails, evidence quality issues are detected, or evidence retention requirements are at risk',
    
    props: {
        alertCategories: Property.MultiSelectDropdown({
            displayName: 'Alert Categories',
            description: 'Categories of evidence alerts to monitor',
            required: false,
            options: {
                options: [
                    { label: 'Collection Failure', value: 'COLLECTION_FAILURE' },
                    { label: 'Quality Issues', value: 'QUALITY_ISSUES' },
                    { label: 'Missing Evidence', value: 'MISSING_EVIDENCE' },
                    { label: 'Retention Violation', value: 'RETENTION_VIOLATION' },
                    { label: 'Access Issues', value: 'ACCESS_ISSUES' },
                    { label: 'Integrity Compromise', value: 'INTEGRITY_COMPROMISE' }
                ]
            }
        }),
        
        evidenceTypes: Property.MultiSelectDropdown({
            displayName: 'Evidence Types',
            description: 'Types of evidence to monitor for alerts',
            required: false,
            options: {
                options: [
                    { label: 'Documents', value: EvidenceType.DOCUMENT },
                    { label: 'Screenshots', value: EvidenceType.SCREENSHOT },
                    { label: 'Log Files', value: EvidenceType.LOG_FILE },
                    { label: 'Policies', value: EvidenceType.POLICY },
                    { label: 'Certificates', value: EvidenceType.CERTIFICATE },
                    { label: 'Audit Reports', value: EvidenceType.AUDIT_REPORT }
                ]
            }
        }),
        
        qualityThreshold: Property.Number({
            displayName: 'Quality Threshold',
            description: 'Minimum evidence quality score (0-100) before triggering alert',
            required: false,
            defaultValue: 70
        })
    },
    
    type: TriggerStrategy.WEBHOOK,
    
    async run(context) {
        return [
            {
                id: 'evidence_alert_001',
                timestamp: new Date().toISOString(),
                alertCategory: 'COLLECTION_FAILURE',
                severity: RiskSeverity.MEDIUM,
                title: 'Evidence Collection Failed',
                description: 'Automated evidence collection failed for multiple compliance rules',
                failedCollections: [
                    {
                        ruleId: 'GDPR_001',
                        evidenceType: EvidenceType.LOG_FILE,
                        failureReason: 'Source system unavailable',
                        lastSuccessfulCollection: '2024-01-18T10:00:00Z',
                        retryAttempts: 3
                    },
                    {
                        ruleId: 'HIPAA_015',
                        evidenceType: EvidenceType.AUDIT_REPORT,
                        failureReason: 'Authentication failed',
                        lastSuccessfulCollection: '2024-01-19T15:30:00Z',
                        retryAttempts: 2
                    }
                ],
                impactAnalysis: {
                    affectedRules: 15,
                    complianceGaps: 8,
                    auditReadinessImpact: 'MEDIUM',
                    regulatoryRisk: 'LOW_TO_MEDIUM'
                },
                qualityIssues: [
                    {
                        evidenceId: 'evidence_001',
                        qualityScore: 45,
                        issues: [
                            'Missing metadata',
                            'Poor image quality',
                            'Incomplete timestamp'
                        ]
                    }
                ],
                recommendedActions: [
                    'Check source system connectivity',
                    'Verify authentication credentials',
                    'Manual evidence collection for critical items',
                    'Review collection configuration'
                ],
                systemsAffected: [
                    'evidence-collector',
                    'audit-system',
                    'compliance-dashboard'
                ]
            }
        ];
    }
});

/**
 * Compliance Score Changed Trigger
 * Fires when overall compliance score changes significantly
 */
export const complianceScoreChangedTrigger = createTrigger({
    name: 'compliance_score_changed',
    displayName: 'Compliance Score Changed',
    description: 'Triggered when the overall compliance score changes significantly (increase or decrease)',
    
    props: {
        scoreChangeThreshold: Property.Number({
            displayName: 'Score Change Threshold',
            description: 'Minimum score change (percentage points) to trigger alert',
            required: false,
            defaultValue: 5
        }),
        
        framework: Property.MultiSelectDropdown({
            displayName: 'Compliance Framework',
            description: 'Monitor score changes for specific frameworks',
            required: false,
            options: {
                options: [
                    { label: 'GDPR', value: ComplianceFramework.GDPR },
                    { label: 'HIPAA', value: ComplianceFramework.HIPAA },
                    { label: 'SOX', value: ComplianceFramework.SOX },
                    { label: 'PCI DSS', value: ComplianceFramework.PCI_DSS },
                    { label: 'ISO 27001', value: ComplianceFramework.ISO_27001 }
                ]
            }
        }),
        
        evaluationPeriod: Property.StaticDropdown({
            displayName: 'Evaluation Period',
            description: 'Time period for score comparison',
            required: false,
            defaultValue: 'DAILY',
            options: {
                options: [
                    { label: 'Hourly', value: 'HOURLY' },
                    { label: 'Daily', value: 'DAILY' },
                    { label: 'Weekly', value: 'WEEKLY' },
                    { label: 'Monthly', value: 'MONTHLY' }
                ]
            }
        }),
        
        includeAnalysis: Property.Checkbox({
            displayName: 'Include Root Cause Analysis',
            description: 'Include analysis of what caused the score change',
            required: false,
            defaultValue: true
        })
    },
    
    type: TriggerStrategy.WEBHOOK,
    
    async run(context) {
        return [
            {
                id: 'score_change_001',
                timestamp: new Date().toISOString(),
                framework: ComplianceFramework.PCI_DSS,
                currentScore: 78,
                previousScore: 85,
                scoreChange: -7,
                changePercentage: -8.2,
                changeDirection: 'DECREASE',
                evaluationPeriod: 'DAILY',
                scoreTrend: {
                    '7_days_ago': 87,
                    '3_days_ago': 85,
                    '1_day_ago': 85,
                    'current': 78
                },
                impactedAreas: [
                    {
                        area: 'Data Security',
                        scoreChange: -12,
                        contribution: 60
                    },
                    {
                        area: 'Access Control',
                        scoreChange: -3,
                        contribution: 40
                    }
                ],
                rootCauses: [
                    {
                        cause: 'Failed security patch deployment',
                        impact: 'HIGH',
                        affectedControls: ['PCI_DSS_6.1', 'PCI_DSS_6.2'],
                        recommendedAction: 'Complete patch deployment immediately'
                    },
                    {
                        cause: 'Expired SSL certificates',
                        impact: 'MEDIUM',
                        affectedControls: ['PCI_DSS_4.1'],
                        recommendedAction: 'Renew and deploy certificates'
                    }
                ],
                businessImpact: {
                    riskLevel: 'MEDIUM',
                    customerImpact: 'LOW',
                    regulatoryRisk: 'MEDIUM',
                    financialImpact: 'MEDIUM'
                },
                recovery: {
                    estimatedTimeToRecover: '3_DAYS',
                    requiredActions: 4,
                    criticalPath: [
                        'Deploy security patches',
                        'Renew SSL certificates',
                        'Update firewall rules',
                        'Verify compliance controls'
                    ]
                }
            }
        ];
    }
});