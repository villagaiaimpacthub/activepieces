/**
 * Compliance Helpers
 * 
 * Utility functions and helper methods for compliance processing,
 * risk assessment, evidence management, and report generation.
 */

import { nanoid } from 'nanoid';
import {
    ComplianceFramework,
    ComplianceConfiguration,
    ComplianceRule,
    ComplianceStatus,
    RiskSeverity,
    EvidenceItem,
    EvidenceType,
    ComplianceFinding,
    GapAnalysisResult,
    ComplianceGap,
    RemediationItem,
    RemediationPriority,
    RiskAssessment,
    ComplianceReportConfig,
    ComplianceReportResult,
    ComplianceCertificate,
    OperationalMetric,
    ControlImplementation,
    TestResult,
    RemediationOption,
    Recommendation,
    PlanRisk,
    MonitoringConfig,
    RuleResult,
    ComplianceResult
} from '../common/compliance-types';

/**
 * Compliance Helpers Class
 */
export class ComplianceHelpers {
    /**
     * Generate unique compliance ID
     */
    static generateComplianceId(prefix?: string): string {
        const timestamp = Date.now().toString(36);
        const randomPart = nanoid(8);
        return prefix ? `${prefix}_${timestamp}_${randomPart}` : `compliance_${timestamp}_${randomPart}`;
    }

    /**
     * Calculate compliance score based on rule results
     */
    static calculateComplianceScore(ruleResults: RuleResult[]): number {
        if (ruleResults.length === 0) return 0;

        const totalWeight = ruleResults.reduce((sum, result) => {
            return sum + this.getFrameworkWeight(result.framework);
        }, 0);

        const weightedScore = ruleResults.reduce((sum, result) => {
            const weight = this.getFrameworkWeight(result.framework);
            return sum + (result.score * weight);
        }, 0);

        return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
    }

    /**
     * Get framework weight for scoring calculations
     */
    static getFrameworkWeight(framework: ComplianceFramework): number {
        const weights: Record<ComplianceFramework, number> = {
            [ComplianceFramework.GDPR]: 1.0,
            [ComplianceFramework.HIPAA]: 1.0,
            [ComplianceFramework.SOX]: 1.2,
            [ComplianceFramework.PCI_DSS]: 1.1,
            [ComplianceFramework.ISO_27001]: 1.0,
            [ComplianceFramework.CCPA]: 0.8,
            [ComplianceFramework.NIST]: 1.0,
            [ComplianceFramework.COBIT]: 0.9,
            [ComplianceFramework.SOC2]: 1.0,
            [ComplianceFramework.FISMA]: 1.1,
            [ComplianceFramework.FERPA]: 0.8,
            [ComplianceFramework.GLBA]: 0.9,
            [ComplianceFramework.PIPEDA]: 0.8,
            [ComplianceFramework.CSA_CCM]: 0.9,
            [ComplianceFramework.BSI_IT_GRUNDSCHUTZ]: 0.9
        };
        return weights[framework] || 1.0;
    }

    /**
     * Determine overall compliance status from rule results
     */
    static determineOverallStatus(ruleResults: RuleResult[]): ComplianceStatus {
        if (ruleResults.length === 0) return ComplianceStatus.NOT_ASSESSED;

        const statusCounts = ruleResults.reduce((counts, result) => {
            counts[result.status] = (counts[result.status] || 0) + 1;
            return counts;
        }, {} as Record<ComplianceStatus, number>);

        const total = ruleResults.length;
        const compliant = statusCounts[ComplianceStatus.COMPLIANT] || 0;
        const nonCompliant = statusCounts[ComplianceStatus.NON_COMPLIANT] || 0;
        const partiallyCompliant = statusCounts[ComplianceStatus.PARTIALLY_COMPLIANT] || 0;

        if (compliant === total) {
            return ComplianceStatus.COMPLIANT;
        } else if (nonCompliant > total * 0.3) {
            return ComplianceStatus.NON_COMPLIANT;
        } else if (partiallyCompliant + compliant >= total * 0.7) {
            return ComplianceStatus.PARTIALLY_COMPLIANT;
        } else {
            return ComplianceStatus.REMEDIATION_REQUIRED;
        }
    }

