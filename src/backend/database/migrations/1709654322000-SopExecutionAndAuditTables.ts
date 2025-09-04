import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class SopExecutionAndAuditTables1709654322000 implements MigrationInterface {
  name = 'SopExecutionAndAuditTables1709654322000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create SOP Executions table
    await queryRunner.createTable(
      new Table({
        name: 'sop_executions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'project_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'step_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
            default: "'pending'",
          },
          {
            name: 'input_data',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'output_data',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'started_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['project_id'],
            referencedTableName: 'sop_projects',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['step_id'],
            referencedTableName: 'sop_steps',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );

    // Create SOP Audit Logs table
    await queryRunner.createTable(
      new Table({
        name: 'sop_audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'entity_type',
            type: 'enum',
            enum: ['project', 'step', 'template', 'execution'],
          },
          {
            name: 'entity_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'action',
            type: 'enum',
            enum: ['create', 'update', 'delete', 'execute', 'approve', 'reject', 'cancel'],
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'project_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'step_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'execution_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'old_values',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'new_values',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['project_id'],
            referencedTableName: 'sop_projects',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['step_id'],
            referencedTableName: 'sop_steps',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['execution_id'],
            referencedTableName: 'sop_executions',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );

    // Create indices for SOP Executions
    await queryRunner.createIndex(
      'sop_executions',
      new Index('idx_sop_executions_project_id', ['project_id']),
    );

    await queryRunner.createIndex(
      'sop_executions',
      new Index('idx_sop_executions_status', ['status']),
    );

    await queryRunner.createIndex(
      'sop_executions',
      new Index('idx_sop_executions_created_at', ['created_at']),
    );

    // Create indices for SOP Audit Logs
    await queryRunner.createIndex(
      'sop_audit_logs',
      new Index('idx_sop_audit_logs_entity_type', ['entity_type']),
    );

    await queryRunner.createIndex(
      'sop_audit_logs',
      new Index('idx_sop_audit_logs_action', ['action']),
    );

    await queryRunner.createIndex(
      'sop_audit_logs',
      new Index('idx_sop_audit_logs_user_id', ['user_id']),
    );

    await queryRunner.createIndex(
      'sop_audit_logs',
      new Index('idx_sop_audit_logs_created_at', ['created_at']),
    );

    await queryRunner.createIndex(
      'sop_audit_logs',
      new Index('idx_sop_audit_logs_project_id', ['project_id']),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('sop_audit_logs');
    await queryRunner.dropTable('sop_executions');
  }
}