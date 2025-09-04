/**
 * Test data factory for SOP Tool testing
 * Provides realistic test data based on actual business processes
 */

export interface SOPProject {
  id?: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  steps: SOPStep[];
  metadata: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SOPStep {
  id?: string;
  title: string;
  description: string;
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  estimatedDuration?: number;
  actualDuration?: number;
  assigneeRole?: string;
  prerequisites?: string[];
  outputs?: string[];
}

export interface SOPTemplate {
  id?: string;
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
  steps: SOPStep[];
  metadata: any;
}

export class TestDataFactory {
  
  /**
   * Create sample SOP projects for testing
   */
  static createSampleSOPs(): SOPProject[] {
    return [
      {
        title: 'Employee Onboarding - John Doe',
        description: 'Complete onboarding process for new software engineer',
        category: 'Onboarding',
        status: 'active',
        priority: 'high',
        steps: [
          {
            title: 'Prepare workspace and equipment',
            description: 'Set up desk, computer, monitor, and access cards for new employee',
            order: 1,
            status: 'completed',
            estimatedDuration: 60,
            assigneeRole: 'facilities',
            prerequisites: ['Employee start date confirmed', 'Desk assignment completed'],
            outputs: ['Workspace ready', 'Equipment assigned', 'Access cards prepared']
          },
          {
            title: 'Create IT accounts and access',
            description: 'Set up email, domain accounts, VPN, and necessary software licenses',
            order: 2,
            status: 'completed',
            estimatedDuration: 90,
            assigneeRole: 'it_admin',
            prerequisites: ['Employee information received', 'Manager approval'],
            outputs: ['Email account created', 'Domain account active', 'VPN access configured']
          },
          {
            title: 'Schedule orientation meetings',
            description: 'Coordinate meetings with HR, manager, and team members',
            order: 3,
            status: 'in_progress',
            estimatedDuration: 30,
            assigneeRole: 'hr_coordinator',
            prerequisites: ['Employee start date confirmed', 'Team availability checked'],
            outputs: ['Calendar invites sent', 'Meeting rooms booked', 'Agenda prepared']
          },
          {
            title: 'Conduct company orientation',
            description: 'Introduction to company culture, policies, and procedures',
            order: 4,
            status: 'pending',
            estimatedDuration: 120,
            assigneeRole: 'hr_manager',
            prerequisites: ['Orientation materials prepared', 'Meeting room available'],
            outputs: ['Orientation completed', 'Handbook acknowledged', 'Emergency contacts collected']
          },
          {
            title: 'Team introduction and role briefing',
            description: 'Meet team members and understand role responsibilities',
            order: 5,
            status: 'pending',
            estimatedDuration: 60,
            assigneeRole: 'direct_manager',
            prerequisites: ['Team members notified', 'Role documentation ready'],
            outputs: ['Team introductions completed', 'Role expectations clarified', 'Initial goals set']
          },
          {
            title: 'Complete compliance training',
            description: 'Mandatory training modules for security, safety, and compliance',
            order: 6,
            status: 'pending',
            estimatedDuration: 180,
            assigneeRole: 'employee',
            prerequisites: ['Training platform access', 'Compliance modules assigned'],
            outputs: ['Security training completed', 'Safety certification obtained', 'Compliance acknowledged']
          },
          {
            title: 'First week check-in',
            description: 'Review progress, address questions, and adjust onboarding plan',
            order: 7,
            status: 'pending',
            estimatedDuration: 45,
            assigneeRole: 'direct_manager',
            prerequisites: ['One week employment completed', 'Initial tasks assigned'],
            outputs: ['Check-in meeting completed', 'Feedback collected', 'Action items identified']
          }
        ],
        metadata: {
          employeeId: 'EMP-2024-001',
          startDate: '2024-01-15',
          department: 'Engineering',
          manager: 'Jane Smith',
          location: 'New York Office',
          employmentType: 'Full-time'
        }
      },
      
      {
        title: 'IT Security Incident Response - Data Breach Alert',
        description: 'Respond to potential data security breach in customer database',
        category: 'Security',
        status: 'active',
        priority: 'critical',
        steps: [
          {
            title: 'Initial incident assessment',
            description: 'Assess the scope, severity, and potential impact of the security incident',
            order: 1,
            status: 'completed',
            estimatedDuration: 30,
            actualDuration: 25,
            assigneeRole: 'security_analyst',
            prerequisites: ['Security monitoring tools access', 'Incident details available'],
            outputs: ['Incident severity classification', 'Initial impact assessment', 'Stakeholder notification list']
          },
          {
            title: 'Contain the incident',
            description: 'Implement immediate containment measures to prevent further damage',
            order: 2,
            status: 'completed',
            estimatedDuration: 45,
            actualDuration: 60,
            assigneeRole: 'security_engineer',
            prerequisites: ['Containment procedures documented', 'System access available'],
            outputs: ['Affected systems isolated', 'Network segments blocked', 'User access revoked']
          },
          {
            title: 'Notify stakeholders',
            description: 'Inform management, legal, and relevant teams about the incident',
            order: 3,
            status: 'in_progress',
            estimatedDuration: 20,
            assigneeRole: 'incident_commander',
            prerequisites: ['Stakeholder list prepared', 'Initial assessment complete'],
            outputs: ['Management notified', 'Legal team informed', 'Communication plan activated']
          },
          {
            title: 'Collect and preserve evidence',
            description: 'Gather digital forensics evidence while maintaining chain of custody',
            order: 4,
            status: 'pending',
            estimatedDuration: 120,
            assigneeRole: 'forensics_specialist',
            prerequisites: ['Forensics tools available', 'Evidence handling procedures'],
            outputs: ['System images captured', 'Log files preserved', 'Evidence chain documented']
          },
          {
            title: 'Investigate root cause',
            description: 'Analyze evidence to determine how the incident occurred and entry points',
            order: 5,
            status: 'pending',
            estimatedDuration: 180,
            assigneeRole: 'security_analyst',
            prerequisites: ['Evidence collection complete', 'Analysis tools configured'],
            outputs: ['Root cause identified', 'Attack vector documented', 'Timeline established']
          },
          {
            title: 'Implement remediation',
            description: 'Apply fixes and security improvements to address vulnerabilities',
            order: 6,
            status: 'pending',
            estimatedDuration: 240,
            assigneeRole: 'security_engineer',
            prerequisites: ['Root cause analysis complete', 'Remediation plan approved'],
            outputs: ['Vulnerabilities patched', 'Security controls enhanced', 'Systems hardened']
          },
          {
            title: 'Restore systems and services',
            description: 'Safely restore affected systems and validate security controls',
            order: 7,
            status: 'pending',
            estimatedDuration: 120,
            assigneeRole: 'systems_administrator',
            prerequisites: ['Remediation complete', 'Security validation passed'],
            outputs: ['Systems restored', 'Services operational', 'Monitoring enhanced']
          },
          {
            title: 'Post-incident review',
            description: 'Conduct lessons learned session and update incident response procedures',
            order: 8,
            status: 'pending',
            estimatedDuration: 90,
            assigneeRole: 'incident_commander',
            prerequisites: ['Incident resolved', 'All stakeholders available'],
            outputs: ['Post-incident report', 'Lessons learned documented', 'Procedures updated']
          }
        ],
        metadata: {
          incidentId: 'INC-SEC-2024-003',
          reportedBy: 'Automated monitoring system',
          affectedSystems: ['Customer database', 'Web application'],
          estimatedRecords: 50000,
          regulatoryRequirements: ['GDPR notification', 'SOX compliance'],
          externalParties: ['Legal counsel', 'Cyber insurance']
        }
      },

      {
        title: 'Customer Service Escalation - Enterprise Account Issue',
        description: 'Handle escalated technical issue for major enterprise customer',
        category: 'Customer Service',
        status: 'active',
        priority: 'high',
        steps: [
          {
            title: 'Acknowledge escalation',
            description: 'Confirm receipt of escalation and establish communication with customer',
            order: 1,
            status: 'completed',
            estimatedDuration: 15,
            actualDuration: 10,
            assigneeRole: 'senior_support',
            prerequisites: ['Escalation ticket received', 'Customer contact information'],
            outputs: ['Escalation acknowledged', 'Customer contacted', 'Initial timeline communicated']
          },
          {
            title: 'Review case history',
            description: 'Analyze previous interactions, attempted solutions, and technical details',
            order: 2,
            status: 'completed',
            estimatedDuration: 30,
            actualDuration: 45,
            assigneeRole: 'senior_support',
            prerequisites: ['Case history access', 'Technical documentation'],
            outputs: ['Case summary created', 'Previous solutions reviewed', 'Knowledge gaps identified']
          },
          {
            title: 'Engage technical specialists',
            description: 'Involve product engineers and subject matter experts as needed',
            order: 3,
            status: 'in_progress',
            estimatedDuration: 45,
            assigneeRole: 'support_manager',
            prerequisites: ['Technical requirements identified', 'Specialist availability'],
            outputs: ['Technical team engaged', 'Expertise assigned', 'Investigation plan created']
          },
          {
            title: 'Develop solution approach',
            description: 'Create comprehensive plan to resolve the customer issue',
            order: 4,
            status: 'pending',
            estimatedDuration: 60,
            assigneeRole: 'product_engineer',
            prerequisites: ['Problem analysis complete', 'Solution options identified'],
            outputs: ['Solution plan documented', 'Implementation steps defined', 'Risk assessment completed']
          },
          {
            title: 'Implement and test solution',
            description: 'Execute solution in controlled environment and validate results',
            order: 5,
            status: 'pending',
            estimatedDuration: 120,
            assigneeRole: 'product_engineer',
            prerequisites: ['Solution plan approved', 'Test environment prepared'],
            outputs: ['Solution implemented', 'Testing completed', 'Results validated']
          },
          {
            title: 'Customer validation and closure',
            description: 'Confirm resolution with customer and close escalation case',
            order: 6,
            status: 'pending',
            estimatedDuration: 30,
            assigneeRole: 'senior_support',
            prerequisites: ['Solution tested', 'Customer availability'],
            outputs: ['Customer confirmation received', 'Case documentation updated', 'Escalation closed']
          }
        ],
        metadata: {
          customerId: 'CUST-ENT-001',
          customerName: 'Global Tech Solutions',
          accountManager: 'Sarah Johnson',
          contractValue: 500000,
          slaRequirement: '4 hours response',
          escalationReason: 'Service downtime affecting production'
        }
      }
    ];
  }