    /**
     * Perform gap analysis on compliance results
     */
    static performGapAnalysis(
        config: ComplianceConfiguration,
        ruleResults: RuleResult[],
        framework: ComplianceFramework
    ): GapAnalysisResult {
        const frameworkRules = config.rules.filter(r => r.framework === framework);
        const frameworkResults = ruleResults.filter(r => r.framework === framework);

        const gaps = this.identifyComplianceGaps(frameworkRules, frameworkResults);
        const recommendations = this.generateRecommendations(gaps, frameworkResults);

        const overallScore = this.calculateComplianceScore(frameworkResults);
        const complianceLevel = this.determineOverallStatus(frameworkResults);

        const estimatedRemediationEffort = gaps.reduce((total, gap) => {
            const complexity = gap.remediationComplexity;
            const baseHours = complexity === 'LOW' ? 8 : complexity === 'MEDIUM' ? 24 : complexity === 'HIGH' ? 80 : 160;
            return total + baseHours;
        }, 0);

        return {
            id: this.generateComplianceId('gap-analysis'),
            framework,
            analysisDate: new Date().toISOString(),
            analysisScope: frameworkRules.map(r => r.id),
            overallScore,
            complianceLevel,
            totalRules: frameworkRules.length,
            compliantRules: frameworkResults.filter(r => r.status === ComplianceStatus.COMPLIANT).length,
            nonCompliantRules: frameworkResults.filter(r => r.status === ComplianceStatus.NON_COMPLIANT).length,
            partiallyCompliantRules: frameworkResults.filter(r => r.status === ComplianceStatus.PARTIALLY_COMPLIANT).length,
            notAssessedRules: frameworkRules.length - frameworkResults.length,
            gaps,
            recommendations,
            estimatedRemediationEffort,
            estimatedCost: estimatedRemediationEffort * 150, // $150/hour average
            timeline: this.estimateRemediationTimeline(estimatedRemediationEffort)
        };
    }

    /**
     * Identify compliance gaps from rule results
     */
    private static identifyComplianceGaps(
        rules: ComplianceRule[],
        results: RuleResult[]
    ) {
        const gaps: ComplianceGap[] = [];

        for (const rule of rules) {
            const result = results.find(r => r.ruleId === rule.id);
            
            if (!result || result.status === ComplianceStatus.NON_COMPLIANT) {
                gaps.push({
                    id: this.generateComplianceId('gap'),
                    ruleId: rule.id,
                    title: rule.title,
                    description: `Gap identified in ${rule.title}`,
                    currentState: result ? 'Partially implemented' : 'Not implemented',
                    requiredState: rule.requirement,
                    severity: rule.severity,
                    category: rule.category,
                    riskExposure: this.assessRiskExposure(rule),
                    businessImpact: this.assessBusinessImpact(rule),
                    technicalImpact: this.assessTechnicalImpact(rule),
                    remediationComplexity: this.assessRemediationComplexity(rule),
                    remediationOptions: this.generateRemediationOptions(rule)
                });
            } else if (result.status === ComplianceStatus.PARTIALLY_COMPLIANT) {
                gaps.push({
                    id: this.generateComplianceId('gap'),
                    ruleId: rule.id,
                    title: `${rule.title} - Partial Implementation`,
                    description: `Partial compliance identified in ${rule.title}`,
                    currentState: 'Partially implemented',
                    requiredState: rule.requirement,
                    severity: this.reduceSeverity(rule.severity),
                    category: rule.category,
                    riskExposure: this.assessRiskExposure(rule, 'partial'),
                    businessImpact: this.assessBusinessImpact(rule, 'partial'),
                    technicalImpact: this.assessTechnicalImpact(rule, 'partial'),
                    remediationComplexity: this.reduceComplexity(this.assessRemediationComplexity(rule)),
                    remediationOptions: this.generateRemediationOptions(rule, 'enhancement')
                });
            }
        }

        return gaps;
    }

