/**
 * Compliance Piece Types
 * 
 * Comprehensive type definitions for the SOP Compliance framework,
 * supporting multi-framework compliance checking, risk assessment,
 * gap analysis, and regulatory compliance tracking.
 */

/**
 * Supported Compliance Frameworks
 */
export enum ComplianceFramework {
    GDPR = 'GDPR',
    HIPAA = 'HIPAA',
    SOX = 'SOX',
    PCI_DSS = 'PCI_DSS',
    ISO_27001 = 'ISO_27001',
    CCPA = 'CCPA',
    NIST = 'NIST',
    COBIT = 'COBIT',
    SOC2 = 'SOC2',
    FISMA = 'FISMA',
    FERPA = 'FERPA',
    GLBA = 'GLBA',
    PIPEDA = 'PIPEDA',
    CSA_CCM = 'CSA_CCM',
    BSI_IT_GRUNDSCHUTZ = 'BSI_IT_GRUNDSCHUTZ'
}

/**
 * Compliance Processing Modes
 */
export enum ComplianceProcessingMode {
    CHECK = 'CHECK',
    ASSESS = 'ASSESS',
    MONITOR = 'MONITOR',
    AUDIT = 'AUDIT',
    REMEDIATE = 'REMEDIATE',
    REPORT = 'REPORT',
    CERTIFY = 'CERTIFY'
}

/**
 * Compliance Status Types
 */
export enum ComplianceStatus {
    COMPLIANT = 'COMPLIANT',
    NON_COMPLIANT = 'NON_COMPLIANT',
    PARTIALLY_COMPLIANT = 'PARTIALLY_COMPLIANT',
    NOT_ASSESSED = 'NOT_ASSESSED',
    IN_PROGRESS = 'IN_PROGRESS',
    UNDER_REVIEW = 'UNDER_REVIEW',
    REMEDIATION_REQUIRED = 'REMEDIATION_REQUIRED',
    EXCEPTION_GRANTED = 'EXCEPTION_GRANTED'
}

/**
 * Risk Severity Levels
 */
export enum RiskSeverity {
    CRITICAL = 'CRITICAL',
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW',
    INFORMATIONAL = 'INFORMATIONAL'
}

/**
 * Control Categories
 */
export enum ControlCategory {
    ADMINISTRATIVE = 'ADMINISTRATIVE',
    TECHNICAL = 'TECHNICAL',
    PHYSICAL = 'PHYSICAL',
    PREVENTIVE = 'PREVENTIVE',
    DETECTIVE = 'DETECTIVE',
    CORRECTIVE = 'CORRECTIVE',
    COMPENSATING = 'COMPENSATING'
}

/**
 * Evidence Types
 */
export enum EvidenceType {
    DOCUMENT = 'DOCUMENT',
    SCREENSHOT = 'SCREENSHOT',
    LOG_FILE = 'LOG_FILE',
    POLICY = 'POLICY',
    PROCEDURE = 'PROCEDURE',
    CERTIFICATE = 'CERTIFICATE',
    AUDIT_REPORT = 'AUDIT_REPORT',
    ATTESTATION = 'ATTESTATION',
    CONFIGURATION = 'CONFIGURATION',
    CODE_REVIEW = 'CODE_REVIEW'
}

/**
 * Remediation Priority
 */
export enum RemediationPriority {
    IMMEDIATE = 'IMMEDIATE',
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW',
    PLANNED = 'PLANNED'
}

/**
 * Compliance Rule Structure
 */
export interface ComplianceRule {
    id: string;
    framework: ComplianceFramework;
    category: ControlCategory;
    title: string;
    description: string;
    requirement: string;
    severity: RiskSeverity;
    mandatory: boolean;
    automated: boolean;
    frequency: 'CONTINUOUS' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'ON_DEMAND';
    tags: string[];
    relatedControls?: string[];
    evidenceRequired: EvidenceType[];
    validationScript?: string;
    remediationGuidance?: string;
    exceptions?: ComplianceException[];
}

/**
 * Compliance Exception
 */
export interface ComplianceException {
    id: string;
    ruleId: string;
    reason: string;
    approvedBy: string;
    approvedAt: string;
    expiresAt?: string;
    conditions?: string[];
    compensatingControls?: string[];
    riskAssessment: RiskAssessment;
}

/**
 * Risk Assessment
 */
export interface RiskAssessment {
    id: string;
    name: string;
    description: string;
    inherentRisk: RiskSeverity;
    residualRisk: RiskSeverity;
    likelihood: number; // 1-5 scale
    impact: number; // 1-5 scale
    riskScore: number; // calculated score
    mitigatingFactors: string[];
    recommendations: string[];
    assessedBy: string;
    assessedAt: string;
    reviewDate: string;
}

