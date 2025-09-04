/**
 * Compliance Piece Integration Examples
 * 
 * Comprehensive examples demonstrating how to integrate and use the
 * SOP Compliance piece in various scenarios including GDPR compliance,
 * risk assessment workflows, audit preparation, and continuous monitoring.
 */

import {
    ComplianceFramework,
    ComplianceProcessingMode,
    ComplianceConfiguration,
    ComplianceRule,
    RiskSeverity,
    ControlCategory,
    EvidenceType,
    RemediationPriority,
    ComplianceReportConfig
} from '../lib/common/compliance-types';

/**
 * Example 1: GDPR Compliance Assessment
 * 
 * This example shows how to configure and run a comprehensive GDPR
 * compliance assessment including data protection controls, privacy
 * by design requirements, and data subject rights management.
 */
export const gdprComplianceExample = {
    name: 'GDPR Compliance Assessment',
    description: 'Comprehensive GDPR compliance assessment for data protection',
    
    // Compliance configuration for GDPR
    complianceConfiguration: {
        id: 'gdpr_config_2024',
        name: 'GDPR Compliance Configuration 2024',
        description: 'Updated GDPR compliance configuration with latest requirements',
        version: '2.1.0',
        frameworks: [ComplianceFramework.GDPR],
        
        rules: [
            {
                id: 'GDPR_001',
                framework: ComplianceFramework.GDPR,
                category: ControlCategory.ADMINISTRATIVE,
                title: 'Data Protection Officer (DPO)',
                description: 'Designation and responsibilities of Data Protection Officer',
                requirement: 'Organizations must designate a DPO when processing personal data on a large scale',
                severity: RiskSeverity.HIGH,
                mandatory: true,
                automated: false,
                frequency: 'ANNUALLY',
                tags: ['dpo', 'governance'],
                evidenceRequired: [EvidenceType.POLICY, EvidenceType.DOCUMENT, EvidenceType.ATTESTATION],
                remediationGuidance: 'Designate qualified DPO and document responsibilities'
            },
            {
                id: 'GDPR_002',
                framework: ComplianceFramework.GDPR,
                category: ControlCategory.TECHNICAL,
                title: 'Data Encryption',
                description: 'Encryption of personal data at rest and in transit',
                requirement: 'Personal data must be encrypted using appropriate technical measures',
                severity: RiskSeverity.CRITICAL,
                mandatory: true,
                automated: true,
                frequency: 'CONTINUOUS',
                tags: ['encryption', 'technical-safeguards'],
                evidenceRequired: [EvidenceType.CONFIGURATION, EvidenceType.LOG_FILE],
                validationScript: 'check_encryption_status.py',
                remediationGuidance: 'Implement AES-256 encryption for data at rest and TLS 1.3 for data in transit'
            },
            {
                id: 'GDPR_003',
                framework: ComplianceFramework.GDPR,
                category: ControlCategory.ADMINISTRATIVE,
                title: 'Data Subject Rights',
                description: 'Mechanisms for data subjects to exercise their rights',
                requirement: 'Provide accessible means for data subjects to exercise rights (access, rectification, erasure, etc.)',
                severity: RiskSeverity.HIGH,
                mandatory: true,
                automated: false,
                frequency: 'MONTHLY',
                tags: ['data-subject-rights', 'privacy'],
                evidenceRequired: [EvidenceType.PROCEDURE, EvidenceType.SCREENSHOT, EvidenceType.LOG_FILE],
                remediationGuidance: 'Implement self-service portal and documented procedures for handling requests'
            },
            {
                id: 'GDPR_004',
                framework: ComplianceFramework.GDPR,
                category: ControlCategory.DETECTIVE,
                title: 'Data Breach Detection and Notification',
                description: 'Procedures for detecting and reporting data breaches',
                requirement: 'Detect breaches within 72 hours and notify authorities and data subjects as required',
                severity: RiskSeverity.CRITICAL,
                mandatory: true,
                automated: true,
                frequency: 'CONTINUOUS',
                tags: ['breach-detection', 'incident-response'],
                evidenceRequired: [EvidenceType.PROCEDURE, EvidenceType.LOG_FILE, EvidenceType.AUDIT_REPORT],
                validationScript: 'check_breach_detection.py',
                remediationGuidance: 'Implement automated breach detection and notification workflows'
            }
        ],
        
        // Risk assessment configuration
        riskAssessmentConfig: {
            methodology: 'HYBRID',
            likelihoodScale: {
                name: 'GDPR Likelihood Scale',
                levels: [
                    { value: 1, label: 'Remote', description: 'Highly unlikely to occur', criteria: ['Strong controls', 'No previous incidents'] },
                    { value: 2, label: 'Unlikely', description: 'Low probability of occurrence', criteria: ['Adequate controls', 'Rare incidents'] },
                    { value: 3, label: 'Possible', description: 'Moderate probability', criteria: ['Basic controls', 'Some incidents'] },
                    { value: 4, label: 'Likely', description: 'High probability', criteria: ['Weak controls', 'Regular incidents'] },
                    { value: 5, label: 'Almost Certain', description: 'Very high probability', criteria: ['No controls', 'Frequent incidents'] }
                ]
            },
            impactScale: {
                name: 'GDPR Impact Scale',
                levels: [
                    { value: 1, label: 'Minimal', description: 'Minor privacy impact', criteria: ['<100 individuals', 'Low sensitivity data'] },
                    { value: 2, label: 'Minor', description: 'Limited privacy impact', criteria: ['100-1000 individuals', 'Medium sensitivity'] },
                    { value: 3, label: 'Moderate', description: 'Significant privacy impact', criteria: ['1000-10000 individuals', 'Sensitive data'] },
                    { value: 4, label: 'Major', description: 'Severe privacy impact', criteria: ['10000+ individuals', 'Special categories'] },
                    { value: 5, label: 'Catastrophic', description: 'Extreme privacy impact', criteria: ['Widespread exposure', 'Critical systems'] }
                ]
            },
            toleranceThresholds: {
                low: 5,
                medium: 10,
                high: 15,
                critical: 20
            },
            reassessmentFrequency: 'QUARTERLY'
        },
        
        // Evidence collection configuration
        evidenceCollectionConfig: {
            autoCollection: true,
            collectionSchedule: '0 2 * * *', // Daily at 2 AM
            supportedTypes: [
                EvidenceType.POLICY,
                EvidenceType.PROCEDURE,
                EvidenceType.CONFIGURATION,
                EvidenceType.LOG_FILE,
                EvidenceType.SCREENSHOT,
                EvidenceType.ATTESTATION,
                EvidenceType.AUDIT_REPORT
            ],
            storageConfig: {
                provider: 'S3',
                encryption: true,
                compression: true,
                versioning: true,
                backupEnabled: true,
                credentials: {
                    region: 'eu-west-1',
                    bucket: 'gdpr-evidence-store'
                }
            },
            retentionPolicy: {
                defaultRetention: 2555, // 7 years
                typeSpecificRetention: {
                    [EvidenceType.AUDIT_REPORT]: 2555,
                    [EvidenceType.POLICY]: 1825, // 5 years
                    [EvidenceType.LOG_FILE]: 1095, // 3 years
                    [EvidenceType.SCREENSHOT]: 365, // 1 year
                    [EvidenceType.CONFIGURATION]: 1095,
                    [EvidenceType.DOCUMENT]: 1825,
                    [EvidenceType.PROCEDURE]: 1825,
                    [EvidenceType.ATTESTATION]: 1095,
                    [EvidenceType.CERTIFICATE]: 1095,
                    [EvidenceType.CODE_REVIEW]: 1095
                },
                archivalEnabled: true,
                archivalAfter: 365,
                legalHoldSupport: true
            },
            validationRules: [
                {
                    id: 'file_size_limit',
                    name: 'File Size Validation',
                    description: 'Limit evidence file size to 100MB',
                    type: 'SIZE',
                    condition: 'size <= 104857600',
                    action: 'REJECT',
                    enabled: true
                },
                {
                    id: 'file_type_validation',
                    name: 'File Type Validation',
                    description: 'Allow only approved file types',
                    type: 'FORMAT',
                    condition: 'extension in [pdf, docx, xlsx, png, jpg, json, log, xml]',
                    action: 'REJECT',
                    enabled: true
                }
            ]
        },
        
        // Monitoring configuration for continuous compliance
        monitoringConfig: {
            enabled: true,
            frequency: 'REAL_TIME',
            alertThresholds: {
                criticalFindings: 1,
                highRiskFindings: 2,
                nonComplianceRate: 5, // 5%
                overdueTasks: 3
            },
            notificationChannels: ['email', 'slack', 'webhook'],
            dashboardConfig: {
                enabled: true,
                widgets: [
                    {
                        id: 'compliance_score',
                        type: 'GAUGE',
                        title: 'GDPR Compliance Score',
                        position: { x: 0, y: 0, width: 4, height: 3 },
                        dataSource: 'compliance_metrics',
                        configuration: {
                            minValue: 0,
                            maxValue: 100,
                            thresholds: [
                                { value: 85, color: 'green' },
                                { value: 70, color: 'yellow' },
                                { value: 0, color: 'red' }
                            ]
                        }
                    },
                    {
                        id: 'findings_by_severity',
                        type: 'CHART',
                        title: 'Findings by Severity',
                        position: { x: 4, y: 0, width: 4, height: 3 },
                        dataSource: 'findings_data',
                        configuration: {
                            chartType: 'pie',
                            dataField: 'severity',
                            colors: {
                                'CRITICAL': '#ff4444',
                                'HIGH': '#ff8800',
                                'MEDIUM': '#ffdd00',
                                'LOW': '#88ff88'
                            }
                        }
                    }
                ],
                refreshInterval: 300,
                autoRefresh: true,
                allowExport: true,
                allowDrillDown: true
            }
        },
        
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z',
        createdBy: 'compliance_admin',
        effectiveDate: '2024-01-20T00:00:00Z',
        tags: ['gdpr', 'privacy', 'data-protection']
    } as ComplianceConfiguration,
    
    // Workflow properties for GDPR assessment
    workflowProps: {
        processingMode: ComplianceProcessingMode.CHECK,
        frameworks: [ComplianceFramework.GDPR],
        scope: ['web-application', 'database', 'data-warehouse', 'analytics-platform'],
        organizationProfile: {
            industry: 'technology',
            size: 'LARGE',
            region: 'EU',
            dataProcessing: 'EXTENSIVE',
            riskTolerance: 'LOW',
            maturityLevel: 'MANAGED',
            specialRequirements: ['cross-border-transfers', 'special-categories']
        },
        riskThreshold: RiskSeverity.MEDIUM,
        testMode: false,
        enableAutomation: true,
        enableMonitoring: true,
        enableReporting: true,
        evidenceCollectionEnabled: true,
        continuousAssessment: true,
        alertingEnabled: true,
        benchmarkingEnabled: true
    }
};

