/**
 * SOP Template Entity
 * Represents a reusable SOP template in the database
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';

@Entity('sop_templates')
@Index(['category'])
@Index(['difficulty'])
@Index(['isActive'])
@Index(['isFeatured'])
@Index(['rating'])
@Index(['usageCount'])
export class SopTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  longDescription: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ 
    type: 'enum',
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  })
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  @Column({ type: 'int', default: 30 })
  estimatedTime: number; // minutes

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number; // 0.00 to 5.00

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'varchar', length: 255 })
  author: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  authorEmail: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  previewUrl: string;

  // Prerequisites as JSON array
  @Column({ type: 'jsonb', nullable: true })
  prerequisites: string[];

  // Expected outcomes as JSON array
  @Column({ type: 'jsonb', nullable: true })
  outcomes: string[];

  // Compliance information
  @Column({ type: 'jsonb', nullable: true })
  compliance: {
    standards: string[];
    auditTrail: boolean;
    approvalRequired: boolean;
  };

  // Version information
  @Column({ type: 'varchar', length: 50, default: '1.0.0' })
  version: string;

  @Column({ type: 'text', nullable: true })
  changeLog: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => SopTemplateStep, step => step.template, {
    cascade: true,
    eager: false
  })
  steps: SopTemplateStep[];

  @OneToMany(() => SopTemplateResource, resource => resource.template, {
    cascade: true,
    eager: false
  })
  resources: SopTemplateResource[];

  @OneToMany(() => SopTemplateBookmark, bookmark => bookmark.template, {
    cascade: true,
    eager: false
  })
  bookmarks: SopTemplateBookmark[];

  @OneToMany(() => SopTemplateReview, review => review.template, {
    cascade: true,
    eager: false
  })
  reviews: SopTemplateReview[];
}

@Entity('sop_template_steps')
@Index(['templateId', 'position'])
export class SopTemplateStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  templateId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  position: number;

  @Column({ type: 'int', default: 30 })
  estimatedDuration: number; // minutes

  @Column({ type: 'boolean', default: true })
  isRequired: boolean;

  @Column({ type: 'boolean', default: false })
  hasValidation: boolean;

  // Input schema for step validation
  @Column({ type: 'jsonb', nullable: true })
  inputSchema: any;

  // Output schema for step results
  @Column({ type: 'jsonb', nullable: true })
  outputSchema: any;

  // Validation rules
  @Column({ type: 'simple-array', nullable: true })
  validationRules: string[];

  // Input fields definition
  @Column({ type: 'jsonb', nullable: true })
  inputs: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'file';
    required: boolean;
    label?: string;
    placeholder?: string;
    options?: string[]; // for select type
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => SopTemplate, template => template.steps, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'templateId' })
  template: SopTemplate;
}

@Entity('sop_template_resources')
export class SopTemplateResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  templateId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum',
    enum: ['document', 'link', 'video', 'image', 'template'],
    default: 'document'
  })
  type: 'document' | 'link' | 'video' | 'image' | 'template';

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mimeType: string;

  @Column({ type: 'int', nullable: true })
  fileSize: number; // bytes

  @Column({ type: 'boolean', default: false })
  isRequired: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => SopTemplate, template => template.resources, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'templateId' })
  template: SopTemplate;
}

@Entity('sop_template_bookmarks')
@Index(['userId'])
@Index(['templateId', 'userId'], { unique: true })
export class SopTemplateBookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  templateId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => SopTemplate, template => template.bookmarks, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'templateId' })
  template: SopTemplate;
}

@Entity('sop_template_reviews')
@Index(['templateId'])
@Index(['userId'])
@Index(['templateId', 'userId'], { unique: true })
export class SopTemplateReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  templateId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'int', check: 'rating >= 1 AND rating <= 5' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => SopTemplate, template => template.reviews, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'templateId' })
  template: SopTemplate;
}

@Entity('sop_template_usage')
@Index(['templateId'])
@Index(['userId'])
@Index(['projectId'])
@Index(['createdAt'])
export class SopTemplateUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  templateId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid', nullable: true })
  sopProjectId: string; // The SOP created from this template

  @CreateDateColumn()
  createdAt: Date;

  // Relation to template
  @ManyToOne(() => SopTemplate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'templateId' })
  template: SopTemplate;
}