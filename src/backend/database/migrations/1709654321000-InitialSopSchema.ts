import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class InitialSopSchema1709654321000 implements MigrationInterface {
  name = 'InitialSopSchema1709654321000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create SOP Projects table
    await queryRunner.createTable(
      new Table({
        name: 'sop_projects',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'active', 'archived'],
            default: "'draft'",
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
          {
            name: 'version',
            type: 'integer',
            default: 1,
          },
        ],
      }),
      true,
    );

    // Create SOP Steps table
    await queryRunner.createTable(
      new Table({
        name: 'sop_steps',
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
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'step_type',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'configuration',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'position',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'parent_step_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
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
            columnNames: ['parent_step_id'],
            referencedTableName: 'sop_steps',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );

    // Create SOP Templates table
    await queryRunner.createTable(
      new Table({
        name: 'sop_templates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'template_data',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'is_public',
            type: 'boolean',
            default: false,
          },
          {
            name: 'usage_count',
            type: 'integer',
            default: 0,
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
      }),
      true,
    );

    // Create indices
    await queryRunner.createIndex(
      'sop_projects',
      new Index('idx_sop_projects_status', ['status']),
    );

    await queryRunner.createIndex(
      'sop_projects',
      new Index('idx_sop_projects_created_at', ['created_at']),
    );

    await queryRunner.createIndex(
      'sop_steps',
      new Index('idx_sop_steps_project_id', ['project_id']),
    );

    await queryRunner.createIndex(
      'sop_steps',
      new Index('idx_sop_steps_position', ['project_id', 'position']),
    );

    await queryRunner.createIndex(
      'sop_templates',
      new Index('idx_sop_templates_category', ['category']),
    );

    await queryRunner.createIndex(
      'sop_templates',
      new Index('idx_sop_templates_is_public', ['is_public']),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('sop_templates');
    await queryRunner.dropTable('sop_steps');
    await queryRunner.dropTable('sop_projects');
  }
}