/**
 * Example 2: Multi-Framework Risk Assessment
 * 
 * This example demonstrates how to assess compliance risk across
 * multiple frameworks (GDPR, HIPAA, SOX) for a healthcare technology
 * company with financial reporting requirements.
 */
export const multiFrameworkRiskAssessment = {
    name: 'Multi-Framework Risk Assessment',
    description: 'Risk assessment across GDPR, HIPAA, and SOX for healthcare fintech',
    
    complianceConfiguration: {
        id: 'multi_framework_config',
        name: 'Healthcare FinTech Compliance Configuration',
        description: 'Multi-framework compliance for healthcare financial technology',
        version: '1.0.0',
        frameworks: [ComplianceFramework.GDPR, ComplianceFramework.HIPAA, ComplianceFramework.SOX],
        
        rules: [
            // GDPR rules for EU customers
            {
                id: 'GDPR_CONSENT',
                framework: ComplianceFramework.GDPR,
                category: ControlCategory.ADMINISTRATIVE,
                title: 'Patient Consent Management',
                description: 'Manage consent for processing patient data',
                requirement: 'Obtain and document explicit consent for health data processing',
                severity: RiskSeverity.CRITICAL,
                mandatory: true,
                automated: false,
                frequency: 'CONTINUOUS',
                tags: ['consent', 'patient-data'],
                evidenceRequired: [EvidenceType.POLICY, EvidenceType.PROCEDURE, EvidenceType.LOG_FILE]
            },
            
            // HIPAA rules for US healthcare data
            {
                id: 'HIPAA_SAFEGUARDS',
                framework: ComplianceFramework.HIPAA,
                category: ControlCategory.TECHNICAL,
                title: 'Administrative Safeguards',
                description: 'HIPAA administrative safeguards for PHI protection',
                requirement: 'Implement administrative safeguards to protect PHI',
                severity: RiskSeverity.HIGH,
                mandatory: true,
                automated: true,
                frequency: 'CONTINUOUS',
                tags: ['phi-protection', 'administrative'],
                evidenceRequired: [EvidenceType.POLICY, EvidenceType.AUDIT_REPORT, EvidenceType.CONFIGURATION]
            },
            
            // SOX rules for financial reporting
            {
                id: 'SOX_FINANCIAL_CONTROLS',
                framework: ComplianceFramework.SOX,
                category: ControlCategory.PREVENTIVE,
                title: 'Financial Reporting Controls',
                description: 'Controls over financial reporting accuracy',
                requirement: 'Maintain effective internal controls over financial reporting',
                severity: RiskSeverity.HIGH,
                mandatory: true,
                automated: false,
                frequency: 'QUARTERLY',
                tags: ['financial-reporting', 'internal-controls'],
                evidenceRequired: [EvidenceType.AUDIT_REPORT, EvidenceType.DOCUMENT, EvidenceType.ATTESTATION]
            }
        ],
        
        // Enhanced risk assessment for multiple frameworks
        riskAssessmentConfig: {
            methodology: 'QUANTITATIVE',
            likelihoodScale: {
                name: 'Multi-Framework Likelihood',
                levels: [
                    { value: 1, label: 'Very Low', description: '< 5% probability' },
                    { value: 2, label: 'Low', description: '5-20% probability' },
                    { value: 3, label: 'Medium', description: '20-50% probability' },
                    { value: 4, label: 'High', description: '50-80% probability' },
                    { value: 5, label: 'Very High', description: '> 80% probability' }
                ]
            },
            impactScale: {
                name: 'Multi-Framework Impact',
                levels: [
                    { value: 1, label: 'Minimal', description: '< $100K impact' },
                    { value: 2, label: 'Minor', description: '$100K - $1M impact' },
                    { value: 3, label: 'Moderate', description: '$1M - $10M impact' },
                    { value: 4, label: 'Major', description: '$10M - $100M impact' },
                    { value: 5, label: 'Catastrophic', description: '> $100M impact' }
                ]
            },
            toleranceThresholds: {
                low: 8,
                medium: 12,
                high: 16,
                critical: 20
            },
            reassessmentFrequency: 'MONTHLY'
        }
    } as ComplianceConfiguration,
    
    workflowProps: {
        processingMode: ComplianceProcessingMode.ASSESS,
        frameworks: [ComplianceFramework.GDPR, ComplianceFramework.HIPAA, ComplianceFramework.SOX],
        scope: ['patient-portal', 'ehr-system', 'billing-system', 'reporting-platform'],
        organizationProfile: {
            industry: 'healthcare',
            size: 'ENTERPRISE',
            region: 'US',
            dataProcessing: 'EXTENSIVE',
            riskTolerance: 'LOW',
            maturityLevel: 'OPTIMIZING',
            specialRequirements: ['public-company', 'cross-border', 'phi-processing']
        },
        riskThreshold: RiskSeverity.LOW,
        enableRealTimeMonitoring: true,
        includeRiskAssessment: true,
        benchmarkingEnabled: true
    }
};