  /**
   * Create sample SOP templates for testing
   */
  static createSampleTemplates(): SOPTemplate[] {
    return [
      {
        title: 'Employee Onboarding Template',
        description: 'Standard template for onboarding new employees across all departments',
        category: 'Onboarding',
        isPublic: true,
        steps: [
          {
            title: 'Prepare workspace',
            description: 'Set up physical workspace and equipment for new employee',
            order: 1,
            status: 'pending',
            estimatedDuration: 60,
            assigneeRole: 'facilities',
            prerequisites: ['Employee details received', 'Start date confirmed'],
            outputs: ['Workspace ready', 'Equipment assigned']
          },
          {
            title: 'Create IT accounts',
            description: 'Set up all necessary IT accounts and access permissions',
            order: 2,
            status: 'pending',
            estimatedDuration: 90,
            assigneeRole: 'it_admin',
            prerequisites: ['Employee information', 'Manager approval'],
            outputs: ['Accounts created', 'Access configured']
          },
          {
            title: 'Conduct orientation',
            description: 'Provide company orientation and policy overview',
            order: 3,
            status: 'pending',
            estimatedDuration: 120,
            assigneeRole: 'hr_manager',
            prerequisites: ['Orientation materials ready'],
            outputs: ['Orientation completed', 'Policies acknowledged']
          }
        ],
        metadata: {
          version: '2.1',
          lastUpdated: '2024-01-01',
          department: 'Human Resources',
          approver: 'HR Director',
          complianceRequirements: ['Employment law', 'Safety regulations'],
          estimatedTotalDuration: 480
        }
      }
    ];
  }