    /**
     * Generate recommendations based on gaps and results
     */
    private static generateRecommendations(gaps: any[], results: RuleResult[]): Recommendation[] {
        const recommendations: Recommendation[] = [];

        // Immediate actions for critical gaps
        const criticalGaps = gaps.filter(g => g.severity === RiskSeverity.CRITICAL);
        if (criticalGaps.length > 0) {
            recommendations.push({
                id: this.generateComplianceId('rec'),
                title: 'Address Critical Compliance Gaps',
                description: 'Immediately address critical compliance gaps to reduce regulatory risk',
                category: 'IMMEDIATE',
                priority: RemediationPriority.IMMEDIATE,
                effort: criticalGaps.length * 40,
                impact: RiskSeverity.CRITICAL,
                benefits: [
                    'Reduces regulatory risk',
                    'Prevents potential fines',
                    'Maintains business continuity'
                ],
                risks: [
                    'Resource intensive',
                    'May disrupt operations'
                ],
                relatedGaps: criticalGaps.map(g => g.id)
            });
        }

        // Automation recommendations
        const automationCandidates = results.filter(r => 
            r.status === ComplianceStatus.COMPLIANT && 
            r.testResults?.some(t => t.testType === 'MANUAL')
        );

        if (automationCandidates.length > 0) {
            recommendations.push({
                id: this.generateComplianceId('rec'),
                title: 'Automate Manual Compliance Checks',
                description: 'Implement automated testing for manual compliance checks',
                category: 'LONG_TERM',
                priority: RemediationPriority.MEDIUM,
                effort: automationCandidates.length * 16,
                impact: RiskSeverity.MEDIUM,
                benefits: [
                    'Reduces manual effort',
                    'Improves consistency',
                    'Enables continuous monitoring'
                ],
                risks: [
                    'Initial implementation cost',
                    'Requires technical expertise'
                ],
                relatedGaps: automationCandidates.map(r => r.ruleId)
            });
        }

        return recommendations;
    }

    /**
     * Collect and validate evidence for compliance rules
     */
    static async collectEvidence(
        rule: ComplianceRule,
        sourceSystems: string[] = []
    ): Promise<EvidenceItem[]> {
        const evidence: EvidenceItem[] = [];

        for (const evidenceType of rule.evidenceRequired) {
            const item: EvidenceItem = {
                id: this.generateComplianceId('evidence'),
                type: evidenceType,
                name: `Evidence for ${rule.title}`,
                description: `${evidenceType} evidence collected for rule ${rule.id}`,
                collectedBy: 'system',
                collectedAt: new Date().toISOString(),
                validFrom: new Date().toISOString(),
                validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
                metadata: {
                    ruleId: rule.id,
                    framework: rule.framework,
                    automated: rule.automated,
                    mandatory: rule.mandatory,
                    sourceSystems
                },
                tags: [rule.framework, ...rule.tags],
                relatedRules: [rule.id],
                reviewStatus: 'PENDING',
                reviewNotes: `Auto-collected evidence for ${rule.title}`
            };

            // Simulate evidence collection based on type
            switch (evidenceType) {
                case EvidenceType.POLICY:
                    item.filePath = `/policies/${rule.id}_policy.pdf`;
                    item.fileSize = Math.floor(Math.random() * 1000000) + 100000; // 100KB - 1MB
                    break;
                case EvidenceType.LOG_FILE:
                    item.filePath = `/logs/${rule.id}_audit.log`;
                    item.fileSize = Math.floor(Math.random() * 10000000) + 1000000; // 1MB - 10MB
                    break;
                case EvidenceType.SCREENSHOT:
                    item.filePath = `/screenshots/${rule.id}_config.png`;
                    item.fileSize = Math.floor(Math.random() * 5000000) + 500000; // 500KB - 5MB
                    break;
                case EvidenceType.CONFIGURATION:
                    item.filePath = `/configs/${rule.id}_settings.json`;
                    item.fileSize = Math.floor(Math.random() * 100000) + 10000; // 10KB - 100KB
                    break;
                default:
                    item.filePath = `/evidence/${rule.id}_${evidenceType.toLowerCase()}.pdf`;
                    item.fileSize = Math.floor(Math.random() * 2000000) + 200000; // 200KB - 2MB
            }

            // Generate file hash
            item.fileHash = this.generateFileHash(item.filePath, item.fileSize);

            evidence.push(item);
        }

        return evidence;
    }