/**
 * Example 3: Continuous Compliance Monitoring
 * 
 * This example shows how to set up continuous monitoring for
 * ISO 27001 compliance with real-time alerts and automated
 * evidence collection.
 */
export const continuousMonitoringExample = {
    name: 'ISO 27001 Continuous Monitoring',
    description: 'Real-time monitoring and automated compliance checking for ISO 27001',
    
    workflowProps: {
        processingMode: ComplianceProcessingMode.MONITOR,
        frameworks: [ComplianceFramework.ISO_27001],
        scope: ['all-systems'],
        testMode: false,
        enableAutomation: true,
        enableMonitoring: true,
        continuousAssessment: true,
        alertingEnabled: true,
        
        monitoringConfig: {
            enabled: true,
            frequency: 'REAL_TIME',
            alertThresholds: {
                criticalFindings: 0, // Alert immediately on critical findings
                highRiskFindings: 1,
                nonComplianceRate: 2,
                overdueTasks: 2
            },
            notificationChannels: ['email', 'slack', 'pagerduty'],
            dashboardConfig: {
                enabled: true,
                refreshInterval: 60, // 1 minute
                autoRefresh: true,
                widgets: [
                    {
                        id: 'real_time_status',
                        type: 'METRIC',
                        title: 'Compliance Status',
                        position: { x: 0, y: 0, width: 2, height: 1 },
                        dataSource: 'compliance_status',
                        configuration: {
                            displayType: 'status',
                            colorMapping: {
                                'COMPLIANT': 'green',
                                'NON_COMPLIANT': 'red',
                                'PARTIALLY_COMPLIANT': 'yellow'
                            }
                        }
                    }
                ]
            }
        },
        
        performanceSettings: {
            maxConcurrentRules: 20,
            timeoutSeconds: 30,
            enableCaching: true,
            enableParallelProcessing: true
        }
    }
};

