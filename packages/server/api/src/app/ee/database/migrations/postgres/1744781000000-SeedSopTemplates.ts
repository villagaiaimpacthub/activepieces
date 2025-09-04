import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedSopTemplates1744781000000 implements MigrationInterface {
    name = 'SeedSopTemplates1744781000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert initial SOP templates
        const templates = [
            {
                title: 'Employee Onboarding',
                description: 'Comprehensive checklist for new employee orientation and setup',
                longDescription: 'A complete step-by-step process for onboarding new employees, covering everything from workspace setup to training completion. Ensures consistent onboarding experience and compliance with HR policies.',
                category: 'Onboarding',
                tags: ['hr', 'onboarding', 'new-employee', 'orientation'],
                difficulty: 'beginner',
                estimatedTime: 480,
                author: 'HR Department',
                authorEmail: 'hr@company.com',
                isFeatured: true,
                isPublic: true,
                prerequisites: ['Valid employment contract', 'IT equipment availability', 'Manager assignment'],
                outcomes: ['Fully equipped workspace', 'Completed compliance training', 'System access provisioned', 'Team introductions completed'],
                compliance: {
                    standards: ['GDPR', 'Company Policy'],
                    auditTrail: true,
                    approvalRequired: true
                },
                steps: [
                    {
                        title: 'Prepare Workspace',
                        description: 'Set up physical workspace including desk, chair, and equipment',
                        position: 1,
                        estimatedDuration: 60,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'IT Equipment Setup',
                        description: 'Provision laptop, phone, and necessary software access',
                        position: 2,
                        estimatedDuration: 90,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'Documentation Review',
                        description: 'Review and sign employment documents, handbook, and policies',
                        position: 3,
                        estimatedDuration: 120,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'System Access Provisioning',
                        description: 'Create accounts and grant access to necessary systems',
                        position: 4,
                        estimatedDuration: 60,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'Team Introductions',
                        description: 'Introduce new employee to team members and key stakeholders',
                        position: 5,
                        estimatedDuration: 90,
                        isRequired: true,
                        hasValidation: false
                    },
                    {
                        title: 'Initial Training Schedule',
                        description: 'Set up and begin mandatory training programs',
                        position: 6,
                        estimatedDuration: 60,
                        isRequired: true,
                        hasValidation: true
                    }
                ]
            },
            {
                title: 'IT Security Incident Response',
                description: 'Standard procedure for responding to cybersecurity incidents',
                longDescription: 'Critical security incident response procedures to minimize damage and restore operations quickly. Includes threat assessment, containment, investigation, and recovery steps.',
                category: 'IT & Security',
                tags: ['security', 'incident', 'cybersecurity', 'emergency'],
                difficulty: 'advanced',
                estimatedTime: 240,
                author: 'IT Security Team',
                authorEmail: 'security@company.com',
                isFeatured: true,
                isPublic: true,
                prerequisites: ['Security team notification', 'Incident classification', 'Management approval for advanced responses'],
                outcomes: ['Incident contained', 'Root cause identified', 'Systems restored', 'Post-incident report completed'],
                compliance: {
                    standards: ['ISO 27001', 'NIST', 'SOX'],
                    auditTrail: true,
                    approvalRequired: true
                },
                steps: [
                    {
                        title: 'Incident Detection & Classification',
                        description: 'Identify and classify the security incident severity level',
                        position: 1,
                        estimatedDuration: 30,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'Initial Containment',
                        description: 'Implement immediate containment measures to prevent spread',
                        position: 2,
                        estimatedDuration: 45,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'Stakeholder Notification',
                        description: 'Notify relevant stakeholders and management team',
                        position: 3,
                        estimatedDuration: 15,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'Evidence Collection',
                        description: 'Collect and preserve digital evidence for investigation',
                        position: 4,
                        estimatedDuration: 60,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'System Recovery',
                        description: 'Restore affected systems and verify functionality',
                        position: 5,
                        estimatedDuration: 90,
                        isRequired: true,
                        hasValidation: true
                    }
                ]
            },
            {
                title: 'Customer Service Escalation',
                description: 'Process for escalating customer issues to appropriate teams',
                longDescription: 'Structured approach to handling customer escalations, ensuring issues are routed to the right team with proper context and urgency levels.',
                category: 'Customer Service',
                tags: ['customer-service', 'escalation', 'support', 'communication'],
                difficulty: 'intermediate',
                estimatedTime: 120,
                author: 'Customer Success Team',
                authorEmail: 'support@company.com',
                isFeatured: false,
                isPublic: true,
                prerequisites: ['Customer issue documented', 'Initial troubleshooting completed', 'Customer consent for escalation'],
                outcomes: ['Issue escalated to appropriate team', 'Customer notified of escalation', 'Timeline communicated', 'Follow-up scheduled'],
                compliance: {
                    standards: ['Customer Service Standards'],
                    auditTrail: true,
                    approvalRequired: false
                },
                steps: [
                    {
                        title: 'Issue Assessment',
                        description: 'Review issue details and determine escalation criteria',
                        position: 1,
                        estimatedDuration: 20,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'Team Assignment',
                        description: 'Identify and assign issue to appropriate specialist team',
                        position: 2,
                        estimatedDuration: 15,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'Context Transfer',
                        description: 'Transfer complete context and history to assigned team',
                        position: 3,
                        estimatedDuration: 30,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'Customer Communication',
                        description: 'Inform customer about escalation and expected timeline',
                        position: 4,
                        estimatedDuration: 15,
                        isRequired: true,
                        hasValidation: false
                    },
                    {
                        title: 'Follow-up Scheduling',
                        description: 'Schedule follow-up check-ins with customer',
                        position: 5,
                        estimatedDuration: 10,
                        isRequired: true,
                        hasValidation: false
                    }
                ]
            },
            {
                title: 'Financial Month-End Close',
                description: 'Monthly financial closing procedures and reconciliation',
                longDescription: 'Complete month-end closing process ensuring all financial transactions are recorded, reconciled, and reported accurately for management and compliance.',
                category: 'Finance',
                tags: ['finance', 'accounting', 'month-end', 'reconciliation', 'reporting'],
                difficulty: 'intermediate',
                estimatedTime: 360,
                author: 'Finance Department',
                authorEmail: 'finance@company.com',
                isFeatured: false,
                isPublic: true,
                prerequisites: ['All transactions recorded', 'Bank statements received', 'Expense reports submitted'],
                outcomes: ['Books closed for the month', 'Reconciliations completed', 'Financial reports generated', 'Variance analysis completed'],
                compliance: {
                    standards: ['GAAP', 'SOX', 'Internal Controls'],
                    auditTrail: true,
                    approvalRequired: true
                },
                steps: [
                    {
                        title: 'Account Reconciliation',
                        description: 'Reconcile all major accounts including bank, AR, AP',
                        position: 1,
                        estimatedDuration: 120,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'Accrual Entries',
                        description: 'Record month-end accrual and adjustment entries',
                        position: 2,
                        estimatedDuration: 90,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'Trial Balance Review',
                        description: 'Review and validate trial balance for accuracy',
                        position: 3,
                        estimatedDuration: 45,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'Financial Statement Preparation',
                        description: 'Generate monthly financial statements',
                        position: 4,
                        estimatedDuration: 60,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'Management Review',
                        description: 'Present results to management and address questions',
                        position: 5,
                        estimatedDuration: 45,
                        isRequired: true,
                        hasValidation: false
                    }
                ]
            },
            {
                title: 'Quality Assurance Testing',
                description: 'Comprehensive QA testing procedure for software releases',
                longDescription: 'Systematic quality assurance testing process to ensure software releases meet quality standards and functionality requirements before production deployment.',
                category: 'Quality Assurance',
                tags: ['qa', 'testing', 'software', 'quality', 'release'],
                difficulty: 'intermediate',
                estimatedTime: 300,
                author: 'QA Team',
                authorEmail: 'qa@company.com',
                isFeatured: true,
                isPublic: true,
                prerequisites: ['Development completed', 'Test environment available', 'Test cases prepared'],
                outcomes: ['All test cases executed', 'Bugs documented and triaged', 'Release approval granted', 'Test report completed'],
                compliance: {
                    standards: ['ISO 9001', 'Company QA Standards'],
                    auditTrail: true,
                    approvalRequired: true
                },
                steps: [
                    {
                        title: 'Test Environment Setup',
                        description: 'Prepare and validate test environment configuration',
                        position: 1,
                        estimatedDuration: 45,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'Functional Testing',
                        description: 'Execute functional test cases and document results',
                        position: 2,
                        estimatedDuration: 120,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'Integration Testing',
                        description: 'Test integration points and data flow',
                        position: 3,
                        estimatedDuration: 90,
                        isRequired: true,
                        hasValidation: true
                    },
                    {
                        title: 'Performance Testing',
                        description: 'Validate performance metrics and load handling',
                        position: 4,
                        estimatedDuration: 45,
                        isRequired: false,
                        hasValidation: true
                    }
                ]
            }
        ];

        // Insert templates and their steps
        for (const template of templates) {
            const { steps, ...templateData } = template;
            
            // Insert template
            const templateResult = await queryRunner.query(`
                INSERT INTO "sop_templates" (
                    "title", "description", "longDescription", "category", "tags", 
                    "difficulty", "estimatedTime", "author", "authorEmail", "isFeatured", 
                    "isPublic", "prerequisites", "outcomes", "compliance"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING "id"
            `, [
                templateData.title,
                templateData.description,
                templateData.longDescription,
                templateData.category,
                templateData.tags,
                templateData.difficulty,
                templateData.estimatedTime,
                templateData.author,
                templateData.authorEmail,
                templateData.isFeatured,
                templateData.isPublic,
                JSON.stringify(templateData.prerequisites),
                JSON.stringify(templateData.outcomes),
                JSON.stringify(templateData.compliance)
            ]);

            const templateId = templateResult[0].id;

            // Insert template steps
            for (const step of steps) {
                await queryRunner.query(`
                    INSERT INTO "sop_template_steps" (
                        "templateId", "title", "description", "position", 
                        "estimatedDuration", "isRequired", "hasValidation"
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [
                    templateId,
                    step.title,
                    step.description,
                    step.position,
                    step.estimatedDuration,
                    step.isRequired,
                    step.hasValidation
                ]);
            }

            // Add some sample resources for featured templates
            if (templateData.isFeatured) {
                await queryRunner.query(`
                    INSERT INTO "sop_template_resources" (
                        "templateId", "name", "description", "type", "url", "isRequired"
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                `, [
                    templateId,
                    `${templateData.title} Checklist`,
                    `Printable checklist for ${templateData.title.toLowerCase()}`,
                    'document',
                    '/resources/checklists/' + templateData.title.toLowerCase().replace(/\s+/g, '-') + '-checklist.pdf',
                    false
                ]);
            }
        }

        // Add some initial template reviews for featured templates
        const featuredTemplates = await queryRunner.query(`
            SELECT "id" FROM "sop_templates" WHERE "isFeatured" = true
        `);

        const sampleReviews = [
            { rating: 5, comment: 'Excellent template, very comprehensive and easy to follow.' },
            { rating: 4, comment: 'Great structure, helped streamline our process significantly.' },
            { rating: 5, comment: 'Perfect for our needs, saved us hours of planning.' },
            { rating: 4, comment: 'Well organized and detailed. Minor improvements could be made to clarity.' }
        ];

        // Note: In a real implementation, you'd want to use actual user IDs
        // For this seed, we'll use placeholder UUID values
        const placeholderUserIds = [
            '00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000002',
            '00000000-0000-0000-0000-000000000003',
            '00000000-0000-0000-0000-000000000004'
        ];

        for (const template of featuredTemplates) {
            // Add 2-4 reviews per featured template
            const reviewCount = Math.floor(Math.random() * 3) + 2;
            for (let i = 0; i < reviewCount; i++) {
                const review = sampleReviews[i % sampleReviews.length];
                const userId = placeholderUserIds[i % placeholderUserIds.length];
                
                await queryRunner.query(`
                    INSERT INTO "sop_template_reviews" (
                        "templateId", "userId", "rating", "comment"
                    ) VALUES ($1, $2, $3, $4)
                    ON CONFLICT ("templateId", "userId") DO NOTHING
                `, [
                    template.id,
                    userId,
                    review.rating,
                    review.comment
                ]);
            }

            // Update template rating based on reviews
            const avgRating = await queryRunner.query(`
                SELECT AVG("rating")::decimal(3,2) as avg_rating
                FROM "sop_template_reviews" 
                WHERE "templateId" = $1
            `, [template.id]);

            if (avgRating[0].avg_rating) {
                await queryRunner.query(`
                    UPDATE "sop_templates" 
                    SET "rating" = $1 
                    WHERE "id" = $2
                `, [avgRating[0].avg_rating, template.id]);
            }
        }

        // Simulate some template usage
        for (const template of featuredTemplates.slice(0, 3)) {
            const usageCount = Math.floor(Math.random() * 50) + 10;
            await queryRunner.query(`
                UPDATE "sop_templates" 
                SET "usageCount" = $1 
                WHERE "id" = $2
            `, [usageCount, template.id]);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Clean up seeded data
        await queryRunner.query(`DELETE FROM "sop_template_reviews"`);
        await queryRunner.query(`DELETE FROM "sop_template_resources"`);
        await queryRunner.query(`DELETE FROM "sop_template_steps"`);
        await queryRunner.query(`DELETE FROM "sop_templates"`);
    }
}