import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SopProject } from './sop-project.entity';
import { SopStep } from './sop-step.entity';
import { SopExecution } from './sop-execution.entity';

export enum SopAuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  APPROVE = 'approve',
  REJECT = 'reject',
  CANCEL = 'cancel',
}

export enum SopAuditEntityType {
  PROJECT = 'project',
  STEP = 'step',
  TEMPLATE = 'template',
  EXECUTION = 'execution',
}

@Entity('sop_audit_logs')
@Index('idx_sop_audit_logs_entity_type', ['entityType'])
@Index('idx_sop_audit_logs_action', ['action'])
@Index('idx_sop_audit_logs_user_id', ['userId'])
@Index('idx_sop_audit_logs_created_at', ['createdAt'])
@Index('idx_sop_audit_logs_project_id', ['projectId'])
export class SopAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entity_type', type: 'enum', enum: SopAuditEntityType })
  entityType: SopAuditEntityType;

  @Column({ name: 'entity_id', type: 'uuid', nullable: false })
  entityId: string;

  @Column({ type: 'enum', enum: SopAuditAction })
  action: SopAuditAction;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null;

  @Column({ name: 'step_id', type: 'uuid', nullable: true })
  stepId: string | null;

  @Column({ name: 'execution_id', type: 'uuid', nullable: true })
  executionId: string | null;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues: Record<string, any> | null;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues: Record<string, any> | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => SopProject, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'project_id' })
  project: SopProject | null;

  @ManyToOne(() => SopStep, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'step_id' })
  step: SopStep | null;

  @ManyToOne(() => SopExecution, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'execution_id' })
  execution: SopExecution | null;
}