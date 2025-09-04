import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { SopProject } from './sop-project.entity';

@Entity('sop_steps')
@Index('idx_sop_steps_project_id', ['projectId'])
@Index('idx_sop_steps_position', ['projectId', 'position'])
export class SopStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid', nullable: false })
  projectId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'step_type', type: 'varchar', length: 100, nullable: false })
  stepType: string;

  @Column({ type: 'jsonb', nullable: true })
  configuration: Record<string, any> | null;

  @Column({ type: 'integer', nullable: false })
  position: number;

  @Column({ name: 'parent_step_id', type: 'uuid', nullable: true })
  parentStepId: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => SopProject, (project) => project.steps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: SopProject;

  @ManyToOne(() => SopStep, (step) => step.childSteps, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_step_id' })
  parentStep: SopStep | null;

  @OneToMany(() => SopStep, (step) => step.parentStep)
  childSteps: SopStep[];
}