/**
 * Example 4: Audit Preparation Workflow
 * 
 * This example demonstrates how to use the compliance piece
 * for audit preparation, including evidence gathering,
 * gap remediation, and report generation.
 */
export const auditPreparationExample = {
    name: 'SOC 2 Audit Preparation',
    description: 'Comprehensive audit preparation workflow for SOC 2 Type II assessment',
    
    workflowProps: {
        processingMode: ComplianceProcessingMode.AUDIT,
        frameworks: [ComplianceFramework.SOC2],
        scope: ['security', 'availability', 'confidentiality'],
        
        reportingConfig: {
            id: 'soc2_audit_report',
            name: 'SOC 2 Audit Readiness Report',
            description: 'Comprehensive report for SOC 2 audit preparation',
            frameworks: [ComplianceFramework.SOC2],
            scope: ['security', 'availability', 'confidentiality'],
            includeDetails: true,
            includeEvidence: true,
            includeRecommendations: true,
            includeRiskAssessment: true,
            format: 'PDF',
            audience: 'AUDIT',
            confidentiality: 'CONFIDENTIAL',
            branding: {
                companyName: 'Example Corp',
                logoUrl: 'https://example.com/logo.png',
                primaryColor: '#1f4788',
                headerText: 'SOC 2 Audit Readiness Assessment',
                footerText: 'Confidential - Prepared for External Auditor'
            }
        } as ComplianceReportConfig,
        
        evidenceCollectionEnabled: true,
        enableReporting: true,
        qualitySettings: {
            enablePeerReview: true,
            requireEvidence: true,
            enableTesting: true,
            mandatoryDocumentation: true
        }
    }
};