  /**
   * Create test user data
   */
  static createTestUsers() {
    return [
      {
        id: 'user-001',
        email: 'test.manager@company.com',
        firstName: 'Test',
        lastName: 'Manager',
        role: 'MANAGER',
        department: 'IT',
        isActive: true
      },
      {
        id: 'user-002', 
        email: 'test.employee@company.com',
        firstName: 'Test',
        lastName: 'Employee',
        role: 'USER',
        department: 'Engineering',
        isActive: true
      },
      {
        id: 'user-003',
        email: 'test.admin@company.com',
        firstName: 'Test',
        lastName: 'Admin',
        role: 'ADMIN',
        department: 'IT',
        isActive: true
      }
    ];
  }

  /**
   * Create performance test data sets
   */
  static createPerformanceTestData() {
    return {
      small: {
        projects: 10,
        stepsPerProject: 5,
        templatesCount: 3
      },
      medium: {
        projects: 100,
        stepsPerProject: 8,
        templatesCount: 15
      },
      large: {
        projects: 1000,
        stepsPerProject: 12,
        templatesCount: 50
      }
    };
  }

  /**
   * Generate bulk SOP projects for performance testing
   */
  static generateBulkSOPs(count: number): SOPProject[] {
    const categories = ['Onboarding', 'IT', 'Security', 'Finance', 'HR', 'Operations'];
    const priorities = ['low', 'medium', 'high', 'critical'] as const;
    const statuses = ['active', 'completed', 'archived'] as const;
    
    const projects: SOPProject[] = [];
    
    for (let i = 1; i <= count; i++) {
      projects.push({
        title: `Test SOP Project ${i.toString().padStart(4, '0')}`,
        description: `Generated test project for performance testing - Project ${i}`,
        category: categories[i % categories.length],
        status: statuses[i % statuses.length],
        priority: priorities[i % priorities.length],
        steps: this.generateStepsForProject(Math.floor(Math.random() * 8) + 3), // 3-10 steps
        metadata: {
          testProject: true,
          generatedAt: new Date().toISOString(),
          projectNumber: i
        }
      });
    }
    
    return projects;
  }