/**
 * Evidence Item
 */
export interface EvidenceItem {
    id: string;
    type: EvidenceType;
    name: string;
    description: string;
    filePath?: string;
    fileSize?: number;
    fileHash?: string;
    collectedBy: string;
    collectedAt: string;
    validFrom: string;
    validUntil?: string;
    metadata: Record<string, any>;
    tags: string[];
    relatedRules: string[];
    reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
}

/**
 * Control Implementation
 */
export interface ControlImplementation {
    id: string;
    ruleId: string;
    status: ComplianceStatus;
    implementedBy: string;
    implementedAt: string;
    lastTested?: string;
    testResults?: TestResult[];
    effectiveness: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'INEFFECTIVE' | 'NOT_TESTED';
    evidence: string[]; // Evidence item IDs
    gaps: string[];
    remediationItems: RemediationItem[];
    operationalMetrics?: OperationalMetric[];
}

/**
 * Test Result
 */
export interface TestResult {
    id: string;
    testType: 'AUTOMATED' | 'MANUAL' | 'WALKTHROUGH' | 'INSPECTION';
    testDate: string;
    testProcedure: string;
    result: 'PASS' | 'FAIL' | 'PARTIAL' | 'NOT_APPLICABLE';
    findings: string[];
    evidence: string[];
    testedBy: string;
    reviewedBy?: string;
}

/**
 * Remediation Item
 */
export interface RemediationItem {
    id: string;
    title: string;
    description: string;
    priority: RemediationPriority;
    assignedTo: string;
    dueDate: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'DEFERRED';
    estimatedEffort?: number; // in hours
    actualEffort?: number;
    dependencies?: string[];
    relatedRules: string[];
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    verificationRequired: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
}

/**
 * Operational Metric
 */
export interface OperationalMetric {
    id: string;
    name: string;
    description: string;
    type: 'PERCENTAGE' | 'COUNT' | 'DURATION' | 'RATIO' | 'SCORE';
    value: number;
    target?: number;
    threshold?: number;
    unit?: string;
    frequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    collectedAt: string;
    source: string;
    trending: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'UNKNOWN';
}

/**
 * Gap Analysis Result
 */
export interface GapAnalysisResult {
    id: string;
    framework: ComplianceFramework;
    analysisDate: string;
    analysisScope: string[];
    overallScore: number; // 0-100 percentage
    complianceLevel: ComplianceStatus;
    totalRules: number;
    compliantRules: number;
    nonCompliantRules: number;
    partiallyCompliantRules: number;
    notAssessedRules: number;
    gaps: ComplianceGap[];
    recommendations: Recommendation[];
    estimatedRemediationEffort: number; // in hours
    estimatedCost?: number;
    timeline: string; // estimated completion timeline
}

/**
 * Compliance Gap
 */
export interface ComplianceGap {
    id: string;
    ruleId: string;
    title: string;
    description: string;
    currentState: string;
    requiredState: string;
    severity: RiskSeverity;
    category: ControlCategory;
    riskExposure: string;
    businessImpact: string;
    technicalImpact: string;
    remediationComplexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
    remediationOptions: RemediationOption[];
}

/**
 * Remediation Option
 */
export interface RemediationOption {
    id: string;
    title: string;
    description: string;
    effort: number; // in hours
    cost?: number;
    timeline: string;
    pros: string[];
    cons: string[];
    dependencies: string[];
    riskReduction: number; // percentage
    recommended: boolean;
}

/**
 * Recommendation
 */
export interface Recommendation {
    id: string;
    title: string;
    description: string;
    category: 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM' | 'STRATEGIC';
    priority: RemediationPriority;
    effort: number;
    impact: RiskSeverity;
    benefits: string[];
    risks: string[];
    prerequisites?: string[];
    relatedGaps: string[];
}

/**
 * Compliance Report Configuration
 */
export interface ComplianceReportConfig {
    id: string;
    name: string;
    description: string;
    frameworks: ComplianceFramework[];
    scope: string[];
    includeDetails: boolean;
    includeEvidence: boolean;
    includeRecommendations: boolean;
    includeRiskAssessment: boolean;
    format: 'PDF' | 'HTML' | 'XLSX' | 'CSV' | 'JSON' | 'XML';
    template?: string;
    audience: 'EXECUTIVE' | 'TECHNICAL' | 'AUDIT' | 'REGULATORY' | 'COMPREHENSIVE';
    confidentiality: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
    branding?: BrandingConfig;
}