/**
 * Example 5: Automated Remediation Workflow
 * 
 * This example shows how to configure automated remediation
 * for low-risk compliance findings with approval workflows
 * for higher-risk items.
 */
export const automatedRemediationExample = {
    name: 'Automated Compliance Remediation',
    description: 'Automated remediation workflow with escalation for high-risk findings',
    
    workflowProps: {
        processingMode: ComplianceProcessingMode.REMEDIATE,
        frameworks: [ComplianceFramework.PCI_DSS],
        scope: ['payment-processing', 'cardholder-data'],
        
        automatedRemediationEnabled: true,
        
        remediationConfig: {
            autoRemediation: true, // Enable for low-risk findings
            approvalRequired: true, // Require approval for medium+ risk
            escalationEnabled: true,
            defaultAssignee: 'security-team',
            slaDefaults: {
                critical: 4,  // 4 hours
                high: 24,     // 24 hours  
                medium: 72,   // 3 days
                low: 168      // 1 week
            },
            workflowIntegration: 'servicenow',
            notificationTemplates: {
                'assignment': 'remediation_assigned',
                'escalation': 'remediation_escalated',
                'completion': 'remediation_completed'
            }
        },
        
        integrationSettings: {
            itsm: {
                enabled: true,
                provider: 'servicenow',
                endpoint: 'https://company.servicenow.com/api',
                ticketTypes: ['incident', 'change_request'],
                autoCreate: true,
                statusSync: true
            },
            siem: {
                enabled: true,
                provider: 'splunk',
                endpoint: 'https://splunk.company.com:8089',
                eventTypes: ['compliance_violation', 'remediation_action'],
                realTime: true
            }
        }
    }
};