  /**
   * Generate steps for a project
   */
  private static generateStepsForProject(stepCount: number): SOPStep[] {
    const steps: SOPStep[] = [];
    const stepTemplates = [
      'Review requirements',
      'Gather information',
      'Analyze data',
      'Create documentation',
      'Implement changes',
      'Test solution',
      'Get approval',
      'Deploy changes',
      'Monitor results',
      'Update records'
    ];
    
    for (let i = 1; i <= stepCount; i++) {
      steps.push({
        title: stepTemplates[(i - 1) % stepTemplates.length] + ` - Step ${i}`,
        description: `Detailed description for step ${i} of the test project`,
        order: i,
        status: Math.random() > 0.7 ? 'completed' : 'pending',
        estimatedDuration: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
        assigneeRole: 'test_user'
      });
    }
    
    return steps;
  }

  /**
   * Create API test payloads
   */
  static createAPITestPayloads() {
    return {
      createProject: {
        title: 'API Test Project',
        description: 'Project created through API testing',
        category: 'Testing',
        priority: 'medium',
        metadata: {
          createdVia: 'API test',
          testCase: 'create-project'
        }
      },
      updateProject: {
        title: 'Updated API Test Project',
        priority: 'high',
        status: 'active'
      },
      createStep: {
        title: 'Test Step',
        description: 'Step created through API testing',
        order: 1,
        estimatedDuration: 60
      },
      invalidData: {
        title: '', // Invalid: empty title
        category: 'InvalidCategory123456789012345678901234567890', // Invalid: too long
        priority: 'invalid_priority' // Invalid: not in allowed values
      }
    };
  }
}

/**
 * Database test utilities
 */
export class DatabaseTestUtils {
  static getTestQueries() {
    return {
      // Cleanup queries for test isolation
      cleanup: [
        'DELETE FROM sop_steps WHERE project_id IN (SELECT id FROM sop_projects WHERE metadata @> \'{"testProject": true}\')',
        'DELETE FROM sop_projects WHERE metadata @> \'{"testProject": true}\'',
        'DELETE FROM sop_templates WHERE metadata @> \'{"testTemplate": true}\''
      ],
      
      // Validation queries
      validation: {
        checkProjectExists: 'SELECT COUNT(*) FROM sop_projects WHERE id = $1',
        checkStepOrder: 'SELECT order_num FROM sop_steps WHERE project_id = $1 ORDER BY order_num',
        checkAuditLog: 'SELECT COUNT(*) FROM sop_audit_logs WHERE entity_id = $1',
        checkTemplateUsage: 'SELECT COUNT(*) FROM sop_projects WHERE template_id = $1'
      },
      
      // Performance test queries
      performance: {
        bulkInsertProjects: `
          INSERT INTO sop_projects (title, description, category, status, priority, metadata, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING id
        `,
        bulkInsertSteps: `
          INSERT INTO sop_steps (project_id, title, description, order_num, status, estimated_duration, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        `
      }
    };
  }
}