/**
 * Branding Configuration
 */
export interface BrandingConfig {
    companyName: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    headerText?: string;
    footerText?: string;
    watermark?: string;
}

/**
 * Monitoring Configuration
 */
export interface MonitoringConfig {
    enabled: boolean;
    frequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY';
    alertThresholds: {
        criticalFindings: number;
        highRiskFindings: number;
        nonComplianceRate: number; // percentage
        overdueTasks: number;
    };
    notificationChannels: string[];
    dashboardConfig?: DashboardConfig;
}

/**
 * Dashboard Configuration
 */
export interface DashboardConfig {
    enabled: boolean;
    widgets: DashboardWidget[];
    refreshInterval: number; // in seconds
    autoRefresh: boolean;
    allowExport: boolean;
    allowDrillDown: boolean;
}

/**
 * Dashboard Widget
 */
export interface DashboardWidget {
    id: string;
    type: 'CHART' | 'METRIC' | 'TABLE' | 'GAUGE' | 'MAP' | 'TEXT';
    title: string;
    description?: string;
    position: { x: number; y: number; width: number; height: number };
    dataSource: string;
    configuration: Record<string, any>;
    refreshInterval?: number;
}

/**
 * Compliance Configuration
 */
export interface ComplianceConfiguration {
    id: string;
    name: string;
    description: string;
    version: string;
    frameworks: ComplianceFramework[];
    rules: ComplianceRule[];
    riskAssessmentConfig: RiskAssessmentConfig;
    evidenceCollectionConfig: EvidenceCollectionConfig;
    remediationConfig: RemediationConfig;
    reportingConfig: ComplianceReportConfig;
    monitoringConfig: MonitoringConfig;
    automationConfig: AutomationConfig;
    integrationConfig: IntegrationConfig;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    approvedBy?: string;
    approvedAt?: string;
    effectiveDate: string;
    expirationDate?: string;
    tags: string[];
    metadata: Record<string, any>;
}

/**
 * Risk Assessment Configuration
 */
export interface RiskAssessmentConfig {
    methodology: 'QUANTITATIVE' | 'QUALITATIVE' | 'HYBRID';
    likelihoodScale: ScaleDefinition;
    impactScale: ScaleDefinition;
    riskMatrix: RiskMatrix;
    toleranceThresholds: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    reassessmentFrequency: string;
    approvalRequired: boolean;
}

/**
 * Scale Definition
 */
export interface ScaleDefinition {
    name: string;
    levels: ScaleLevel[];
}

/**
 * Scale Level
 */
export interface ScaleLevel {
    value: number;
    label: string;
    description: string;
    criteria?: string[];
}

/**
 * Risk Matrix
 */
export interface RiskMatrix {
    dimensions: number;
    cells: RiskMatrixCell[][];
}

/**
 * Risk Matrix Cell
 */
export interface RiskMatrixCell {
    likelihood: number;
    impact: number;
    riskLevel: RiskSeverity;
    color: string;
    acceptableRisk: boolean;
}

/**
 * Evidence Collection Configuration
 */
export interface EvidenceCollectionConfig {
    autoCollection: boolean;
    collectionSchedule?: string;
    supportedTypes: EvidenceType[];
    storageConfig: StorageConfig;
    retentionPolicy: RetentionPolicy;
    validationRules: ValidationRule[];
    metadata: Record<string, any>;
}

/**
 * Storage Configuration
 */
export interface StorageConfig {
    provider: 'LOCAL' | 'S3' | 'AZURE_BLOB' | 'GCS' | 'SFTP';
    encryption: boolean;
    compression: boolean;
    versioning: boolean;
    backupEnabled: boolean;
    path?: string;
    credentials?: Record<string, any>;
}

/**
 * Retention Policy
 */
export interface RetentionPolicy {
    defaultRetention: number; // in days
    typeSpecificRetention: Record<EvidenceType, number>;
    archivalEnabled: boolean;
    archivalAfter: number; // in days
    purgeAfter?: number; // in days
    legalHoldSupport: boolean;
}

/**
 * Validation Rule
 */
export interface ValidationRule {
    id: string;
    name: string;
    description: string;
    type: 'FORMAT' | 'SIZE' | 'CONTENT' | 'METADATA' | 'SECURITY';
    condition: string;
    action: 'ACCEPT' | 'REJECT' | 'WARN' | 'QUARANTINE';
    message?: string;
    enabled: boolean;
}

/**
 * Remediation Configuration
 */
