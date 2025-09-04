import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { SopStep } from './sop-step.entity';

export enum SopProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Entity('sop_projects')
@Index('idx_sop_projects_status', ['status'])
@Index('idx_sop_projects_created_at', ['createdAt'])
export class SopProject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: SopProjectStatus,
    default: SopProjectStatus.DRAFT,
  })
  status: SopProjectStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'integer', default: 1 })
  version: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => SopStep, (step) => step.project, { cascade: true })
  steps: SopStep[];
}