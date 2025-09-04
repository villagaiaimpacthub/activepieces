/**
 * Compliance Action
 * 
 * Core action for comprehensive compliance management including automated
 * compliance checking, risk assessment, gap analysis, evidence collection,
 * remediation planning, and regulatory reporting within SOP workflows.
 */

import { createAction, Property, Validators } from '@activepieces/pieces-framework';
import { BaseSoPiece, BaseSoPieceConfig } from '../../../../framework/base-sop-piece';
import { 
    SOPPieceType, 
    SOPPieceCategory, 
    SOPPriority, 
    SOPExecutionState,
    SOPComplianceStatus,
    SOPExecutionContext
} from '../../../../types/sop-types';
import {
    sopPriorityProp,
    assignedToProp,
    dueDateProp,
    enableComplianceCheckProp,
    enableAuditTrailProp,
    customVariablesProp,
    tagsProp,
    notesProp,
    timeoutProp,
    retryAttemptsProp,
    notificationSettingsProp,
    escalationSettingsProp,
    errorHandlingProp,
    stepDescriptionProp
} from '../../../../common/sop-props';
import {
    ComplianceFramework,
    ComplianceProcessingMode,
    ComplianceConfiguration,
    ComplianceResult,
    ComplianceStatus,
    RiskSeverity,
    EvidenceType,
    ControlCategory,
    RemediationPriority,
    ComplianceReportConfig,
    MonitoringConfig,
    RuleResult,
    ComplianceFinding,
    GapAnalysisResult,
    RemediationPlan,
    ComplianceReportResult,
    ComplianceCertificate
} from '../common/compliance-types';
import { ComplianceValidator, ComplianceValidationContext } from '../validation/compliance-validator';
import { ComplianceHelpers } from '../utils/compliance-helpers';
import { nanoid } from 'nanoid';

/**
 * Compliance Piece Configuration Interface
 */
interface CompliancePieceConfig extends BaseSoPieceConfig {
    supportedFrameworks?: ComplianceFramework[];
    maxRulesPerAssessment?: number;
    enableAutomation?: boolean;
    enableRealTimeMonitoring?: boolean;
    enableReporting?: boolean;
    defaultRiskThreshold?: RiskSeverity;
}

/**
 * Compliance Properties Interface
 */
interface ComplianceProps {
    sopMetadata: any;
    priority: SOPPriority;
    assignedTo?: string;
    dueDate?: string;
    enableComplianceCheck: boolean;
    enableAuditTrail: boolean;
    customVariables: Record<string, any>;
    tags: string[];
    notes?: string;
    
    // Compliance specific properties
    processingMode: ComplianceProcessingMode;
    complianceConfiguration: ComplianceConfiguration;
    frameworks: ComplianceFramework[];
    scope?: string[];
    organizationProfile?: any;
    riskThreshold: RiskSeverity;
    testMode: boolean;
    enableAutomation: boolean;
    enableMonitoring: boolean;
    enableReporting: boolean;
    reportingConfig?: ComplianceReportConfig;
    monitoringConfig?: MonitoringConfig;
    evidenceCollectionEnabled: boolean;
    automatedRemediationEnabled: boolean;
    continuousAssessment: boolean;
    alertingEnabled: boolean;
    benchmarkingEnabled: boolean;
    integrationSettings: Record<string, any>;
    performanceSettings: {
        maxConcurrentRules: number;
        timeoutSeconds: number;
        enableCaching: boolean;
        enableParallelProcessing: boolean;
    };
    qualitySettings: {
        enablePeerReview: boolean;
        requireEvidence: boolean;
        enableTesting: boolean;
        mandatoryDocumentation: boolean;
    };
}

/**
 * Compliance Piece Implementation
 */
class CompliancePiece extends BaseSoPiece {
    private validator: ComplianceValidator;
    private helpers: typeof ComplianceHelpers;
    
    constructor(config: CompliancePieceConfig) {
        super({
            ...config,
            sopPieceType: SOPPieceType.COMPLIANCE_CHECK,
            sopCategory: SOPPieceCategory.COMPLIANCE,
            complianceRequired: true,
            auditTrailRequired: true
        });
        
        this.validator = new ComplianceValidator();
        this.helpers = ComplianceHelpers;
    }