/**
 * Example 6: Compliance Dashboard and Reporting
 * 
 * This example demonstrates comprehensive reporting capabilities
 * including executive dashboards, technical reports, and
 * regulatory submissions.
 */
export const complianceReportingExample = {
    name: 'Executive Compliance Dashboard',
    description: 'Executive-level compliance reporting and dashboard',
    
    workflowProps: {
        processingMode: ComplianceProcessingMode.REPORT,
        frameworks: [
            ComplianceFramework.GDPR,
            ComplianceFramework.HIPAA,
            ComplianceFramework.SOX,
            ComplianceFramework.ISO_27001
        ],
        
        reportingConfig: {
            id: 'executive_compliance_report',
            name: 'Executive Compliance Dashboard Report',
            description: 'High-level compliance status for executive leadership',
            frameworks: [
                ComplianceFramework.GDPR,
                ComplianceFramework.HIPAA,
                ComplianceFramework.SOX,
                ComplianceFramework.ISO_27001
            ],
            scope: ['enterprise-wide'],
            includeDetails: false, // Executive summary only
            includeEvidence: false,
            includeRecommendations: true,
            includeRiskAssessment: true,
            format: 'PDF',
            audience: 'EXECUTIVE',
            confidentiality: 'CONFIDENTIAL',
            template: 'executive_template',
            branding: {
                companyName: 'Global Enterprise Corp',
                primaryColor: '#003366',
                secondaryColor: '#0066cc',
                headerText: 'Quarterly Compliance Executive Summary',
                footerText: 'Board of Directors - Confidential'
            }
        } as ComplianceReportConfig,
        
        benchmarkingEnabled: true,
        includeRecommendations: true,
        
        // Advanced dashboard configuration
        monitoringConfig: {
            enabled: true,
            frequency: 'DAILY',
            dashboardConfig: {
                enabled: true,
                widgets: [
                    {
                        id: 'compliance_scorecard',
                        type: 'TABLE',
                        title: 'Compliance Scorecard',
                        position: { x: 0, y: 0, width: 8, height: 4 },
                        dataSource: 'framework_scores',
                        configuration: {
                            columns: ['Framework', 'Score', 'Status', 'Trend'],
                            sortable: true,
                            exportable: true
                        }
                    },
                    {
                        id: 'risk_heatmap',
                        type: 'MAP',
                        title: 'Risk Heat Map',
                        position: { x: 8, y: 0, width: 4, height: 4 },
                        dataSource: 'risk_data',
                        configuration: {
                            heatmapType: 'risk_matrix',
                            colorScheme: 'risk'
                        }
                    },
                    {
                        id: 'trend_analysis',
                        type: 'CHART',
                        title: 'Compliance Trends',
                        position: { x: 0, y: 4, width: 12, height: 3 },
                        dataSource: 'historical_data',
                        configuration: {
                            chartType: 'line',
                            timeRange: '12_months',
                            showProjections: true
                        }
                    }
                ],
                refreshInterval: 3600, // 1 hour for executive dashboard
                autoRefresh: true,
                allowExport: true,
                allowDrillDown: false // Executive level doesn't need drill-down
            }
        }
    }
};