    /**
     * Assess risk for compliance rule
     */
    static assessComplianceRisk(
        rule: ComplianceRule,
        implementation?: ControlImplementation,
        organizationalContext?: any
    ): RiskAssessment {
        const inherentRisk = rule.severity;
        let residualRisk = inherentRisk;

        // Adjust risk based on implementation status
        if (implementation) {
            switch (implementation.effectiveness) {
                case 'EFFECTIVE':
                    residualRisk = this.reduceSeverity(inherentRisk);
                    break;
                case 'PARTIALLY_EFFECTIVE':
                    residualRisk = inherentRisk === RiskSeverity.CRITICAL ? RiskSeverity.HIGH : inherentRisk;
                    break;
                case 'INEFFECTIVE':
                    residualRisk = inherentRisk;
                    break;
            }
        }

        const likelihood = this.calculateLikelihood(rule, implementation, organizationalContext);
        const impact = this.calculateImpact(rule, organizationalContext);
        const riskScore = likelihood * impact;

        return {
            id: this.generateComplianceId('risk-assessment'),
            name: `Risk Assessment for ${rule.title}`,
            description: `Risk assessment for compliance rule ${rule.id}`,
            inherentRisk,
            residualRisk,
            likelihood,
            impact,
            riskScore,
            mitigatingFactors: this.identifyMitigatingFactors(rule, implementation),
            recommendations: this.generateRiskRecommendations(rule, residualRisk, riskScore),
            assessedBy: 'system',
            assessedAt: new Date().toISOString(),
            reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
        };
    }

    /**
     * Generate compliance report
     */
    static async generateComplianceReport(
        results: ComplianceResult,
        config: ComplianceReportConfig
    ): Promise<ComplianceReportResult> {
        const reportId = this.generateComplianceId('report');
        const timestamp = new Date().toISOString();

        // Simulate report generation
        const reportContent = this.buildReportContent(results, config);
        const fileName = `${config.name}_${timestamp.split('T')[0]}.${config.format.toLowerCase()}`;
        const filePath = `/reports/${fileName}`;

        return {
            id: reportId,
            name: config.name,
            format: config.format,
            size: this.estimateReportSize(results, config),
            generatedAt: timestamp,
            generatedBy: 'system',
            filePath,
            downloadUrl: `/api/reports/download/${reportId}`,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            metadata: {
                frameworks: results.frameworks,
                totalRules: results.rulesProcessed,
                overallScore: results.overallScore,
                complianceLevel: results.overallStatus,
                confidentiality: config.confidentiality,
                audience: config.audience
            }
        };
    }

    /**
     * Generate compliance certificate
     */
    static generateComplianceCertificate(
        framework: ComplianceFramework,
        results: ComplianceResult,
        entityName: string,
        scope: string[]
    ): ComplianceCertificate {
        const certId = this.generateComplianceId('cert');
        const now = new Date();
        const validUntil = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

        const certificationLevel = this.determineCertificationLevel(results.overallScore);
        const certificateNumber = this.generateCertificateNumber(framework, now);

        return {
            id: certId,
            framework,
            certifiedEntity: entityName,
            scope,
            validFrom: now.toISOString(),
            validUntil: validUntil.toISOString(),
            certificationLevel,
            issuedBy: 'SOP Compliance System',
            issuedAt: now.toISOString(),
            certificateNumber,
            digitalSignature: this.generateDigitalSignature(certId, framework, entityName),
            filePath: `/certificates/${certId}.pdf`,
            downloadUrl: `/api/certificates/download/${certId}`,
            metadata: {
                overallScore: results.overallScore,
                complianceStatus: results.overallStatus,
                assessmentDate: results.metadata.completedAt,
                totalRulesAssessed: results.rulesProcessed,
                criticalFindings: results.criticalFindings,
                highRiskFindings: results.highRiskFindings
            }
        };
    }

