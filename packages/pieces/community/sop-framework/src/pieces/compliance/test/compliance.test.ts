/**
 * Compliance Piece Tests
 * 
 * Comprehensive test suite for the SOP Compliance piece including
 * compliance checking, risk assessment, gap analysis, evidence collection,
 * remediation planning, and report generation functionality.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
    ComplianceFramework,
    ComplianceProcessingMode,
    ComplianceConfiguration,
    ComplianceStatus,
    RiskSeverity,
    EvidenceType,
    ControlCategory,
    RemediationPriority,
    ComplianceRule,
    ComplianceResult
} from '../lib/common/compliance-types';
import { ComplianceValidator, ComplianceValidationContext } from '../lib/validation/compliance-validator';
import { ComplianceHelpers } from '../lib/utils/compliance-helpers';

// Mock data for testing
const mockComplianceRule: ComplianceRule = {
    id: 'GDPR_001',
    framework: ComplianceFramework.GDPR,
    category: ControlCategory.ADMINISTRATIVE,
    title: 'Data Subject Rights',
    description: 'Ensure data subject rights are implemented and accessible',
    requirement: 'Organization must provide mechanisms for data subjects to exercise their rights',
    severity: RiskSeverity.HIGH,
    mandatory: true,
    automated: false,
    frequency: 'MONTHLY',
    tags: ['data-protection', 'privacy'],
    relatedControls: ['GDPR_002', 'GDPR_003'],
    evidenceRequired: [EvidenceType.POLICY, EvidenceType.PROCEDURE],
    validationScript: undefined,
    remediationGuidance: 'Implement data subject request handling process',
    exceptions: []
};

const mockComplianceConfiguration: ComplianceConfiguration = {
    id: 'comp_config_001',
    name: 'GDPR Compliance Configuration',
    description: 'Configuration for GDPR compliance assessment',
    version: '1.0.0',
    frameworks: [ComplianceFramework.GDPR],
    rules: [mockComplianceRule],
    riskAssessmentConfig: {
        methodology: 'QUALITATIVE',
        likelihoodScale: {
            name: 'Standard Likelihood Scale',
            levels: [
                { value: 1, label: 'Very Low', description: 'Highly unlikely' },
                { value: 2, label: 'Low', description: 'Unlikely' },
                { value: 3, label: 'Medium', description: 'Possible' },
                { value: 4, label: 'High', description: 'Likely' },
                { value: 5, label: 'Very High', description: 'Highly likely' }
            ]
        },
        impactScale: {
            name: 'Standard Impact Scale',
            levels: [
                { value: 1, label: 'Very Low', description: 'Minimal impact' },
                { value: 2, label: 'Low', description: 'Minor impact' },
                { value: 3, label: 'Medium', description: 'Moderate impact' },
                { value: 4, label: 'High', description: 'Significant impact' },
                { value: 5, label: 'Very High', description: 'Severe impact' }
            ]
        },
        riskMatrix: {
            dimensions: 5,
            cells: []
        },
        toleranceThresholds: {
            low: 10,
            medium: 15,
            high: 20,
            critical: 25
        },
        reassessmentFrequency: 'QUARTERLY',
        approvalRequired: true
    },
    evidenceCollectionConfig: {
        autoCollection: true,
        supportedTypes: Object.values(EvidenceType),
        storageConfig: {
            provider: 'LOCAL',
            encryption: true,
            compression: false,
            versioning: true,
            backupEnabled: true,
            path: '/evidence'
        },
        retentionPolicy: {
            defaultRetention: 2555, // 7 years in days
            typeSpecificRetention: {
                [EvidenceType.AUDIT_REPORT]: 2555,
                [EvidenceType.POLICY]: 1825,
                [EvidenceType.CERTIFICATE]: 365,
                [EvidenceType.SCREENSHOT]: 365,
                [EvidenceType.LOG_FILE]: 90,
                [EvidenceType.DOCUMENT]: 1825,
                [EvidenceType.PROCEDURE]: 1825,
                [EvidenceType.ATTESTATION]: 365,
                [EvidenceType.CONFIGURATION]: 365,
                [EvidenceType.CODE_REVIEW]: 365
            },
            archivalEnabled: true,
            archivalAfter: 365,
            purgeAfter: 2555,
            legalHoldSupport: true
        },
        validationRules: [
            {
                id: 'val_001',
                name: 'File Size Validation',
                description: 'Validate file size limits',
                type: 'SIZE',
                condition: 'size < 50MB',
                action: 'REJECT',
                enabled: true
            }
        ],
        metadata: {}
    },
    remediationConfig: {
        autoRemediation: false,
        approvalRequired: true,
        escalationEnabled: true,
        defaultAssignee: 'compliance-team',
        slaDefaults: {
            critical: 24,
            high: 72,
            medium: 168,
            low: 720
        },
        workflowIntegration: 'jira',
        notificationTemplates: {
            'assignment': 'remediation_assigned_template',
            'escalation': 'remediation_escalation_template'
        }
    },
    reportingConfig: {
        id: 'default_report',
        name: 'GDPR Compliance Report',
        description: 'Standard GDPR compliance report',
        frameworks: [ComplianceFramework.GDPR],
        scope: ['all'],
        includeDetails: true,
        includeEvidence: true,
        includeRecommendations: true,
        includeRiskAssessment: true,
        format: 'PDF',
        audience: 'COMPREHENSIVE',
        confidentiality: 'INTERNAL'
    },
    monitoringConfig: {
        enabled: true,
        frequency: 'DAILY',
        alertThresholds: {
            criticalFindings: 1,
            highRiskFindings: 3,
            nonComplianceRate: 10,
            overdueTasks: 5
        },
        notificationChannels: ['email'],
        dashboardConfig: {
            enabled: true,
            widgets: [],
            refreshInterval: 300,
            autoRefresh: true,
            allowExport: true,
            allowDrillDown: true
        }
    },
    automationConfig: {
        enabled: true,
        scheduledScans: true,
        scanSchedule: '0 2 * * *',
        autoRemediation: false,
        integrationTests: true,
        continuousMonitoring: true,
        alerting: true,
        reportGeneration: true,
        workflowIntegration: true
    },
    integrationConfig: {
        siem: {
            enabled: false,
            provider: 'splunk',
            endpoint: '',
            credentials: {},
            eventTypes: [],
            format: 'JSON',
            realTime: false
        }
    },
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    createdBy: 'test_user',
    effectiveDate: '2024-01-20T00:00:00Z',
    tags: ['gdpr', 'privacy'],
    metadata: {}
};

const mockValidationContext: ComplianceValidationContext = {
    configId: 'comp_config_001',
    configVersion: '1.0.0',
    userId: 'test_user',
    timestamp: '2024-01-20T10:00:00Z',
    validationMode: 'strict',
    frameworks: [ComplianceFramework.GDPR],
    scope: ['web-application', 'database'],
    environment: 'production',
    organizationProfile: {
        industry: 'technology',
        size: 'MEDIUM',
        region: 'US',
        dataProcessing: 'MODERATE',
        riskTolerance: 'MEDIUM',
        maturityLevel: 'DEFINED',
        specialRequirements: []
    }
};

describe('ComplianceValidator', () => {
    let validator: ComplianceValidator;

    beforeEach(() => {
        validator = new ComplianceValidator();
    });

    describe('validateCompliance', () => {
        it('should validate a valid compliance configuration', async () => {
            const result = await validator.validateCompliance(
                mockComplianceConfiguration,
                mockValidationContext
            );

            expect(result.isValid).toBe(true);
            expect(result.score).toBeGreaterThan(0);
            expect(result.errors).toHaveLength(0);
            expect(result.frameworkSpecificResults).toHaveProperty(ComplianceFramework.GDPR);
            expect(result.ruleValidationResults).toHaveLength(1);
            expect(result.processingTime).toBeGreaterThan(0);
        });

        it('should identify validation errors in invalid configuration', async () => {
            const invalidConfig = {
                ...mockComplianceConfiguration,
                id: '', // Invalid empty ID
                frameworks: [], // Invalid empty frameworks
                rules: [] // Invalid empty rules
            };

            const result = await validator.validateCompliance(
                invalidConfig,
                mockValidationContext
            );

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some(e => e.code === 'MISSING_ID')).toBe(true);
            expect(result.errors.some(e => e.code === 'NO_FRAMEWORKS')).toBe(true);
            expect(result.errors.some(e => e.code === 'NO_RULES')).toBe(true);
        });

        it('should generate recommendations for improvement', async () => {
            const result = await validator.validateCompliance(
                mockComplianceConfiguration,
                mockValidationContext
            );

            expect(result.recommendations).toBeDefined();
            expect(Array.isArray(result.recommendations)).toBe(true);
        });

        it('should perform gap analysis', async () => {
            const result = await validator.validateCompliance(
                mockComplianceConfiguration,
                mockValidationContext
            );

            expect(result.gapAnalysis).toBeDefined();
            expect(result.gapAnalysis?.criticalGaps).toBeGreaterThanOrEqual(0);
            expect(result.gapAnalysis?.highPriorityGaps).toBeGreaterThanOrEqual(0);
        });

        it('should calculate quality metrics', async () => {
            const result = await validator.validateCompliance(
                mockComplianceConfiguration,
                mockValidationContext
            );

            expect(result.qualityMetrics).toBeDefined();
            expect(result.qualityMetrics.accuracy).toBeGreaterThanOrEqual(0);
            expect(result.qualityMetrics.accuracy).toBeLessThanOrEqual(100);
            expect(result.qualityMetrics.completeness).toBeGreaterThanOrEqual(0);
            expect(result.qualityMetrics.completeness).toBeLessThanOrEqual(100);
        });
    });
});

describe('ComplianceHelpers', () => {
    describe('generateComplianceId', () => {
        it('should generate unique compliance IDs', () => {
            const id1 = ComplianceHelpers.generateComplianceId();
            const id2 = ComplianceHelpers.generateComplianceId();
            const id3 = ComplianceHelpers.generateComplianceId('test');

            expect(id1).toBeDefined();
            expect(id2).toBeDefined();
            expect(id3).toBeDefined();
            expect(id1).not.toBe(id2);
            expect(id3).toMatch(/^test_/);
        });
    });

    describe('calculateComplianceScore', () => {
        it('should calculate correct compliance score', () => {
            const ruleResults = [
                {
                    ruleId: 'rule1',
                    framework: ComplianceFramework.GDPR,
                    title: 'Rule 1',
                    status: ComplianceStatus.COMPLIANT,
                    score: 90,
                    severity: RiskSeverity.HIGH,
                    findings: [],
                    evidence: [],
                    testResults: [],
                    lastAssessed: '2024-01-20T10:00:00Z',
                    remediationItems: []
                },
                {
                    ruleId: 'rule2',
                    framework: ComplianceFramework.GDPR,
                    title: 'Rule 2',
                    status: ComplianceStatus.COMPLIANT,
                    score: 80,
                    severity: RiskSeverity.MEDIUM,
                    findings: [],
                    evidence: [],
                    testResults: [],
                    lastAssessed: '2024-01-20T10:00:00Z',
                    remediationItems: []
                }
            ];

            const score = ComplianceHelpers.calculateComplianceScore(ruleResults);
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(100);
        });

        it('should return 0 for empty rule results', () => {
            const score = ComplianceHelpers.calculateComplianceScore([]);
            expect(score).toBe(0);
        });
    });

    describe('determineOverallStatus', () => {
        it('should determine COMPLIANT status when all rules are compliant', () => {
            const ruleResults = [
                {
                    ruleId: 'rule1',
                    framework: ComplianceFramework.GDPR,
                    title: 'Rule 1',
                    status: ComplianceStatus.COMPLIANT,
                    score: 90,
                    severity: RiskSeverity.HIGH,
                    findings: [],
                    evidence: [],
                    testResults: [],
                    lastAssessed: '2024-01-20T10:00:00Z',
                    remediationItems: []
                },
                {
                    ruleId: 'rule2',
                    framework: ComplianceFramework.GDPR,
                    title: 'Rule 2',
                    status: ComplianceStatus.COMPLIANT,
                    score: 85,
                    severity: RiskSeverity.MEDIUM,
                    findings: [],
                    evidence: [],
                    testResults: [],
                    lastAssessed: '2024-01-20T10:00:00Z',
                    remediationItems: []
                }
            ];

            const status = ComplianceHelpers.determineOverallStatus(ruleResults);
            expect(status).toBe(ComplianceStatus.COMPLIANT);
        });

        it('should determine NON_COMPLIANT status when many rules are non-compliant', () => {
            const ruleResults = [
                {
                    ruleId: 'rule1',
                    framework: ComplianceFramework.GDPR,
                    title: 'Rule 1',
                    status: ComplianceStatus.NON_COMPLIANT,
                    score: 30,
                    severity: RiskSeverity.HIGH,
                    findings: [],
                    evidence: [],
                    testResults: [],
                    lastAssessed: '2024-01-20T10:00:00Z',
                    remediationItems: []
                },
                {
                    ruleId: 'rule2',
                    framework: ComplianceFramework.GDPR,
                    title: 'Rule 2',
                    status: ComplianceStatus.NON_COMPLIANT,
                    score: 25,
                    severity: RiskSeverity.MEDIUM,
                    findings: [],
                    evidence: [],
                    testResults: [],
                    lastAssessed: '2024-01-20T10:00:00Z',
                    remediationItems: []
                },
                {
                    ruleId: 'rule3',
                    framework: ComplianceFramework.GDPR,
                    title: 'Rule 3',
                    status: ComplianceStatus.NON_COMPLIANT,
                    score: 20,
                    severity: RiskSeverity.LOW,
                    findings: [],
                    evidence: [],
                    testResults: [],
                    lastAssessed: '2024-01-20T10:00:00Z',
                    remediationItems: []
                }
            ];

            const status = ComplianceHelpers.determineOverallStatus(ruleResults);
            expect(status).toBe(ComplianceStatus.NON_COMPLIANT);
        });

        it('should return NOT_ASSESSED for empty rule results', () => {
            const status = ComplianceHelpers.determineOverallStatus([]);
            expect(status).toBe(ComplianceStatus.NOT_ASSESSED);
        });
    });

    describe('performGapAnalysis', () => {
        it('should perform gap analysis correctly', () => {
            const ruleResults = [
                {
                    ruleId: 'GDPR_001',
                    framework: ComplianceFramework.GDPR,
                    title: 'Rule 1',
                    status: ComplianceStatus.COMPLIANT,
                    score: 90,
                    severity: RiskSeverity.HIGH,
                    findings: [],
                    evidence: [],
                    testResults: [],
                    lastAssessed: '2024-01-20T10:00:00Z',
                    remediationItems: []
                }
            ];

            const gapAnalysis = ComplianceHelpers.performGapAnalysis(
                mockComplianceConfiguration,
                ruleResults,
                ComplianceFramework.GDPR
            );

            expect(gapAnalysis.id).toBeDefined();
            expect(gapAnalysis.framework).toBe(ComplianceFramework.GDPR);
            expect(gapAnalysis.overallScore).toBeGreaterThanOrEqual(0);
            expect(gapAnalysis.overallScore).toBeLessThanOrEqual(100);
            expect(gapAnalysis.totalRules).toBe(1);
            expect(gapAnalysis.estimatedRemediationEffort).toBeGreaterThanOrEqual(0);
        });
    });

    describe('collectEvidence', () => {
        it('should collect evidence for compliance rules', async () => {
            const evidence = await ComplianceHelpers.collectEvidence(mockComplianceRule);

            expect(evidence).toHaveLength(mockComplianceRule.evidenceRequired.length);
            evidence.forEach(item => {
                expect(item.id).toBeDefined();
                expect(item.type).toBeDefined();
                expect(item.collectedAt).toBeDefined();
                expect(item.relatedRules).toContain(mockComplianceRule.id);
            });
        });
    });

    describe('assessComplianceRisk', () => {
        it('should assess risk for compliance rules', () => {
            const riskAssessment = ComplianceHelpers.assessComplianceRisk(mockComplianceRule);

            expect(riskAssessment.id).toBeDefined();
            expect(riskAssessment.inherentRisk).toBe(mockComplianceRule.severity);
            expect(riskAssessment.likelihood).toBeGreaterThanOrEqual(1);
            expect(riskAssessment.likelihood).toBeLessThanOrEqual(5);
            expect(riskAssessment.impact).toBeGreaterThanOrEqual(1);
            expect(riskAssessment.impact).toBeLessThanOrEqual(5);
            expect(riskAssessment.riskScore).toBeGreaterThanOrEqual(1);
            expect(riskAssessment.assessedAt).toBeDefined();
        });
    });

    describe('generateComplianceReport', () => {
        it('should generate compliance report', async () => {
            const mockResult: ComplianceResult = {
                success: true,
                executionId: 'exec_001',
                sopId: 'sop_001',
                complianceId: 'comp_001',
                executionTime: 5000,
                processingMode: ComplianceProcessingMode.CHECK,
                frameworks: [ComplianceFramework.GDPR],
                overallStatus: ComplianceStatus.COMPLIANT,
                overallScore: 85,
                rulesProcessed: 10,
                rulesCompliant: 8,
                rulesNonCompliant: 1,
                rulesPartiallyCompliant: 1,
                rulesNotAssessed: 0,
                criticalFindings: 0,
                highRiskFindings: 1,
                mediumRiskFindings: 2,
                lowRiskFindings: 3,
                ruleResults: [],
                auditTrail: [],
                metadata: {
                    executedBy: 'test_user',
                    completedAt: '2024-01-20T10:00:00Z',
                    frameworks: [ComplianceFramework.GDPR],
                    configVersion: '1.0.0',
                    processingMode: ComplianceProcessingMode.CHECK
                }
            };

            const reportConfig = mockComplianceConfiguration.reportingConfig;
            const reportResult = await ComplianceHelpers.generateComplianceReport(mockResult, reportConfig);

            expect(reportResult.id).toBeDefined();
            expect(reportResult.name).toBe(reportConfig.name);
            expect(reportResult.format).toBe(reportConfig.format);
            expect(reportResult.generatedAt).toBeDefined();
            expect(reportResult.size).toBeGreaterThan(0);
        });
    });

    describe('generateComplianceCertificate', () => {
        it('should generate compliance certificate for high scores', () => {
            const mockResult: ComplianceResult = {
                success: true,
                executionId: 'exec_001',
                sopId: 'sop_001',
                complianceId: 'comp_001',
                executionTime: 5000,
                processingMode: ComplianceProcessingMode.CERTIFY,
                frameworks: [ComplianceFramework.GDPR],
                overallStatus: ComplianceStatus.COMPLIANT,
                overallScore: 92,
                rulesProcessed: 10,
                rulesCompliant: 9,
                rulesNonCompliant: 0,
                rulesPartiallyCompliant: 1,
                rulesNotAssessed: 0,
                criticalFindings: 0,
                highRiskFindings: 0,
                mediumRiskFindings: 1,
                lowRiskFindings: 2,
                ruleResults: [],
                auditTrail: [],
                metadata: {
                    executedBy: 'test_user',
                    completedAt: '2024-01-20T10:00:00Z',
                    frameworks: [ComplianceFramework.GDPR],
                    configVersion: '1.0.0',
                    processingMode: ComplianceProcessingMode.CERTIFY
                }
            };

            const certificate = ComplianceHelpers.generateComplianceCertificate(
                ComplianceFramework.GDPR,
                mockResult,
                'Test Organization',
                ['Web Application', 'Database']
            );

            expect(certificate.id).toBeDefined();
            expect(certificate.framework).toBe(ComplianceFramework.GDPR);
            expect(certificate.certifiedEntity).toBe('Test Organization');
            expect(certificate.scope).toContain('Web Application');
            expect(certificate.scope).toContain('Database');
            expect(certificate.certificateNumber).toBeDefined();
            expect(certificate.validFrom).toBeDefined();
            expect(certificate.validUntil).toBeDefined();
            expect(certificate.certificationLevel).toBeDefined();
        });
    });

    describe('monitorCompliance', () => {
        it('should generate monitoring metrics', () => {
            const monitoringConfig = mockComplianceConfiguration.monitoringConfig;
            const metrics = ComplianceHelpers.monitorCompliance(mockComplianceConfiguration, monitoringConfig);

            expect(Array.isArray(metrics)).toBe(true);
            expect(metrics.length).toBeGreaterThan(0);
            
            metrics.forEach(metric => {
                expect(metric.id).toBeDefined();
                expect(metric.name).toBeDefined();
                expect(metric.value).toBeGreaterThanOrEqual(0);
                expect(metric.collectedAt).toBeDefined();
            });

            // Check for specific expected metrics
            const complianceRateMetric = metrics.find(m => m.name === 'Overall Compliance Rate');
            expect(complianceRateMetric).toBeDefined();
            expect(complianceRateMetric?.type).toBe('PERCENTAGE');

            const criticalFindingsMetric = metrics.find(m => m.name === 'Critical Findings');
            expect(criticalFindingsMetric).toBeDefined();
            expect(criticalFindingsMetric?.type).toBe('COUNT');
        });
    });
});

describe('Compliance Integration Tests', () => {
    let validator: ComplianceValidator;

    beforeEach(() => {
        validator = new ComplianceValidator();
    });

    describe('End-to-End Compliance Assessment', () => {
        it('should perform complete compliance assessment workflow', async () => {
            // Step 1: Validate configuration
            const validationResult = await validator.validateCompliance(
                mockComplianceConfiguration,
                mockValidationContext
            );

            expect(validationResult.isValid).toBe(true);

            // Step 2: Perform gap analysis
            const gapAnalysis = ComplianceHelpers.performGapAnalysis(
                mockComplianceConfiguration,
                [],
                ComplianceFramework.GDPR
            );

            expect(gapAnalysis.framework).toBe(ComplianceFramework.GDPR);

            // Step 3: Collect evidence
            const evidence = await ComplianceHelpers.collectEvidence(mockComplianceRule);
            expect(evidence.length).toBeGreaterThan(0);

            // Step 4: Generate risk assessment
            const riskAssessment = ComplianceHelpers.assessComplianceRisk(mockComplianceRule);
            expect(riskAssessment.riskScore).toBeGreaterThan(0);

            // Step 5: Generate report
            const mockResult: ComplianceResult = {
                success: true,
                executionId: 'exec_001',
                sopId: 'sop_001',
                complianceId: mockComplianceConfiguration.id,
                executionTime: 10000,
                processingMode: ComplianceProcessingMode.CHECK,
                frameworks: [ComplianceFramework.GDPR],
                overallStatus: ComplianceStatus.COMPLIANT,
                overallScore: 85,
                rulesProcessed: 1,
                rulesCompliant: 1,
                rulesNonCompliant: 0,
                rulesPartiallyCompliant: 0,
                rulesNotAssessed: 0,
                criticalFindings: 0,
                highRiskFindings: 0,
                mediumRiskFindings: 0,
                lowRiskFindings: 1,
                ruleResults: [],
                gapAnalysis,
                evidenceCollected: evidence,
                riskAssessment,
                auditTrail: [],
                metadata: {
                    executedBy: 'test_user',
                    completedAt: new Date().toISOString(),
                    frameworks: [ComplianceFramework.GDPR],
                    configVersion: mockComplianceConfiguration.version,
                    processingMode: ComplianceProcessingMode.CHECK
                }
            };

            const reportResult = await ComplianceHelpers.generateComplianceReport(
                mockResult,
                mockComplianceConfiguration.reportingConfig
            );

            expect(reportResult.id).toBeDefined();
            expect(reportResult.generatedAt).toBeDefined();

            // Step 6: Generate certificate if applicable
            if (mockResult.overallScore >= 80) {
                const certificate = ComplianceHelpers.generateComplianceCertificate(
                    ComplianceFramework.GDPR,
                    mockResult,
                    'Test Organization',
                    ['All Systems']
                );

                expect(certificate.id).toBeDefined();
                expect(certificate.certificationLevel).toBeDefined();
            }
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid configurations gracefully', async () => {
            const invalidConfig = {
                ...mockComplianceConfiguration,
                rules: [] // Empty rules should cause validation errors
            };

            const result = await validator.validateCompliance(
                invalidConfig,
                mockValidationContext
            );

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should handle missing evidence gracefully', async () => {
            const ruleWithoutEvidence = {
                ...mockComplianceRule,
                evidenceRequired: [] // No evidence required
            };

            const evidence = await ComplianceHelpers.collectEvidence(ruleWithoutEvidence);
            expect(evidence).toHaveLength(0);
        });
    });

    describe('Performance Tests', () => {
        it('should complete validation within reasonable time', async () => {
            const startTime = Date.now();

            const result = await validator.validateCompliance(
                mockComplianceConfiguration,
                mockValidationContext
            );

            const executionTime = Date.now() - startTime;

            expect(result.processingTime).toBeLessThan(5000); // Should complete within 5 seconds
            expect(executionTime).toBeLessThan(5000);
        });

        it('should handle large rule sets efficiently', async () => {
            // Create configuration with many rules
            const largeRuleSet = Array.from({ length: 100 }, (_, i) => ({
                ...mockComplianceRule,
                id: `GDPR_${i.toString().padStart(3, '0')}`,
                title: `Rule ${i + 1}`
            }));

            const largeConfig = {
                ...mockComplianceConfiguration,
                rules: largeRuleSet
            };

            const startTime = Date.now();

            const result = await validator.validateCompliance(
                largeConfig,
                mockValidationContext
            );

            const executionTime = Date.now() - startTime;

            expect(result.ruleValidationResults).toHaveLength(100);
            expect(executionTime).toBeLessThan(15000); // Should complete within 15 seconds for 100 rules
        });
    });
});