    /**
     * Get Compliance specific properties
     */
    protected getSOPSpecificProperties() {
        return {
            // Core Processing Configuration
            processingMode: Property.StaticDropdown({
                displayName: 'Processing Mode',
                description: 'How compliance processing should be performed',
                required: true,
                defaultValue: ComplianceProcessingMode.CHECK,
                options: {
                    options: [
                        { label: 'Compliance Check', value: ComplianceProcessingMode.CHECK },
                        { label: 'Risk Assessment', value: ComplianceProcessingMode.ASSESS },
                        { label: 'Continuous Monitoring', value: ComplianceProcessingMode.MONITOR },
                        { label: 'Audit Preparation', value: ComplianceProcessingMode.AUDIT },
                        { label: 'Remediation', value: ComplianceProcessingMode.REMEDIATE },
                        { label: 'Generate Report', value: ComplianceProcessingMode.REPORT },
                        { label: 'Certification', value: ComplianceProcessingMode.CERTIFY }
                    ]
                }
            }),
            
            complianceConfiguration: Property.Json({
                displayName: 'Compliance Configuration',
                description: 'Complete compliance configuration including frameworks, rules, and settings',
                required: true,
                validators: [Validators.object]
            }),
            
            frameworks: Property.MultiSelectDropdown({
                displayName: 'Compliance Frameworks',
                description: 'Select compliance frameworks to assess',
                required: true,
                options: {
                    options: [
                        { label: 'GDPR - General Data Protection Regulation', value: ComplianceFramework.GDPR },
                        { label: 'HIPAA - Health Insurance Portability and Accountability Act', value: ComplianceFramework.HIPAA },
                        { label: 'SOX - Sarbanes-Oxley Act', value: ComplianceFramework.SOX },
                        { label: 'PCI DSS - Payment Card Industry Data Security Standard', value: ComplianceFramework.PCI_DSS },
                        { label: 'ISO 27001 - Information Security Management', value: ComplianceFramework.ISO_27001 },
                        { label: 'CCPA - California Consumer Privacy Act', value: ComplianceFramework.CCPA },
                        { label: 'NIST - National Institute of Standards and Technology', value: ComplianceFramework.NIST },
                        { label: 'COBIT - Control Objectives for Information and Related Technologies', value: ComplianceFramework.COBIT },
                        { label: 'SOC 2 - Service Organization Control 2', value: ComplianceFramework.SOC2 },
                        { label: 'FISMA - Federal Information Security Management Act', value: ComplianceFramework.FISMA },
                        { label: 'FERPA - Family Educational Rights and Privacy Act', value: ComplianceFramework.FERPA },
                        { label: 'GLBA - Gramm-Leach-Bliley Act', value: ComplianceFramework.GLBA },
                        { label: 'PIPEDA - Personal Information Protection and Electronic Documents Act', value: ComplianceFramework.PIPEDA }
                    ]
                }
            }),
            
            scope: Property.Array({
                displayName: 'Assessment Scope',
                description: 'Specific areas or systems to include in compliance assessment',
                required: false
            }),
            
            organizationProfile: Property.Object({
                displayName: 'Organization Profile',
                description: 'Organization characteristics for context-aware compliance assessment',
                required: false,
                defaultValue: {
                    industry: 'technology',
                    size: 'MEDIUM',
                    region: 'US',
                    dataProcessing: 'MODERATE',
                    riskTolerance: 'MEDIUM',
                    maturityLevel: 'DEFINED',
                    specialRequirements: []
                }
            }),
            
            riskThreshold: Property.StaticDropdown({
                displayName: 'Risk Threshold',
                description: 'Minimum risk level to report findings',
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
            
            testMode: Property.Checkbox({
                displayName: 'Test Mode',
                description: 'Enable test mode for compliance assessment without affecting production',
                required: false,
                defaultValue: false
            }),
            
            // Feature Toggles
            enableAutomation: Property.Checkbox({
                displayName: 'Enable Automation',
                description: 'Enable automated compliance checking and remediation',
                required: false,
                defaultValue: true
            }),
            
            enableMonitoring: Property.Checkbox({
                displayName: 'Enable Monitoring',
                description: 'Enable continuous compliance monitoring',
                required: false,
                defaultValue: true
            }),
            
            enableReporting: Property.Checkbox({
                displayName: 'Enable Reporting',
                description: 'Enable compliance report generation',
                required: false,
                defaultValue: true
            }),
            
            evidenceCollectionEnabled: Property.Checkbox({
                displayName: 'Evidence Collection',
                description: 'Automatically collect and validate compliance evidence',
                required: false,
                defaultValue: true
            }),
            
            automatedRemediationEnabled: Property.Checkbox({
                displayName: 'Automated Remediation',
                description: 'Enable automated remediation for low-risk findings',
                required: false,
                defaultValue: false
            }),
            
            continuousAssessment: Property.Checkbox({
                displayName: 'Continuous Assessment',
                description: 'Perform continuous compliance assessment',
                required: false,
                defaultValue: false
            }),
            
            alertingEnabled: Property.Checkbox({
                displayName: 'Enable Alerting',
                description: 'Send alerts for compliance violations',
                required: false,
                defaultValue: true
            }),
            
            benchmarkingEnabled: Property.Checkbox({
                displayName: 'Enable Benchmarking',
                description: 'Compare against industry benchmarks',
                required: false,
                defaultValue: false
            }),
            
            // Advanced Configuration
            reportingConfig: Property.Object({
                displayName: 'Reporting Configuration',
                description: 'Configuration for compliance report generation',
                required: false,
                defaultValue: {
                    format: 'PDF',
                    includeDetails: true,
                    includeEvidence: true,
                    includeRecommendations: true,
                    includeRiskAssessment: true,
                    audience: 'COMPREHENSIVE',
                    confidentiality: 'INTERNAL'
                }
            }),
            
            monitoringConfig: Property.Object({
                displayName: 'Monitoring Configuration',
                description: 'Configuration for continuous compliance monitoring',
                required: false,
                defaultValue: {
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
                        autoRefresh: true,
                        refreshInterval: 300
                    }
                }
            }),
            
            integrationSettings: Property.Object({
                displayName: 'Integration Settings',
                description: 'Settings for external system integrations',
                required: false,
                defaultValue: {
                    siem: { enabled: false },
                    grc: { enabled: false },
                    itsm: { enabled: false },
                    identity: { enabled: false },
                    audit: { enabled: false }
                }
            }),
            
            performanceSettings: Property.Object({
                displayName: 'Performance Settings',
                description: 'Settings to optimize compliance processing performance',
                required: false,
                defaultValue: {
                    maxConcurrentRules: 10,
                    timeoutSeconds: 300,
                    enableCaching: true,
                    enableParallelProcessing: true
                }
            }),
            
            qualitySettings: Property.Object({
                displayName: 'Quality Settings',
                description: 'Settings to ensure high quality compliance assessment',
                required: false,
                defaultValue: {
                    enablePeerReview: false,
                    requireEvidence: true,
                    enableTesting: true,
                    mandatoryDocumentation: true
                }
            }),
            
            // Output Configuration
            outputFormat: Property.StaticDropdown({
                displayName: 'Output Format',
                description: 'Format for compliance results output',
                required: false,
                defaultValue: 'COMPREHENSIVE',
                options: {
                    options: [
                        { label: 'Summary Only', value: 'SUMMARY' },
                        { label: 'Detailed Results', value: 'DETAILED' },
                        { label: 'Comprehensive Report', value: 'COMPREHENSIVE' },
                        { label: 'Executive Summary', value: 'EXECUTIVE' },
                        { label: 'Technical Details', value: 'TECHNICAL' }
                    ]
                }
            }),
            
            includeRecommendations: Property.Checkbox({
                displayName: 'Include Recommendations',
                description: 'Include remediation recommendations in output',
                required: false,
                defaultValue: true
            }),
            
            includeRiskAssessment: Property.Checkbox({
                displayName: 'Include Risk Assessment',
                description: 'Include detailed risk assessment in output',
                required: false,
                defaultValue: true
            }),
            
            generateCertificate: Property.Checkbox({
                displayName: 'Generate Certificate',
                description: 'Generate compliance certificate for passing assessments',
                required: false,
                defaultValue: false
            })
        };
    }

    /**
     * Main execution method
     */
    async execute(propsValue: ComplianceProps, executedBy: string): Promise<ComplianceResult> {
        const startTime = Date.now();
        const executionStartTime = new Date();
        
        try {
            // Create execution context
            const context = this.createExecutionContext(propsValue, executedBy);
            
            // Execute pre-run hooks
            await this.executePreRunHooks(context, propsValue);
            
            // Validate compliance configuration
            await this.validateComplianceConfiguration(propsValue.complianceConfiguration, propsValue);
            
            // Update state to IN_PROGRESS
            context.currentState = SOPExecutionState.IN_PROGRESS;
            context.auditTrail.push({
                timestamp: new Date().toISOString(),
                action: 'compliance_processing_started',
                userId: executedBy,
                details: {
                    complianceId: propsValue.complianceConfiguration.id,
                    processingMode: propsValue.processingMode,
                    frameworks: propsValue.frameworks,
                    rulesCount: propsValue.complianceConfiguration.rules.length,
                    scope: propsValue.scope,
                    testMode: propsValue.testMode
                }
            });
            
            // Process based on mode
            let result: ComplianceResult;
            
            switch (propsValue.processingMode) {
                case ComplianceProcessingMode.CHECK:
                    result = await this.handleComplianceCheck(context, propsValue, executionStartTime);
                    break;
                    
                case ComplianceProcessingMode.ASSESS:
                    result = await this.handleRiskAssessment(context, propsValue);
                    break;
                    
                case ComplianceProcessingMode.MONITOR:
                    result = await this.handleContinuousMonitoring(context, propsValue);
                    break;
                    
                case ComplianceProcessingMode.AUDIT:
                    result = await this.handleAuditPreparation(context, propsValue);
                    break;
                    
                case ComplianceProcessingMode.REMEDIATE:
                    result = await this.handleRemediation(context, propsValue);
                    break;
                    
                case ComplianceProcessingMode.REPORT:
                    result = await this.handleReportGeneration(context, propsValue);
                    break;
                    
                case ComplianceProcessingMode.CERTIFY:
                    result = await this.handleCertification(context, propsValue);
                    break;
                    
                default:
                    throw new Error(`Unknown processing mode: ${propsValue.processingMode}`);
            }
            
            // Calculate execution time
            result.executionTime = Date.now() - startTime;
            
            // Execute post-run hooks
            await this.executePostRunHooks(context, result);
            
            return result;
            
        } catch (error: any) {
            // Create error context if not already created
            const context = this.createExecutionContext(propsValue, executedBy);
            await this.handleExecutionError(context, error);
            
            return {
                success: false,
                executionId: context.executionId,
                sopId: context.sopMetadata.sopId,
                complianceId: propsValue.complianceConfiguration.id,
                executionTime: Date.now() - startTime,
                processingMode: propsValue.processingMode,
                frameworks: propsValue.frameworks,
                overallStatus: ComplianceStatus.NON_COMPLIANT,
                overallScore: 0,
                rulesProcessed: 0,
                rulesCompliant: 0,
                rulesNonCompliant: 0,
                rulesPartiallyCompliant: 0,
                rulesNotAssessed: propsValue.complianceConfiguration.rules.length,
                criticalFindings: 0,
                highRiskFindings: 0,
                mediumRiskFindings: 0,
                lowRiskFindings: 0,
                ruleResults: [],
                auditTrail: context.auditTrail,
                error: error.message,
                metadata: {
                    executedBy,
                    completedAt: new Date().toISOString(),
                    frameworks: propsValue.frameworks,
                    configVersion: propsValue.complianceConfiguration.version,
                    processingMode: propsValue.processingMode
                }
            };
        }
    }

    /**
     * Handle compliance check mode
     */
    private async handleComplianceCheck(
        context: SOPExecutionContext,
        props: ComplianceProps,
        startTime: Date
    ): Promise<ComplianceResult> {
        const config = props.complianceConfiguration;
        const ruleResults: RuleResult[] = [];
        let criticalFindings = 0;
        let highRiskFindings = 0;
        let mediumRiskFindings = 0;
        let lowRiskFindings = 0;

        // Create validation context
        const validationContext: ComplianceValidationContext = {
            configId: config.id,
            configVersion: config.version,
            userId: context.executedBy,
            timestamp: new Date().toISOString(),
            validationMode: props.testMode ? 'permissive' : 'strict',
            frameworks: props.frameworks,
            scope: props.scope,
            organizationProfile: props.organizationProfile
        };

        // Validate configuration
        const validationResult = await this.validator.validateCompliance(config, validationContext);

        // Process each rule
        for (const rule of config.rules) {
            if (!props.frameworks.includes(rule.framework)) {
                continue; // Skip rules not in selected frameworks
            }

            const ruleResult = await this.processComplianceRule(rule, props, validationContext);
            ruleResults.push(ruleResult);

            // Count findings by severity
            ruleResult.findings.forEach(finding => {
                switch (finding.severity) {
                    case RiskSeverity.CRITICAL:
                        criticalFindings++;
                        break;
                    case RiskSeverity.HIGH:
                        highRiskFindings++;
                        break;
                    case RiskSeverity.MEDIUM:
                        mediumRiskFindings++;
                        break;
                    case RiskSeverity.LOW:
                        lowRiskFindings++;
                        break;
                }
            });
        }

        // Calculate overall metrics
        const overallScore = this.helpers.calculateComplianceScore(ruleResults);
        const overallStatus = this.helpers.determineOverallStatus(ruleResults);

        // Collect evidence if enabled
        let evidenceCollected = [];
        if (props.evidenceCollectionEnabled) {
            for (const rule of config.rules.slice(0, 5)) { // Limit for demo
                const evidence = await this.helpers.collectEvidence(rule);
                evidenceCollected.push(...evidence);
            }
        }

        // Generate gap analysis
        let gapAnalysis;
        if (ruleResults.length > 0) {
            gapAnalysis = this.helpers.performGapAnalysis(
                config,
                ruleResults,
                props.frameworks[0] // Use first framework for demo
            );
        }

        // Log completion
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'compliance_check_completed',
            userId: context.executedBy,
            details: {
                overallScore,
                overallStatus,
                rulesProcessed: ruleResults.length,
                criticalFindings,
                highRiskFindings,
                validationScore: validationResult.score
            }
        });