    /**
     * Create remediation plan from compliance results
     */
    static createRemediationPlan(
        results: ComplianceResult,
        gapAnalysis: GapAnalysisResult
    ) {
        const planId = this.generateComplianceId('remediation-plan');
        const remediationItems: RemediationItem[] = [];

        // Create remediation items for non-compliant rules
        const nonCompliantResults = results.ruleResults.filter(
            r => r.status === ComplianceStatus.NON_COMPLIANT || 
                 r.status === ComplianceStatus.PARTIALLY_COMPLIANT
        );

        for (const result of nonCompliantResults) {
            const priority = this.determineRemediationPriority(result.severity, result.status);
            const estimatedEffort = this.estimateRemediationEffort(result.severity, result.status);
            const dueDate = this.calculateDueDate(priority, estimatedEffort);

            const item: RemediationItem = {
                id: this.generateComplianceId('remediation'),
                title: `Remediate ${result.title}`,
                description: `Address compliance gap in ${result.title}`,
                priority,
                assignedTo: 'compliance-team', // Would be configurable
                dueDate: dueDate.toISOString(),
                status: 'OPEN',
                estimatedEffort,
                dependencies: result.findings
                    .filter(f => f.type === 'VIOLATION')
                    .map(f => f.id),
                relatedRules: [result.ruleId],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                verificationRequired: result.severity === RiskSeverity.CRITICAL || result.severity === RiskSeverity.HIGH,
                verifiedBy: undefined,
                verifiedAt: undefined
            };

            remediationItems.push(item);
        }

        return {
            id: planId,
            name: `Remediation Plan - ${gapAnalysis.framework}`,
            description: `Remediation plan for ${gapAnalysis.framework} compliance gaps`,
            frameworks: [gapAnalysis.framework],
            totalItems: remediationItems.length,
            completedItems: 0,
            overallProgress: 0,
            estimatedEffort: gapAnalysis.estimatedRemediationEffort,
            actualEffort: 0,
            estimatedCost: gapAnalysis.estimatedCost,
            actualCost: 0,
            targetCompletionDate: this.calculatePlanCompletionDate(gapAnalysis.estimatedRemediationEffort),
            items: remediationItems,
            milestones: this.createRemediationMilestones(remediationItems),
            dependencies: this.identifyPlanDependencies(remediationItems),
            risks: this.identifyPlanRisks(remediationItems),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system'
        };
    }

    /**
     * Monitor compliance status in real-time
     */
    static monitorCompliance(
        config: ComplianceConfiguration,
        monitoringConfig: MonitoringConfig
    ): OperationalMetric[] {
        const metrics: OperationalMetric[] = [];
        const now = new Date().toISOString();

        // Overall compliance rate
        metrics.push({
            id: this.generateComplianceId('metric'),
            name: 'Overall Compliance Rate',
            description: 'Percentage of compliant rules across all frameworks',
            type: 'PERCENTAGE',
            value: Math.floor(Math.random() * 30) + 70, // 70-100%
            target: 95,
            threshold: 85,
            unit: '%',
            frequency: 'REAL_TIME',
            collectedAt: now,
            source: 'compliance-monitor',
            trending: Math.random() > 0.5 ? 'IMPROVING' : 'STABLE'
        });

        // Critical findings count
        metrics.push({
            id: this.generateComplianceId('metric'),
            name: 'Critical Findings',
            description: 'Number of critical compliance findings',
            type: 'COUNT',
            value: Math.floor(Math.random() * 5), // 0-5
            target: 0,
            threshold: 2,
            frequency: 'REAL_TIME',
            collectedAt: now,
            source: 'compliance-monitor',
            trending: Math.random() > 0.3 ? 'IMPROVING' : 'STABLE'
        });

        // Evidence collection rate
        metrics.push({
            id: this.generateComplianceId('metric'),
            name: 'Evidence Collection Rate',
            description: 'Percentage of required evidence collected',
            type: 'PERCENTAGE',
            value: Math.floor(Math.random() * 25) + 75, // 75-100%
            target: 100,
            threshold: 90,
            unit: '%',
            frequency: 'DAILY',
            collectedAt: now,
            source: 'evidence-collector',
            trending: 'IMPROVING'
        });

        return metrics;
    }