export interface RemediationConfig {
    autoRemediation: boolean;
    approvalRequired: boolean;
    escalationEnabled: boolean;
    defaultAssignee?: string;
    slaDefaults: {
        critical: number; // hours
        high: number;
        medium: number;
        low: number;
    };
    workflowIntegration?: string;
    notificationTemplates: Record<string, string>;
}

/**
 * Automation Configuration
 */
export interface AutomationConfig {
    enabled: boolean;
    scheduledScans: boolean;
    scanSchedule?: string;
    autoRemediation: boolean;
    integrationTests: boolean;
    continuousMonitoring: boolean;
    alerting: boolean;
    reportGeneration: boolean;
    workflowIntegration: boolean;
}

/**
 * Integration Configuration
 */
export interface IntegrationConfig {
    siem?: SiemIntegration;
    grc?: GrcIntegration;
    itsm?: ItsmIntegration;
    cm?: CmIntegration;
    identity?: IdentityIntegration;
    audit?: AuditIntegration;
    cloud?: CloudIntegration[];
}

/**
 * SIEM Integration
 */
export interface SiemIntegration {
    enabled: boolean;
    provider: string;
    endpoint: string;
    credentials: Record<string, any>;
    eventTypes: string[];
    format: 'CEF' | 'LEEF' | 'JSON' | 'SYSLOG';
    batchSize?: number;
    realTime: boolean;
}

/**
 * GRC Integration
 */
export interface GrcIntegration {
    enabled: boolean;
    provider: string;
    endpoint: string;
    credentials: Record<string, any>;
    syncControls: boolean;
    syncRisks: boolean;
    syncFindings: boolean;
    bidirectional: boolean;
}

/**
 * ITSM Integration
 */
export interface ItsmIntegration {
    enabled: boolean;
    provider: string;
    endpoint: string;
    credentials: Record<string, any>;
    ticketTypes: string[];
    fieldMapping: Record<string, string>;
    autoCreate: boolean;
    statusSync: boolean;
}

/**
 * Configuration Management Integration
 */
export interface CmIntegration {
    enabled: boolean;
    provider: string;
    endpoint: string;
    credentials: Record<string, any>;
    assetTypes: string[];
    syncFrequency: string;
    configurationBaseline: boolean;
    changeDetection: boolean;
}

/**
 * Identity Integration
 */
export interface IdentityIntegration {
    enabled: boolean;
    provider: string;
    endpoint: string;
    credentials: Record<string, any>;
    userSync: boolean;
    roleSync: boolean;
    accessReviews: boolean;
    provisioning: boolean;
}

/**
 * Audit Integration
 */
export interface AuditIntegration {
    enabled: boolean;
    provider: string;
    endpoint: string;
    credentials: Record<string, any>;
    auditTrails: boolean;
    findings: boolean;
    evidenceSync: boolean;
    workpapers: boolean;
}

/**
 * Cloud Integration
 */
export interface CloudIntegration {
    provider: 'AWS' | 'AZURE' | 'GCP' | 'OCI' | 'ALIBABA';
    enabled: boolean;
    regions: string[];
    services: string[];
    credentials: Record<string, any>;
    resourceDiscovery: boolean;
    configurationAssessment: boolean;
    complianceChecks: boolean;
    costOptimization: boolean;
}

/**
 * Compliance Result
 */
export interface ComplianceResult {
    success: boolean;
    executionId: string;
    sopId: string;
    complianceId: string;
    executionTime: number;
    processingMode: ComplianceProcessingMode;
    frameworks: ComplianceFramework[];
    overallStatus: ComplianceStatus;
    overallScore: number; // 0-100 percentage
    rulesProcessed: number;
    rulesCompliant: number;
    rulesNonCompliant: number;
    rulesPartiallyCompliant: number;
    rulesNotAssessed: number;
    criticalFindings: number;
    highRiskFindings: number;
    mediumRiskFindings: number;
    lowRiskFindings: number;
    ruleResults: RuleResult[];
    gapAnalysis?: GapAnalysisResult;
    riskAssessment?: RiskAssessment;
    remediationPlan?: RemediationPlan;
    evidenceCollected?: EvidenceItem[];
    reportGenerated?: ComplianceReportResult;
    certificateGenerated?: ComplianceCertificate;
    auditTrail: AuditTrailEntry[];
    error?: string;
    metadata: ComplianceResultMetadata;
}

/**
 * Rule Result
 */
