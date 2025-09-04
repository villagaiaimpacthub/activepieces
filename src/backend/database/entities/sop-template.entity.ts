import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('sop_templates')
@Index('idx_sop_templates_category', ['category'])
@Index('idx_sop_templates_is_public', ['isPublic'])
export class SopTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 100, nullable: false })
  category: string;

  @Column({ name: 'template_data', type: 'jsonb', nullable: false })
  templateData: Record<string, any>;

  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ name: 'usage_count', type: 'integer', default: 0 })
  usageCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}