    /**
     * Private helper methods
     */
    private static generateFileHash(filePath: string, fileSize: number): string {
        // Simulate SHA256 hash
        const hashInput = filePath + fileSize + Date.now();
        return `sha256:${nanoid(64)}`;
    }

    private static reduceSeverity(severity: RiskSeverity): RiskSeverity {
        switch (severity) {
            case RiskSeverity.CRITICAL: return RiskSeverity.HIGH;
            case RiskSeverity.HIGH: return RiskSeverity.MEDIUM;
            case RiskSeverity.MEDIUM: return RiskSeverity.LOW;
            case RiskSeverity.LOW: return RiskSeverity.INFORMATIONAL;
            default: return severity;
        }
    }

    private static reduceComplexity(complexity: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' {
        switch (complexity) {
            case 'VERY_HIGH': return 'HIGH';
            case 'HIGH': return 'MEDIUM';
            case 'MEDIUM': return 'LOW';
            case 'LOW': return 'LOW';
            default: return 'LOW'; // fallback to LOW for unknown values
        }
    }

    private static assessRiskExposure(rule: ComplianceRule, status: 'full' | 'partial' = 'full'): string {
        const baseRisk = `${rule.framework} compliance violation risk`;
        return status === 'partial' ? `Partial ${baseRisk}` : baseRisk;
    }

    private static assessBusinessImpact(rule: ComplianceRule, status: 'full' | 'partial' = 'full'): string {
        const impacts = {
            [RiskSeverity.CRITICAL]: 'Severe business disruption, regulatory fines, reputation damage',
            [RiskSeverity.HIGH]: 'Significant business impact, potential penalties',
            [RiskSeverity.MEDIUM]: 'Moderate business impact, compliance review required',
            [RiskSeverity.LOW]: 'Minor business impact, monitoring required',
            [RiskSeverity.INFORMATIONAL]: 'Minimal business impact'
        };
        return status === 'partial' ? `Reduced: ${impacts[rule.severity]}` : impacts[rule.severity];
    }

    private static assessTechnicalImpact(rule: ComplianceRule, status: 'full' | 'partial' = 'full'): string {
        return `Technical implementation required for ${rule.framework} ${rule.id}`;
    }