export interface RuleResult {
    ruleId: string;
    framework: ComplianceFramework;
    title: string;
    status: ComplianceStatus;
    score: number; // 0-100 percentage
    severity: RiskSeverity;
    findings: ComplianceFinding[];
    evidence: EvidenceItem[];
    testResults: TestResult[];
    lastAssessed: string;
    nextAssessment?: string;
    exception?: ComplianceException;
    remediationItems: RemediationItem[];
    estimatedEffort?: number;
    actualEffort?: number;
}

/**
 * Compliance Finding
 */
export interface ComplianceFinding {
    id: string;
    type: 'VIOLATION' | 'GAP' | 'WEAKNESS' | 'OBSERVATION' | 'BEST_PRACTICE';
    severity: RiskSeverity;
    title: string;
    description: string;
    evidence: string[];
    impact: string;
    recommendation: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ACCEPTED_RISK';
    assignedTo?: string;
    dueDate?: string;
    identifiedAt: string;
    resolvedAt?: string;
    verifiedAt?: string;
    metadata: Record<string, any>;
}

/**
 * Remediation Plan
 */
export interface RemediationPlan {
    id: string;
    name: string;
    description: string;
    frameworks: ComplianceFramework[];
    totalItems: number;
    completedItems: number;
    overallProgress: number; // 0-100 percentage
    estimatedEffort: number; // total hours
    actualEffort: number;
    estimatedCost?: number;
    actualCost?: number;
    targetCompletionDate: string;
    items: RemediationItem[];
    milestones: PlanMilestone[];
    dependencies: PlanDependency[];
    risks: PlanRisk[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    approvedBy?: string;
    approvedAt?: string;
}

/**
 * Plan Milestone
 */
export interface PlanMilestone {
    id: string;
    name: string;
    description: string;
    targetDate: string;
    actualDate?: string;
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
    deliverables: string[];
    dependencies: string[];
}

/**
 * Plan Dependency
 */
export interface PlanDependency {
    id: string;
    type: 'INTERNAL' | 'EXTERNAL' | 'RESOURCE' | 'APPROVAL' | 'TECHNICAL';
    description: string;
    dependentItem: string;
    blockingItem: string;
    status: 'ACTIVE' | 'RESOLVED' | 'BLOCKED';
    impact: RiskSeverity;
    mitigation?: string;
}

/**
 * Plan Risk
 */
export interface PlanRisk {
    id: string;
    description: string;
    probability: number; // 1-5
    impact: number; // 1-5
    severity: RiskSeverity;
    mitigation: string;
    owner: string;
    status: 'IDENTIFIED' | 'ANALYZED' | 'MITIGATED' | 'CLOSED';
    affectedItems: string[];
}

/**
 * Compliance Report Result
 */
export interface ComplianceReportResult {
    id: string;
    name: string;
    format: string;
    size: number;
    generatedAt: string;
    generatedBy: string;
    filePath?: string;
    downloadUrl?: string;
    expiresAt?: string;
    metadata: Record<string, any>;
}

/**
 * Compliance Certificate
 */
export interface ComplianceCertificate {
    id: string;
    framework: ComplianceFramework;
    certifiedEntity: string;
    scope: string[];
    validFrom: string;
    validUntil: string;
    certificationLevel: 'BASIC' | 'STANDARD' | 'ADVANCED' | 'COMPREHENSIVE';
    issuedBy: string;
    issuedAt: string;
    certificateNumber: string;
    digitalSignature?: string;
    filePath?: string;
    downloadUrl?: string;
    metadata: Record<string, any>;
}

/**
 * Audit Trail Entry
 */
export interface AuditTrailEntry {
    timestamp: string;
    action: string;
    userId: string;
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
}

/**
 * Compliance Result Metadata
 */
export interface ComplianceResultMetadata {
    executedBy: string;
    completedAt: string;
    frameworks: ComplianceFramework[];
    configVersion: string;
    processingMode: ComplianceProcessingMode;
    environmentInfo?: Record<string, any>;
    performanceMetrics?: PerformanceMetrics;
    qualityMetrics?: QualityMetrics;
}

/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
    totalExecutionTime: number; // milliseconds
    ruleExecutionTimes: Record<string, number>;
    averageRuleExecutionTime: number;
    memoryUsage?: number; // MB
    cpuUsage?: number; // percentage
    networkRequests?: number;
    cacheHitRate?: number; // percentage
}

/**
 * Quality Metrics
 */
export interface QualityMetrics {
    accuracy: number; // percentage
    completeness: number; // percentage
    consistency: number; // percentage
    timeliness: number; // percentage
    relevance: number; // percentage
    falsePositiveRate?: number; // percentage
    falseNegativeRate?: number; // percentage
    coverageRate: number; // percentage
}