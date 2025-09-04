import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSopSystemTables1744780900000 implements MigrationInterface {
    name = 'AddSopSystemTables1744780900000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create SOP Projects table
        await queryRunner.query(`
            CREATE TABLE "sop_projects" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(255) NOT NULL,
                "description" text,
                "category" character varying(100) NOT NULL,
                "priority" character varying(20) DEFAULT 'medium',
                "projectId" uuid NOT NULL,
                "createdBy" uuid NOT NULL,
                "assignedTo" uuid,
                "templateId" uuid,
                "status" character varying(20) DEFAULT 'draft',
                "tags" text[],
                "estimatedDuration" integer,
                "actualDuration" integer,
                "scheduledFor" timestamp with time zone,
                "startedAt" timestamp with time zone,
                "completedAt" timestamp with time zone,
                "isArchived" boolean DEFAULT false,
                "isRecurring" boolean DEFAULT false,
                "recurringPattern" jsonb,
                "customFields" jsonb,
                "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
                "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "PK_sop_projects" PRIMARY KEY ("id")
            )
        `);

        // Create SOP Steps table
        await queryRunner.query(`
            CREATE TABLE "sop_steps" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "sopProjectId" uuid NOT NULL,
                "title" character varying(255) NOT NULL,
                "description" text NOT NULL,
                "position" integer NOT NULL,
                "isRequired" boolean DEFAULT true,
                "estimatedDuration" integer DEFAULT 30,
                "actualDuration" integer,
                "status" character varying(20) DEFAULT 'pending',
                "assignedTo" uuid,
                "startedAt" timestamp with time zone,
                "completedAt" timestamp with time zone,
                "validationRules" text[],
                "inputSchema" jsonb,
                "outputSchema" jsonb,
                "inputData" jsonb,
                "outputData" jsonb,
                "notes" text,
                "attachments" jsonb,
                "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
                "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "PK_sop_steps" PRIMARY KEY ("id")
            )
        `);

        // Create SOP Executions table
        await queryRunner.query(`
            CREATE TABLE "sop_executions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "sopProjectId" uuid NOT NULL,
                "executedBy" uuid NOT NULL,
                "status" character varying(20) DEFAULT 'running',
                "priority" character varying(20) DEFAULT 'medium',
                "currentStepId" uuid,
                "currentStepPosition" integer DEFAULT 1,
                "totalSteps" integer NOT NULL,
                "completedSteps" integer DEFAULT 0,
                "progress" decimal(5,2) DEFAULT 0,
                "startedAt" timestamp with time zone NOT NULL DEFAULT now(),
                "completedAt" timestamp with time zone,
                "failedAt" timestamp with time zone,
                "pausedAt" timestamp with time zone,
                "estimatedCompletion" timestamp with time zone,
                "actualDuration" integer,
                "escalationLevel" integer DEFAULT 0,
                "retryCount" integer DEFAULT 0,
                "metadata" jsonb,
                "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
                "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "PK_sop_executions" PRIMARY KEY ("id")
            )
        `);

        // Create SOP Audit Logs table
        await queryRunner.query(`
            CREATE TABLE "sop_audit_logs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "sopProjectId" uuid,
                "sopExecutionId" uuid,
                "sopStepId" uuid,
                "userId" uuid NOT NULL,
                "action" character varying(100) NOT NULL,
                "details" jsonb NOT NULL,
                "oldValues" jsonb,
                "newValues" jsonb,
                "ipAddress" character varying(45),
                "userAgent" text,
                "timestamp" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "PK_sop_audit_logs" PRIMARY KEY ("id")
            )
        `);

        // Create SOP Templates table
        await queryRunner.query(`
            CREATE TABLE "sop_templates" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(255) NOT NULL,
                "description" text NOT NULL,
                "longDescription" text,
                "category" character varying(100) NOT NULL,
                "tags" text[],
                "difficulty" character varying(20) DEFAULT 'beginner',
                "estimatedTime" integer DEFAULT 30,
                "rating" decimal(3,2) DEFAULT 0,
                "usageCount" integer DEFAULT 0,
                "author" character varying(255) NOT NULL,
                "authorEmail" character varying(255),
                "isActive" boolean DEFAULT true,
                "isFeatured" boolean DEFAULT false,
                "isPublic" boolean DEFAULT false,
                "thumbnailUrl" character varying(255),
                "previewUrl" character varying(255),
                "prerequisites" jsonb,
                "outcomes" jsonb,
                "compliance" jsonb,
                "version" character varying(50) DEFAULT '1.0.0',
                "changeLog" text,
                "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
                "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "PK_sop_templates" PRIMARY KEY ("id")
            )
        `);

        // Create SOP Template Steps table
        await queryRunner.query(`
            CREATE TABLE "sop_template_steps" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "templateId" uuid NOT NULL,
                "title" character varying(255) NOT NULL,
                "description" text NOT NULL,
                "position" integer NOT NULL,
                "estimatedDuration" integer DEFAULT 30,
                "isRequired" boolean DEFAULT true,
                "hasValidation" boolean DEFAULT false,
                "inputSchema" jsonb,
                "outputSchema" jsonb,
                "validationRules" text[],
                "inputs" jsonb,
                "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
                "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "PK_sop_template_steps" PRIMARY KEY ("id")
            )
        `);

        // Create SOP Template Resources table
        await queryRunner.query(`
            CREATE TABLE "sop_template_resources" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "templateId" uuid NOT NULL,
                "name" character varying(255) NOT NULL,
                "description" text,
                "type" character varying(20) DEFAULT 'document',
                "url" character varying(500) NOT NULL,
                "mimeType" character varying(100),
                "fileSize" integer,
                "isRequired" boolean DEFAULT false,
                "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "PK_sop_template_resources" PRIMARY KEY ("id")
            )
        `);

        // Create SOP Template Bookmarks table
        await queryRunner.query(`
            CREATE TABLE "sop_template_bookmarks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "templateId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "PK_sop_template_bookmarks" PRIMARY KEY ("id")
            )
        `);

        // Create SOP Template Reviews table
        await queryRunner.query(`
            CREATE TABLE "sop_template_reviews" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "templateId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "rating" integer NOT NULL,
                "comment" text,
                "isPublic" boolean DEFAULT true,
                "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
                "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "PK_sop_template_reviews" PRIMARY KEY ("id"),
                CONSTRAINT "CHK_rating_range" CHECK ("rating" >= 1 AND "rating" <= 5)
            )
        `);

        // Create SOP Template Usage table
        await queryRunner.query(`
            CREATE TABLE "sop_template_usage" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "templateId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "projectId" uuid NOT NULL,
                "sopProjectId" uuid,
                "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
                CONSTRAINT "PK_sop_template_usage" PRIMARY KEY ("id")
            )
        `);

        // Create indexes for performance
        await queryRunner.query(`CREATE INDEX "IDX_sop_projects_project_id" ON "sop_projects" ("projectId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_projects_created_by" ON "sop_projects" ("createdBy")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_projects_status" ON "sop_projects" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_projects_category" ON "sop_projects" ("category")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_projects_template_id" ON "sop_projects" ("templateId")`);

        await queryRunner.query(`CREATE INDEX "IDX_sop_steps_sop_project_id" ON "sop_steps" ("sopProjectId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_steps_position" ON "sop_steps" ("sopProjectId", "position")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_steps_status" ON "sop_steps" ("status")`);

        await queryRunner.query(`CREATE INDEX "IDX_sop_executions_sop_project_id" ON "sop_executions" ("sopProjectId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_executions_executed_by" ON "sop_executions" ("executedBy")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_executions_status" ON "sop_executions" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_executions_started_at" ON "sop_executions" ("startedAt")`);

        await queryRunner.query(`CREATE INDEX "IDX_sop_audit_logs_sop_project_id" ON "sop_audit_logs" ("sopProjectId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_audit_logs_user_id" ON "sop_audit_logs" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_audit_logs_timestamp" ON "sop_audit_logs" ("timestamp")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_audit_logs_action" ON "sop_audit_logs" ("action")`);

        await queryRunner.query(`CREATE INDEX "IDX_sop_templates_category" ON "sop_templates" ("category")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_templates_difficulty" ON "sop_templates" ("difficulty")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_templates_is_active" ON "sop_templates" ("isActive")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_templates_is_featured" ON "sop_templates" ("isFeatured")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_templates_rating" ON "sop_templates" ("rating")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_templates_usage_count" ON "sop_templates" ("usageCount")`);

        await queryRunner.query(`CREATE INDEX "IDX_sop_template_steps_template_id_position" ON "sop_template_steps" ("templateId", "position")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_template_resources_template_id" ON "sop_template_resources" ("templateId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_template_bookmarks_user_id" ON "sop_template_bookmarks" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_template_bookmarks_template_user" ON "sop_template_bookmarks" ("templateId", "userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_template_reviews_template_id" ON "sop_template_reviews" ("templateId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_template_reviews_user_id" ON "sop_template_reviews" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_template_usage_template_id" ON "sop_template_usage" ("templateId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_template_usage_user_id" ON "sop_template_usage" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_template_usage_project_id" ON "sop_template_usage" ("projectId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_template_usage_created_at" ON "sop_template_usage" ("createdAt")`);

        // Add unique constraints
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_sop_template_bookmarks_template_user" ON "sop_template_bookmarks" ("templateId", "userId")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_sop_template_reviews_template_user" ON "sop_template_reviews" ("templateId", "userId")`);

        // Create foreign key constraints (note: assuming user table exists)
        await queryRunner.query(`
            ALTER TABLE "sop_steps" 
            ADD CONSTRAINT "FK_sop_steps_sop_project" 
            FOREIGN KEY ("sopProjectId") REFERENCES "sop_projects"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "sop_executions" 
            ADD CONSTRAINT "FK_sop_executions_sop_project" 
            FOREIGN KEY ("sopProjectId") REFERENCES "sop_projects"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "sop_executions" 
            ADD CONSTRAINT "FK_sop_executions_current_step" 
            FOREIGN KEY ("currentStepId") REFERENCES "sop_steps"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "sop_audit_logs" 
            ADD CONSTRAINT "FK_sop_audit_logs_sop_project" 
            FOREIGN KEY ("sopProjectId") REFERENCES "sop_projects"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "sop_audit_logs" 
            ADD CONSTRAINT "FK_sop_audit_logs_sop_execution" 
            FOREIGN KEY ("sopExecutionId") REFERENCES "sop_executions"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "sop_audit_logs" 
            ADD CONSTRAINT "FK_sop_audit_logs_sop_step" 
            FOREIGN KEY ("sopStepId") REFERENCES "sop_steps"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "sop_template_steps" 
            ADD CONSTRAINT "FK_sop_template_steps_template" 
            FOREIGN KEY ("templateId") REFERENCES "sop_templates"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "sop_template_resources" 
            ADD CONSTRAINT "FK_sop_template_resources_template" 
            FOREIGN KEY ("templateId") REFERENCES "sop_templates"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "sop_template_bookmarks" 
            ADD CONSTRAINT "FK_sop_template_bookmarks_template" 
            FOREIGN KEY ("templateId") REFERENCES "sop_templates"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "sop_template_reviews" 
            ADD CONSTRAINT "FK_sop_template_reviews_template" 
            FOREIGN KEY ("templateId") REFERENCES "sop_templates"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "sop_template_usage" 
            ADD CONSTRAINT "FK_sop_template_usage_template" 
            FOREIGN KEY ("templateId") REFERENCES "sop_templates"("id") ON DELETE CASCADE
        `);

        // Add GIN indexes for JSONB columns and array searches
        await queryRunner.query(`CREATE INDEX "IDX_sop_projects_tags_gin" ON "sop_projects" USING GIN ("tags")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_projects_custom_fields_gin" ON "sop_projects" USING GIN ("customFields")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_templates_tags_gin" ON "sop_templates" USING GIN ("tags")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_templates_prerequisites_gin" ON "sop_templates" USING GIN ("prerequisites")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_templates_outcomes_gin" ON "sop_templates" USING GIN ("outcomes")`);
        await queryRunner.query(`CREATE INDEX "IDX_sop_templates_compliance_gin" ON "sop_templates" USING GIN ("compliance")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order to handle foreign key dependencies
        await queryRunner.query(`DROP TABLE IF EXISTS "sop_template_usage"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sop_template_reviews"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sop_template_bookmarks"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sop_template_resources"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sop_template_steps"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sop_templates"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sop_audit_logs"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sop_executions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sop_steps"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sop_projects"`);
    }
}