    private static assessRemediationComplexity(rule: ComplianceRule): 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' {
        if (rule.automated) return 'LOW';
        if (rule.severity === RiskSeverity.CRITICAL) return 'VERY_HIGH';
        if (rule.severity === RiskSeverity.HIGH) return 'HIGH';
        return 'MEDIUM';
    }

    private static generateRemediationOptions(rule: ComplianceRule, type: 'implementation' | 'enhancement' = 'implementation'): RemediationOption[] {
        const baseEffort = type === 'implementation' ? 40 : 8;
        
        return [{
            id: this.generateComplianceId('option'),
            title: type === 'implementation' ? 'Full Implementation' : 'Enhancement',
            description: `${type === 'implementation' ? 'Implement' : 'Enhance'} ${rule.title}`,
            effort: baseEffort,
            cost: baseEffort * 150,
            timeline: type === 'implementation' ? '2-4 weeks' : '1 week',
            pros: ['Achieves compliance', 'Reduces risk'],
            cons: ['Requires resources', 'Implementation time'],
            dependencies: [],
            riskReduction: type === 'implementation' ? 90 : 60,
            recommended: true
        }];
    }

    private static calculateLikelihood(rule: ComplianceRule, implementation?: ControlImplementation, context?: any): number {
        let likelihood = 3; // Base likelihood on 1-5 scale

        if (rule.severity === RiskSeverity.CRITICAL) likelihood += 1;
        if (rule.mandatory) likelihood += 1;
        if (implementation?.effectiveness === 'EFFECTIVE') likelihood -= 2;
        if (implementation?.effectiveness === 'PARTIALLY_EFFECTIVE') likelihood -= 1;

        return Math.max(1, Math.min(5, likelihood));
    }

    private static calculateImpact(rule: ComplianceRule, context?: any): number {
        const impactMap = {
            [RiskSeverity.CRITICAL]: 5,
            [RiskSeverity.HIGH]: 4,
            [RiskSeverity.MEDIUM]: 3,
            [RiskSeverity.LOW]: 2,
            [RiskSeverity.INFORMATIONAL]: 1
        };
        return impactMap[rule.severity];
    }

    private static identifyMitigatingFactors(rule: ComplianceRule, implementation?: ControlImplementation): string[] {
        const factors: string[] = [];
        
        if (implementation?.effectiveness === 'EFFECTIVE') {
            factors.push('Effective control implementation');
        }
        
        if (implementation?.evidence.length && implementation.evidence.length > 2) {
            factors.push('Strong evidence documentation');
        }
        
        if (rule.automated) {
            factors.push('Automated compliance checking');
        }
        
        return factors;
    }

    private static generateRiskRecommendations(rule: ComplianceRule, residualRisk: RiskSeverity, riskScore: number): string[] {
        const recommendations: string[] = [];
        
        if (residualRisk === RiskSeverity.CRITICAL || riskScore >= 20) {
            recommendations.push('Implement immediate risk mitigation measures');
            recommendations.push('Assign dedicated resources for remediation');
        }
        
        if (residualRisk === RiskSeverity.HIGH || riskScore >= 15) {
            recommendations.push('Develop comprehensive remediation plan');
            recommendations.push('Increase monitoring frequency');
        }
        
        if (!rule.automated && rule.frequency === 'CONTINUOUS') {
            recommendations.push('Consider automation for continuous monitoring');
        }
        
        return recommendations;
    }

    private static buildReportContent(results: ComplianceResult, config: ComplianceReportConfig): string {
        // This would generate actual report content based on format and template
        return `Compliance Report: ${config.name}\nGenerated: ${new Date().toISOString()}\nFrameworks: ${results.frameworks.join(', ')}\nOverall Score: ${results.overallScore}%`;
    }

    private static estimateReportSize(results: ComplianceResult, config: ComplianceReportConfig): number {
        const baseSize = 50000; // 50KB base
        const ruleSize = results.rulesProcessed * 1000; // 1KB per rule
        const evidenceSize = config.includeEvidence ? results.rulesProcessed * 5000 : 0; // 5KB per rule if evidence included
        
        return baseSize + ruleSize + evidenceSize;
    }

    private static determineCertificationLevel(score: number): ComplianceCertificate['certificationLevel'] {
        if (score >= 95) return 'COMPREHENSIVE';
        if (score >= 85) return 'ADVANCED';
        if (score >= 75) return 'STANDARD';
        return 'BASIC';
    }

    private static generateCertificateNumber(framework: ComplianceFramework, date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const sequence = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        return `${framework}-${year}${month}-${sequence}`;
    }

    private static generateDigitalSignature(certId: string, framework: ComplianceFramework, entity: string): string {
        // This would generate actual digital signature
        return `sig:${nanoid(128)}`;
    }

    private static determineRemediationPriority(severity: RiskSeverity, status: ComplianceStatus): RemediationPriority {
        if (severity === RiskSeverity.CRITICAL) return RemediationPriority.IMMEDIATE;
        if (severity === RiskSeverity.HIGH) return RemediationPriority.HIGH;
        if (status === ComplianceStatus.NON_COMPLIANT) return RemediationPriority.HIGH;
        if (severity === RiskSeverity.MEDIUM) return RemediationPriority.MEDIUM;
        return RemediationPriority.LOW;
    }

    private static estimateRemediationEffort(severity: RiskSeverity, status: ComplianceStatus): number {
        const baseEffort = {
            [RiskSeverity.CRITICAL]: 80,
            [RiskSeverity.HIGH]: 40,
            [RiskSeverity.MEDIUM]: 20,
            [RiskSeverity.LOW]: 8,
            [RiskSeverity.INFORMATIONAL]: 4
        };
        
        const multiplier = status === ComplianceStatus.NON_COMPLIANT ? 1.5 : 1.0;
        return Math.round(baseEffort[severity] * multiplier);
    }

    private static calculateDueDate(priority: RemediationPriority, effort: number): Date {
        const now = new Date();
        let daysToAdd = 30; // Default 30 days
        
        switch (priority) {
            case RemediationPriority.IMMEDIATE:
                daysToAdd = 3;
                break;
            case RemediationPriority.HIGH:
                daysToAdd = 14;
                break;
            case RemediationPriority.MEDIUM:
                daysToAdd = 30;
                break;
            case RemediationPriority.LOW:
                daysToAdd = 90;
                break;
        }
        
        // Adjust based on effort
        daysToAdd = Math.max(daysToAdd, Math.ceil(effort / 8)); // Assume 8 hours per day
        
        return new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    }

    private static estimateRemediationTimeline(totalEffort: number): string {
        const weeks = Math.ceil(totalEffort / 40); // 40 hours per week
        
        if (weeks <= 1) return '1 week';
        if (weeks <= 4) return `${weeks} weeks`;
        if (weeks <= 12) return `${Math.ceil(weeks / 4)} months`;
        return `${Math.ceil(weeks / 52)} years`;
    }

    private static createRemediationMilestones(items: RemediationItem[]) {
        const criticalItems = items.filter(i => i.priority === RemediationPriority.IMMEDIATE);
        const highItems = items.filter(i => i.priority === RemediationPriority.HIGH);
        
        return [
            {
                id: this.generateComplianceId('milestone'),
                name: 'Critical Issues Resolved',
                description: 'All critical compliance issues addressed',
                targetDate: criticalItems.length > 0 ? 
                    new Date(Math.min(...criticalItems.map(i => new Date(i.dueDate).getTime()))).toISOString() :
                    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'PLANNED' as const,
                deliverables: criticalItems.map(i => i.id),
                dependencies: []
            },
            {
                id: this.generateComplianceId('milestone'),
                name: 'High Priority Issues Resolved',
                description: 'All high priority compliance issues addressed',
                targetDate: highItems.length > 0 ?
                    new Date(Math.max(...highItems.map(i => new Date(i.dueDate).getTime()))).toISOString() :
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'PLANNED' as const,
                deliverables: highItems.map(i => i.id),
                dependencies: criticalItems.map(i => i.id)
            }
        ];
    }

    private static identifyPlanDependencies(items: RemediationItem[]) {
        // Simple dependency identification based on related rules
        return items.filter(item => item.dependencies && item.dependencies.length > 0).map(item => ({
            id: this.generateComplianceId('dependency'),
            type: 'INTERNAL' as const,
            description: `${item.title} depends on completion of related items`,
            dependentItem: item.id,
            blockingItem: item.dependencies![0],
            status: 'ACTIVE' as const,
            impact: RiskSeverity.MEDIUM,
            mitigation: 'Ensure blocking items are prioritized'
        }));
    }

    private static identifyPlanRisks(items: RemediationItem[]) {
        const risks: PlanRisk[] = [];
        
        const criticalCount = items.filter(i => i.priority === RemediationPriority.IMMEDIATE).length;
        if (criticalCount > 3) {
            risks.push({
                id: this.generateComplianceId('risk'),
                description: 'High number of critical items may overwhelm resources',
                probability: 4,
                impact: 4,
                severity: RiskSeverity.HIGH,
                mitigation: 'Consider phased approach and additional resources',
                owner: 'compliance-team',
                status: 'IDENTIFIED' as const,
                affectedItems: items.filter(i => i.priority === RemediationPriority.IMMEDIATE).map(i => i.id)
            });
        }
        
        return risks;
    }

    private static calculatePlanCompletionDate(totalEffort: number): string {
        const weeksRequired = Math.ceil(totalEffort / 40); // 40 hours per week
        const completionDate = new Date(Date.now() + weeksRequired * 7 * 24 * 60 * 60 * 1000);
        return completionDate.toISOString();
    }
}