        return {
            success: overallStatus !== ComplianceStatus.NON_COMPLIANT,
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            complianceId: config.id,
            executionTime: 0, // Will be calculated later
            processingMode: props.processingMode,
            frameworks: props.frameworks,
            overallStatus,
            overallScore,
            rulesProcessed: ruleResults.length,
            rulesCompliant: ruleResults.filter(r => r.status === ComplianceStatus.COMPLIANT).length,
            rulesNonCompliant: ruleResults.filter(r => r.status === ComplianceStatus.NON_COMPLIANT).length,
            rulesPartiallyCompliant: ruleResults.filter(r => r.status === ComplianceStatus.PARTIALLY_COMPLIANT).length,
            rulesNotAssessed: Math.max(0, config.rules.length - ruleResults.length),
            criticalFindings,
            highRiskFindings,
            mediumRiskFindings,
            lowRiskFindings,
            ruleResults,
            gapAnalysis,
            evidenceCollected: evidenceCollected.length > 0 ? evidenceCollected : undefined,
            auditTrail: context.auditTrail,
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                frameworks: props.frameworks,
                configVersion: config.version,
                processingMode: props.processingMode,
                validationScore: validationResult.score,
                qualityMetrics: validationResult.qualityMetrics
            }
        };
    }

    /**
     * Handle risk assessment mode
     */
    private async handleRiskAssessment(
        context: SOPExecutionContext,
        props: ComplianceProps
    ): Promise<ComplianceResult> {
        const config = props.complianceConfiguration;
        const riskAssessments = [];

        // Perform risk assessment for each rule
        for (const rule of config.rules.slice(0, 10)) { // Limit for demo
            const riskAssessment = this.helpers.assessComplianceRisk(rule, undefined, props.organizationProfile);
            riskAssessments.push(riskAssessment);
        }

        // Generate mock rule results for risk assessment
        const ruleResults: RuleResult[] = config.rules.slice(0, 10).map(rule => ({
            ruleId: rule.id,
            framework: rule.framework,
            title: rule.title,
            status: Math.random() > 0.3 ? ComplianceStatus.COMPLIANT : ComplianceStatus.NON_COMPLIANT,
            score: Math.floor(Math.random() * 40) + 60, // 60-100
            severity: rule.severity,
            findings: [],
            evidence: [],
            testResults: [],
            lastAssessed: new Date().toISOString(),
            remediationItems: []
        }));

        const overallScore = this.helpers.calculateComplianceScore(ruleResults);
        const overallStatus = this.helpers.determineOverallStatus(ruleResults);

        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'risk_assessment_completed',
            userId: context.executedBy,
            details: {
                riskAssessmentsGenerated: riskAssessments.length,
                overallRiskScore: riskAssessments.reduce((sum, r) => sum + r.riskScore, 0) / riskAssessments.length
            }
        });

        return {
            success: true,
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            complianceId: config.id,
            executionTime: 0,
            processingMode: props.processingMode,
            frameworks: props.frameworks,
            overallStatus,
            overallScore,
            rulesProcessed: ruleResults.length,
            rulesCompliant: ruleResults.filter(r => r.status === ComplianceStatus.COMPLIANT).length,
            rulesNonCompliant: ruleResults.filter(r => r.status === ComplianceStatus.NON_COMPLIANT).length,
            rulesPartiallyCompliant: 0,
            rulesNotAssessed: 0,
            criticalFindings: 0,
            highRiskFindings: 0,
            mediumRiskFindings: 0,
            lowRiskFindings: 0,
            ruleResults,
            riskAssessment: riskAssessments[0], // Return first assessment
            auditTrail: context.auditTrail,
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                frameworks: props.frameworks,
                configVersion: config.version,
                processingMode: props.processingMode,
                totalRiskAssessments: riskAssessments.length
            }
        };
    }

    /**
     * Handle continuous monitoring mode
     */
    private async handleContinuousMonitoring(
        context: SOPExecutionContext,
        props: ComplianceProps
    ): Promise<ComplianceResult> {
        const config = props.complianceConfiguration;
        
        // Generate monitoring metrics
        const metrics = this.helpers.monitorCompliance(config, props.monitoringConfig!);

        // Create monitoring result
        const result: ComplianceResult = {
            success: true,
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            complianceId: config.id,
            executionTime: 0,
            processingMode: props.processingMode,
            frameworks: props.frameworks,
            overallStatus: ComplianceStatus.UNDER_REVIEW,
            overallScore: metrics.find(m => m.name === 'Overall Compliance Rate')?.value || 0,
            rulesProcessed: config.rules.length,
            rulesCompliant: 0,
            rulesNonCompliant: 0,
            rulesPartiallyCompliant: 0,
            rulesNotAssessed: 0,
            criticalFindings: metrics.find(m => m.name === 'Critical Findings')?.value || 0,
            highRiskFindings: 0,
            mediumRiskFindings: 0,
            lowRiskFindings: 0,
            ruleResults: [],
            auditTrail: context.auditTrail,
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                frameworks: props.frameworks,
                configVersion: config.version,
                processingMode: props.processingMode,
                monitoringMetrics: metrics
            }
        };

        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'monitoring_cycle_completed',
            userId: context.executedBy,
            details: {
                metricsGenerated: metrics.length,
                overallComplianceRate: result.overallScore,
                criticalFindings: result.criticalFindings
            }
        });

        return result;
    }

    /**
     * Handle audit preparation mode
     */
    private async handleAuditPreparation(
        context: SOPExecutionContext,
        props: ComplianceProps
    ): Promise<ComplianceResult> {
        const config = props.complianceConfiguration;
        
        // Simulate audit preparation
        const auditPackage = {
            frameworks: props.frameworks,
            evidenceItems: 25,
            policiesReviewed: 15,
            controlsTested: 30,
            findingsDocumented: 5,
            remediationPlan: true
        };

        const result: ComplianceResult = {
            success: true,
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            complianceId: config.id,
            executionTime: 0,
            processingMode: props.processingMode,
            frameworks: props.frameworks,
            overallStatus: ComplianceStatus.UNDER_REVIEW,
            overallScore: 85, // Mock audit readiness score
            rulesProcessed: config.rules.length,
            rulesCompliant: Math.floor(config.rules.length * 0.8),
            rulesNonCompliant: Math.floor(config.rules.length * 0.1),
            rulesPartiallyCompliant: Math.floor(config.rules.length * 0.1),
            rulesNotAssessed: 0,
            criticalFindings: 2,
            highRiskFindings: 5,
            mediumRiskFindings: 8,
            lowRiskFindings: 12,
            ruleResults: [],
            auditTrail: context.auditTrail,
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                frameworks: props.frameworks,
                configVersion: config.version,
                processingMode: props.processingMode,
                auditPackage
            }
        };

        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'audit_preparation_completed',
            userId: context.executedBy,
            details: auditPackage
        });

        return result;
    }

    /**
     * Handle remediation mode
     */
    private async handleRemediation(
        context: SOPExecutionContext,
        props: ComplianceProps
    ): Promise<ComplianceResult> {
        const config = props.complianceConfiguration;
        
        // Create mock gap analysis for remediation
        const mockGapAnalysis = this.helpers.performGapAnalysis(
            config,
            [], // Empty for mock
            props.frameworks[0]
        );

        // Create remediation plan
        const remediationPlan = this.helpers.createRemediationPlan(
            {} as ComplianceResult, // Mock
            mockGapAnalysis
        );

        const result: ComplianceResult = {
            success: true,
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            complianceId: config.id,
            executionTime: 0,
            processingMode: props.processingMode,
            frameworks: props.frameworks,
            overallStatus: ComplianceStatus.IN_PROGRESS,
            overallScore: 70,
            rulesProcessed: config.rules.length,
            rulesCompliant: 0,
            rulesNonCompliant: 0,
            rulesPartiallyCompliant: 0,
            rulesNotAssessed: 0,
            criticalFindings: 0,
            highRiskFindings: 0,
            mediumRiskFindings: 0,
            lowRiskFindings: 0,
            ruleResults: [],
            remediationPlan,
            auditTrail: context.auditTrail,
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                frameworks: props.frameworks,
                configVersion: config.version,
                processingMode: props.processingMode,
                remediationItems: remediationPlan.totalItems,
                estimatedEffort: remediationPlan.estimatedEffort
            }
        };

        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'remediation_plan_created',
            userId: context.executedBy,
            details: {
                planId: remediationPlan.id,
                totalItems: remediationPlan.totalItems,
                estimatedEffort: remediationPlan.estimatedEffort,
                targetCompletion: remediationPlan.targetCompletionDate
            }
        });

        return result;
    }

    /**
     * Handle report generation mode
     */
    private async handleReportGeneration(
        context: SOPExecutionContext,
        props: ComplianceProps
    ): Promise<ComplianceResult> {
        const config = props.complianceConfiguration;
        
        // Create mock compliance results for report generation
        const mockResults: ComplianceResult = {
            success: true,
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            complianceId: config.id,
            executionTime: 0,
            processingMode: ComplianceProcessingMode.CHECK,
            frameworks: props.frameworks,
            overallStatus: ComplianceStatus.COMPLIANT,
            overallScore: 85,
            rulesProcessed: config.rules.length,
            rulesCompliant: Math.floor(config.rules.length * 0.85),
            rulesNonCompliant: Math.floor(config.rules.length * 0.05),
            rulesPartiallyCompliant: Math.floor(config.rules.length * 0.10),
            rulesNotAssessed: 0,
            criticalFindings: 1,
            highRiskFindings: 3,
            mediumRiskFindings: 7,
            lowRiskFindings: 15,
            ruleResults: [],
            auditTrail: [],
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                frameworks: props.frameworks,
                configVersion: config.version,
                processingMode: props.processingMode
            }
        };

        // Generate report
        const reportConfig = props.reportingConfig || {
            id: 'default-report',
            name: 'Compliance Assessment Report',
            description: 'Comprehensive compliance assessment report',
            frameworks: props.frameworks,
            scope: props.scope || [],
            includeDetails: true,
            includeEvidence: true,
            includeRecommendations: true,
            includeRiskAssessment: true,
            format: 'PDF',
            audience: 'COMPREHENSIVE',
            confidentiality: 'INTERNAL'
        };

        const reportResult = await this.helpers.generateComplianceReport(mockResults, reportConfig);

        const result: ComplianceResult = {
            ...mockResults,
            reportGenerated: reportResult,
            metadata: {
                ...mockResults.metadata,
                reportGenerated: true,
                reportId: reportResult.id,
                reportSize: reportResult.size
            }
        };

        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'compliance_report_generated',
            userId: context.executedBy,
            details: {
                reportId: reportResult.id,
                reportName: reportResult.name,
                reportFormat: reportResult.format,
                reportSize: reportResult.size
            }
        });

        return result;
    }

    /**
     * Handle certification mode
     */
    private async handleCertification(
        context: SOPExecutionContext,
        props: ComplianceProps
    ): Promise<ComplianceResult> {
        const config = props.complianceConfiguration;
        
        // Create mock results for certification
        const mockResults: ComplianceResult = {
            success: true,
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            complianceId: config.id,
            executionTime: 0,
            processingMode: props.processingMode,
            frameworks: props.frameworks,
            overallStatus: ComplianceStatus.COMPLIANT,
            overallScore: 92,
            rulesProcessed: config.rules.length,
            rulesCompliant: Math.floor(config.rules.length * 0.92),
            rulesNonCompliant: 0,
            rulesPartiallyCompliant: Math.floor(config.rules.length * 0.08),
            rulesNotAssessed: 0,
            criticalFindings: 0,
            highRiskFindings: 0,
            mediumRiskFindings: 2,
            lowRiskFindings: 5,
            ruleResults: [],
            auditTrail: context.auditTrail,
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                frameworks: props.frameworks,
                configVersion: config.version,
                processingMode: props.processingMode
            }
        };

        // Generate certificate if score is sufficient
        let certificate;
        if (mockResults.overallScore >= 75) {
            certificate = this.helpers.generateComplianceCertificate(
                props.frameworks[0], // Use first framework
                mockResults,
                props.organizationProfile?.name || 'Organization',
                props.scope || ['All Systems']
            );
        }

        const result: ComplianceResult = {
            ...mockResults,
            certificateGenerated: certificate
        };

        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'certification_completed',
            userId: context.executedBy,
            details: {
                certificateGenerated: !!certificate,
                certificateId: certificate?.id,
                certificationLevel: certificate?.certificationLevel,
                validUntil: certificate?.validUntil
            }
        });

        return result;
    }

    /**
     * Process individual compliance rule
     */
    private async processComplianceRule(
        rule: any,
        props: ComplianceProps,
        context: ComplianceValidationContext
    ): Promise<RuleResult> {
        // Simulate rule processing
        const status = Math.random() > 0.2 ? ComplianceStatus.COMPLIANT : 
                      Math.random() > 0.5 ? ComplianceStatus.PARTIALLY_COMPLIANT : 
                      ComplianceStatus.NON_COMPLIANT;
        
        const score = status === ComplianceStatus.COMPLIANT ? Math.floor(Math.random() * 20) + 80 :
                     status === ComplianceStatus.PARTIALLY_COMPLIANT ? Math.floor(Math.random() * 30) + 50 :
                     Math.floor(Math.random() * 50) + 10;

        const findings: ComplianceFinding[] = [];
        if (status !== ComplianceStatus.COMPLIANT) {
            findings.push({
                id: this.helpers.generateComplianceId('finding'),
                type: status === ComplianceStatus.NON_COMPLIANT ? 'VIOLATION' : 'WEAKNESS',
                severity: rule.severity,
                title: `${rule.title} - Compliance Issue`,
                description: `Issue identified in ${rule.title}`,
                evidence: [],
                impact: `Impact of non-compliance with ${rule.id}`,
                recommendation: `Remediate ${rule.title} to achieve compliance`,
                status: 'OPEN',
                identifiedAt: new Date().toISOString(),
                metadata: { ruleId: rule.id, framework: rule.framework }
            });
        }

        const evidence = props.evidenceCollectionEnabled ? 
            await this.helpers.collectEvidence(rule) : [];

        return {
            ruleId: rule.id,
            framework: rule.framework,
            title: rule.title,
            status,
            score,
            severity: rule.severity,
            findings,
            evidence,
            testResults: [],
            lastAssessed: new Date().toISOString(),
            remediationItems: []
        };
    }

    /**
     * Validate compliance configuration
     */
    private async validateComplianceConfiguration(
        config: ComplianceConfiguration,
        props: ComplianceProps
    ): Promise<void> {
        if (!config.id || !config.name) {
            throw new Error('Compliance configuration must have id and name');
        }
        
        if (!config.frameworks || config.frameworks.length === 0) {
            throw new Error('At least one compliance framework must be specified');
        }
        
        if (!config.rules || config.rules.length === 0) {
            throw new Error('At least one compliance rule must be defined');
        }
        
        // Validate selected frameworks are in configuration
        for (const framework of props.frameworks) {
            if (!config.frameworks.includes(framework)) {
                throw new Error(`Framework ${framework} not found in configuration`);
            }
        }
    }

    /**
     * Get piece configuration for Activepieces
     */
    public getPieceConfiguration(): any {
        const baseProps = this.getCommonSOPProperties();
        const specificProps = this.getSOPSpecificProperties();
        
        return {
            displayName: 'Compliance',
            description: 'Comprehensive compliance management with automated checking, risk assessment, gap analysis, evidence collection, and regulatory reporting',
            props: {
                ...baseProps,
                ...specificProps,
                // Additional common props
                priority: sopPriorityProp,
                assignedTo: assignedToProp,
                dueDate: dueDateProp,
                enableComplianceCheck: enableComplianceCheckProp,
                enableAuditTrail: enableAuditTrailProp,
                customVariables: customVariablesProp,
                tags: tagsProp,
                notes: notesProp,
                timeout: timeoutProp,
                retryAttempts: retryAttemptsProp,
                notificationSettings: notificationSettingsProp,
                escalationSettings: escalationSettingsProp,
                errorHandling: errorHandlingProp,
                stepDescription: stepDescriptionProp
            }
        };
    }

    /**
     * Custom pre-run hook for compliance
     */
    protected async onPreRun(context: SOPExecutionContext, propsValue: ComplianceProps): Promise<void> {
        // Validate configuration early
        await this.validateComplianceConfiguration(propsValue.complianceConfiguration, propsValue);
        
        // Log compliance initialization
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'compliance_initialized',
            userId: context.executedBy,
            details: {
                complianceId: propsValue.complianceConfiguration.id,
                processingMode: propsValue.processingMode,
                frameworks: propsValue.frameworks,
                rulesCount: propsValue.complianceConfiguration.rules.length,
                scope: propsValue.scope,
                testMode: propsValue.testMode,
                automationEnabled: propsValue.enableAutomation,
                monitoringEnabled: propsValue.enableMonitoring,
                evidenceCollectionEnabled: propsValue.evidenceCollectionEnabled
            }
        });
    }

    /**
     * Custom post-run hook for compliance
     */
    protected async onPostRun(context: SOPExecutionContext, result: ComplianceResult): Promise<void> {
        // Log completion
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'compliance_completed',
            userId: context.executedBy,
            details: {
                success: result.success,
                complianceId: result.complianceId,
                executionTime: result.executionTime,
                overallScore: result.overallScore,
                overallStatus: result.overallStatus,
                rulesProcessed: result.rulesProcessed,
                criticalFindings: result.criticalFindings,
                highRiskFindings: result.highRiskFindings,
                reportGenerated: !!result.reportGenerated,
                certificateGenerated: !!result.certificateGenerated
            }
        });
    }
}

