import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SopProject } from './sop-project.entity';
import { SopStep } from './sop-step.entity';

export enum SopExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('sop_executions')
@Index('idx_sop_executions_project_id', ['projectId'])
@Index('idx_sop_executions_status', ['status'])
@Index('idx_sop_executions_created_at', ['createdAt'])
export class SopExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid', nullable: false })
  projectId: string;

  @Column({ name: 'step_id', type: 'uuid', nullable: true })
  stepId: string | null;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({
    type: 'enum',
    enum: SopExecutionStatus,
    default: SopExecutionStatus.PENDING,
  })
  status: SopExecutionStatus;

  @Column({ name: 'input_data', type: 'jsonb', nullable: true })
  inputData: Record<string, any> | null;

  @Column({ name: 'output_data', type: 'jsonb', nullable: true })
  outputData: Record<string, any> | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => SopProject, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: SopProject;

  @ManyToOne(() => SopStep, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'step_id' })
  step: SopStep | null;
}