/**
 * Usage Examples in Activepieces Workflows
 */
export const workflowExamples = {
    // Basic compliance check workflow
    basicComplianceCheck: {
        steps: [
            {
                name: 'compliance_assessment',
                type: 'sop_compliance',
                settings: {
                    processingMode: ComplianceProcessingMode.CHECK,
                    complianceConfiguration: gdprComplianceExample.complianceConfiguration,
                    frameworks: [ComplianceFramework.GDPR],
                    testMode: false,
                    enableAutomation: true,
                    evidenceCollectionEnabled: true
                }
            },
            {
                name: 'send_notification',
                type: 'sop_notification',
                settings: {
                    processingMode: 'SEND',
                    condition: '{{compliance_assessment.overallScore}} < 80',
                    notificationConfiguration: {
                        channels: ['email', 'slack'],
                        template: {
                            subject: 'Compliance Alert: Score Below Threshold',
                            content: 'GDPR compliance score is {{compliance_assessment.overallScore}}%. Immediate attention required.'
                        },
                        recipients: [
                            { email: 'compliance@company.com' },
                            { slackChannel: '#compliance-alerts' }
                        ]
                    }
                }
            }
        ]
    },
    
    // Scheduled compliance monitoring workflow
    scheduledMonitoring: {
        trigger: {
            type: 'schedule',
            settings: {
                cron: '0 2 * * *' // Daily at 2 AM
            }
        },
        steps: [
            {
                name: 'daily_compliance_check',
                type: 'sop_compliance',
                settings: {
                    processingMode: ComplianceProcessingMode.MONITOR,
                    frameworks: [ComplianceFramework.ISO_27001],
                    continuousAssessment: true,
                    alertingEnabled: true
                }
            },
            {
                name: 'update_dashboard',
                type: 'webhook',
                settings: {
                    url: 'https://dashboard.company.com/api/compliance/update',
                    method: 'POST',
                    body: '{{daily_compliance_check}}'
                }
            }
        ]
    },
    
    // Risk-based remediation workflow
    riskBasedRemediation: {
        trigger: {
            type: 'compliance_violation_detected'
        },
        steps: [
            {
                name: 'assess_risk',
                type: 'sop_compliance',
                settings: {
                    processingMode: ComplianceProcessingMode.ASSESS,
                    riskThreshold: RiskSeverity.MEDIUM
                }
            },
            {
                name: 'auto_remediate_low_risk',
                type: 'sop_compliance',
                condition: '{{assess_risk.riskAssessment.severity}} === "LOW"',
                settings: {
                    processingMode: ComplianceProcessingMode.REMEDIATE,
                    automatedRemediationEnabled: true
                }
            },
            {
                name: 'escalate_high_risk',
                type: 'sop_notification',
                condition: '{{assess_risk.riskAssessment.severity}} in ["HIGH", "CRITICAL"]',
                settings: {
                    processingMode: 'SEND',
                    notificationConfiguration: {
                        channels: ['pagerduty', 'email'],
                        priority: 'HIGH',
                        template: {
                            subject: 'URGENT: High-Risk Compliance Violation',
                            content: 'Critical compliance violation detected requiring immediate attention.'
                        }
                    }
                }
            }
        ]
    }
};

// Export all examples for documentation and testing
export default {
    gdprComplianceExample,
    multiFrameworkRiskAssessment,
    continuousMonitoringExample,
    auditPreparationExample,
    automatedRemediationExample,
    complianceReportingExample,
    workflowExamples
};