/**
 * Create the Compliance action
 */
export const complianceAction = createAction({
    name: 'sop_compliance',
    displayName: 'Process Compliance',
    description: 'Comprehensive compliance management including automated checking, risk assessment, gap analysis, evidence collection, remediation planning, and regulatory reporting within SOP workflows',
    
    props: {
        // Core Processing Configuration
        processingMode: Property.StaticDropdown({
            displayName: 'Processing Mode',
            description: 'How compliance processing should be performed',
            required: true,
            defaultValue: ComplianceProcessingMode.CHECK,
            options: {
                options: [
                    { label: 'Compliance Check', value: ComplianceProcessingMode.CHECK },
                    { label: 'Risk Assessment', value: ComplianceProcessingMode.ASSESS },
                    { label: 'Continuous Monitoring', value: ComplianceProcessingMode.MONITOR },
                    { label: 'Audit Preparation', value: ComplianceProcessingMode.AUDIT },
                    { label: 'Remediation', value: ComplianceProcessingMode.REMEDIATE },
                    { label: 'Generate Report', value: ComplianceProcessingMode.REPORT },
                    { label: 'Certification', value: ComplianceProcessingMode.CERTIFY }
                ]
            }
        }),
        
        complianceConfiguration: Property.Json({
            displayName: 'Compliance Configuration',
            description: 'Complete compliance configuration including frameworks, rules, and settings',
            required: true,
            validators: [Validators.object]
        }),
        
        frameworks: Property.MultiSelectDropdown({
            displayName: 'Compliance Frameworks',
            description: 'Select compliance frameworks to assess',
            required: true,
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
        
        testMode: Property.Checkbox({
            displayName: 'Test Mode',
            description: 'Enable test mode for compliance assessment',
            required: false,
            defaultValue: false
        }),
        
        enableAutomation: Property.Checkbox({
            displayName: 'Enable Automation',
            description: 'Enable automated compliance checking',
            required: false,
            defaultValue: true
        }),
        
        enableMonitoring: Property.Checkbox({
            displayName: 'Enable Monitoring',
            description: 'Enable continuous compliance monitoring',
            required: false,
            defaultValue: true
        }),
        
        evidenceCollectionEnabled: Property.Checkbox({
            displayName: 'Evidence Collection',
            description: 'Automatically collect compliance evidence',
            required: false,
            defaultValue: true
        }),
        
        // SOP Common Properties
        priority: sopPriorityProp,
        assignedTo: assignedToProp,
        dueDate: dueDateProp,
        enableComplianceCheck: enableComplianceCheckProp,
        enableAuditTrail: enableAuditTrailProp,
        customVariables: customVariablesProp,
        tags: tagsProp,
        notes: notesProp,
        timeout: timeoutProp,
        retryAttempts: retryAttemptsProp,
        notificationSettings: notificationSettingsProp,
        escalationSettings: escalationSettingsProp,
        errorHandling: errorHandlingProp,
        stepDescription: stepDescriptionProp
    },
    
    async run(context) {
        const { propsValue, run: { id: executionId } } = context;
        
        // Create Compliance piece instance
        const compliancePiece = new CompliancePiece({
            displayName: 'Compliance',
            description: propsValue.stepDescription || 'SOP Compliance processing',
            sopPieceType: SOPPieceType.COMPLIANCE_CHECK,
            sopCategory: SOPPieceCategory.COMPLIANCE,
            priority: propsValue.priority,
            complianceRequired: propsValue.enableComplianceCheck,
            auditTrailRequired: propsValue.enableAuditTrail,
            tags: propsValue.tags || [],
            supportedFrameworks: Object.values(ComplianceFramework),
            maxRulesPerAssessment: 1000,
            enableAutomation: propsValue.enableAutomation,
            enableRealTimeMonitoring: propsValue.enableMonitoring,
            enableReporting: true,
            defaultRiskThreshold: RiskSeverity.MEDIUM
        });
        
        // Execute the compliance processing
        const result = await compliancePiece.execute(propsValue, 'system_user'); // In real implementation, get actual user ID
        
        return result;
    }
});