/**
 * SOP Terminology Mappings
 * 
 * Defines the complete mapping from Activepieces terminology to SOP-specific language
 */

import { TerminologyMapping, TerminologySet } from './types';

// Core Flow-Related Terminology Mappings
export const FLOW_MAPPINGS: TerminologyMapping[] = [
  {
    original: 'Flow',
    sop: 'Standard Operating Procedure',
    context: ['general', 'flow-builder', 'dashboard'],
    priority: 'critical',
    description: 'Core concept mapping from Flow to SOP',
    aliases: ['Flows', 'flow', 'flows'],
    wholeWordsOnly: true
  },
  {
    original: 'Workflow',
    sop: 'Process',
    context: ['general', 'flow-builder', 'dashboard'],
    priority: 'high',
    description: 'Workflow becomes Process in SOP context',
    aliases: ['Workflows', 'workflow', 'workflows']
  },
  {
    original: 'Automation',
    sop: 'Procedure',
    context: ['general', 'dashboard'],
    priority: 'high',
    description: 'Automation becomes Procedure',
    aliases: ['Automations', 'automation', 'automations']
  },
  {
    original: 'Run',
    sop: 'Execution',
    context: ['general', 'flow-builder', 'dashboard', 'status'],
    priority: 'medium',
    description: 'Flow runs become procedure executions',
    aliases: ['Runs', 'run', 'runs', 'Running', 'running']
  },
  {
    original: 'Execute',
    sop: 'Perform',
    context: ['general', 'flow-builder', 'buttons'],
    priority: 'medium',
    description: 'Execute becomes Perform in SOP context',
    aliases: ['Execution', 'execution', 'executing', 'Executing']
  }
];

// Trigger-Related Terminology
export const TRIGGER_MAPPINGS: TerminologyMapping[] = [
  {
    original: 'Trigger',
    sop: 'Initiator',
    context: ['flow-builder', 'general'],
    priority: 'critical',
    description: 'Trigger becomes Initiator for SOP processes',
    aliases: ['Triggers', 'trigger', 'triggers', 'Triggering', 'triggering']
  },
  {
    original: 'Start Event',
    sop: 'Process Initiator',
    context: ['flow-builder'],
    priority: 'high',
    description: 'Start events initiate SOP processes'
  },
  {
    original: 'Webhook',
    sop: 'External Signal',
    context: ['flow-builder'],
    priority: 'medium',
    description: 'Webhooks become external signals in SOP context'
  },
  {
    original: 'Schedule',
    sop: 'Timer',
    context: ['flow-builder'],
    priority: 'medium',
    description: 'Scheduled triggers become timers'
  }
];

// Action and Step Terminology
export const ACTION_MAPPINGS: TerminologyMapping[] = [
  {
    original: 'Action',
    sop: 'Task',
    context: ['flow-builder', 'general'],
    priority: 'critical',
    description: 'Actions become Tasks in SOP processes',
    aliases: ['Actions', 'action', 'actions']
  },
  {
    original: 'Step',
    sop: 'Process Step',
    context: ['flow-builder', 'general'],
    priority: 'high',
    description: 'Steps become Process Steps',
    aliases: ['Steps', 'step', 'steps']
  },
  {
    original: 'Task',
    sop: 'Activity',
    context: ['flow-builder', 'general'],
    priority: 'medium',
    description: 'Tasks become Activities when not referring to SOP Tasks'
  },
  {
    original: 'Operation',
    sop: 'Procedure',
    context: ['flow-builder'],
    priority: 'medium',
    description: 'Operations become Procedures'
  }
];

// Connection and Integration Terminology  
export const CONNECTION_MAPPINGS: TerminologyMapping[] = [
  {
    original: 'Connection',
    sop: 'System Integration',
    context: ['general', 'settings', 'flow-builder'],
    priority: 'high',
    description: 'Connections become System Integrations',
    aliases: ['Connections', 'connection', 'connections']
  },
  {
    original: 'Connect',
    sop: 'Integrate',
    context: ['buttons', 'forms', 'flow-builder'],
    priority: 'high',
    description: 'Connect becomes Integrate',
    aliases: ['Connecting', 'connecting', 'Connected', 'connected']
  },
  {
    original: 'Integration',
    sop: 'System Link',
    context: ['general', 'settings'],
    priority: 'medium',
    description: 'Generic integrations become System Links when not referring to SOP integrations'
  },
  {
    original: 'API',
    sop: 'Service Interface',
    context: ['flow-builder', 'settings'],
    priority: 'low',
    description: 'API becomes Service Interface in user-facing contexts'
  }
];

// Piece and Component Terminology
export const PIECE_MAPPINGS: TerminologyMapping[] = [
  {
    original: 'Piece',
    sop: 'Component',
    context: ['flow-builder', 'general'],
    priority: 'critical',
    description: 'Pieces become Components',
    aliases: ['Pieces', 'piece', 'pieces']
  },
  {
    original: 'Component',
    sop: 'Tool',
    context: ['flow-builder', 'general'],
    priority: 'medium',
    description: 'Components become Tools when not referring to SOP components'
  },
  {
    original: 'Plugin',
    sop: 'Extension',
    context: ['general', 'settings'],
    priority: 'medium',
    description: 'Plugins become Extensions'
  },
  {
    original: 'Module',
    sop: 'Unit',
    context: ['general'],
    priority: 'low',
    description: 'Modules become Units'
  }
];

// User Interface Terminology
export const UI_MAPPINGS: TerminologyMapping[] = [
  {
    original: 'Dashboard',
    sop: 'Control Center',
    context: ['dashboard', 'general'],
    priority: 'medium',
    description: 'Dashboard becomes Control Center'
  },
  {
    original: 'Builder',
    sop: 'Designer',
    context: ['flow-builder'],
    priority: 'high',
    description: 'Flow Builder becomes Process Designer'
  },
  {
    original: 'Canvas',
    sop: 'Workspace',
    context: ['flow-builder'],
    priority: 'medium',
    description: 'Canvas becomes Workspace'
  },
  {
    original: 'Editor',
    sop: 'Designer',
    context: ['flow-builder', 'general'],
    priority: 'medium',
    description: 'Editor becomes Designer'
  },
  {
    original: 'Template',
    sop: 'Blueprint',
    context: ['general', 'dashboard'],
    priority: 'medium',
    description: 'Templates become Blueprints',
    aliases: ['Templates', 'template', 'templates']
  }
];

// Status and State Terminology
export const STATUS_MAPPINGS: TerminologyMapping[] = [
  {
    original: 'Published',
    sop: 'Active',
    context: ['status', 'flow-builder'],
    priority: 'high',
    description: 'Published SOPs are Active'
  },
  {
    original: 'Draft',
    sop: 'In Development',
    context: ['status', 'flow-builder'],
    priority: 'high',
    description: 'Draft SOPs are In Development'
  },
  {
    original: 'Enabled',
    sop: 'Operational',
    context: ['status'],
    priority: 'medium',
    description: 'Enabled becomes Operational'
  },
  {
    original: 'Disabled',
    sop: 'Inactive',
    context: ['status'],
    priority: 'medium',
    description: 'Disabled becomes Inactive'
  },
  {
    original: 'Failed',
    sop: 'Error',
    context: ['status', 'errors'],
    priority: 'high',
    description: 'Failed becomes Error for clarity'
  },
  {
    original: 'Succeeded',
    sop: 'Completed',
    context: ['status'],
    priority: 'medium',
    description: 'Succeeded becomes Completed'
  }
];

// Data and Storage Terminology
export const DATA_MAPPINGS: TerminologyMapping[] = [
  {
    original: 'Table',
    sop: 'Data Store',
    context: ['general', 'dashboard'],
    priority: 'medium',
    description: 'Tables become Data Stores',
    aliases: ['Tables', 'table', 'tables']
  },
  {
    original: 'Record',
    sop: 'Entry',
    context: ['general'],
    priority: 'low',
    description: 'Records become Entries',
    aliases: ['Records', 'record', 'records']
  },
  {
    original: 'Database',
    sop: 'Data Repository',
    context: ['general', 'settings'],
    priority: 'low',
    description: 'Database becomes Data Repository'
  }
];

// Business Process Terminology
export const BUSINESS_MAPPINGS: TerminologyMapping[] = [
  {
    original: 'Project',
    sop: 'Process Group',
    context: ['general', 'dashboard', 'settings'],
    priority: 'high',
    description: 'Projects organize process groups',
    aliases: ['Projects', 'project', 'projects']
  },
  {
    original: 'Team',
    sop: 'Process Team',
    context: ['general', 'settings'],
    priority: 'medium',
    description: 'Teams become Process Teams'
  },
  {
    original: 'Organization',
    sop: 'Enterprise',
    context: ['general', 'admin'],
    priority: 'low',
    description: 'Organization becomes Enterprise'
  },
  {
    original: 'Workspace',
    sop: 'Process Environment',
    context: ['general'],
    priority: 'medium',
    description: 'Workspace becomes Process Environment'
  }
];

// Error and Help Terminology
export const ERROR_MAPPINGS: TerminologyMapping[] = [
  {
    original: 'Error',
    sop: 'Issue',
    context: ['errors'],
    priority: 'medium',
    description: 'Errors become Issues for user-friendliness'
  },
  {
    original: 'Bug',
    sop: 'Problem',
    context: ['errors', 'help'],
    priority: 'medium',
    description: 'Bugs become Problems'
  },
  {
    original: 'Debug',
    sop: 'Troubleshoot',
    context: ['help', 'errors'],
    priority: 'low',
    description: 'Debug becomes Troubleshoot'
  }
];

// Combine all mappings into complete sets
export const SOP_TERMINOLOGY_MAPPINGS: TerminologyMapping[] = [
  ...FLOW_MAPPINGS,
  ...TRIGGER_MAPPINGS,
  ...ACTION_MAPPINGS,
  ...CONNECTION_MAPPINGS,
  ...PIECE_MAPPINGS,
  ...UI_MAPPINGS,
  ...STATUS_MAPPINGS,
  ...DATA_MAPPINGS,
  ...BUSINESS_MAPPINGS,
  ...ERROR_MAPPINGS
];

// Default Activepieces Terminology Set (no translations)
export const DEFAULT_TERMINOLOGY_SET: TerminologySet = {
  id: 'default',
  name: 'Activepieces Default',
  description: 'Original Activepieces terminology without modifications',
  version: '1.0.0',
  mappings: [], // No mappings = no translations
  metadata: {
    lastUpdated: new Date().toISOString(),
    isDefault: true,
    tags: ['default', 'original', 'activepieces']
  }
};

// SOP Terminology Set
export const SOP_TERMINOLOGY_SET: TerminologySet = {
  id: 'sop',
  name: 'Standard Operating Procedure',
  description: 'Complete SOP-focused terminology for business process management',
  version: '1.0.0',
  mappings: SOP_TERMINOLOGY_MAPPINGS,
  metadata: {
    author: 'SOP Customization Team',
    lastUpdated: new Date().toISOString(),
    isDefault: false,
    tags: ['sop', 'business-process', 'standard-operating-procedure', 'enterprise']
  }
};

// Custom Terminology Set Template
export const CUSTOM_TERMINOLOGY_SET: TerminologySet = {
  id: 'custom',
  name: 'Custom Terminology',
  description: 'User-defined custom terminology mappings',
  version: '1.0.0',
  mappings: [],
  metadata: {
    lastUpdated: new Date().toISOString(),
    isDefault: false,
    tags: ['custom', 'user-defined', 'editable']
  }
};

// All available terminology sets
export const TERMINOLOGY_SETS: Record<string, TerminologySet> = {
  default: DEFAULT_TERMINOLOGY_SET,
  sop: SOP_TERMINOLOGY_SET,
  custom: CUSTOM_TERMINOLOGY_SET
};

// Common patterns to exclude from translation
export const EXCLUDE_PATTERNS = [
  // Technical terms that should remain unchanged
  'JSON',
  'HTTP',
  'HTTPS',
  'URL',
  'API',
  'UUID',
  'ID',
  'CSS',
  'HTML',
  'JavaScript',
  'TypeScript',
  
  // File extensions
  '\\.json',
  '\\.js',
  '\\.ts',
  '\\.tsx',
  '\\.css',
  '\\.html',
  
  // Code-like patterns
  '\\{\\{.*?\\}\\}', // Template variables
  '\\$\\{.*?\\}',    // Template literals
  '`.*?`',           // Code blocks
  
  // URLs and emails
  'https?:\\/\\/[^\\s]+',
  '[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}',
  
  // Version numbers
  'v?\\d+\\.\\d+\\.\\d+',
  
  // Database-like patterns
  '[a-zA-Z_][a-zA-Z0-9_]*\\.[a-zA-Z_][a-zA-Z0-9_]*', // table.column
];

// Helper function to get mappings by context
export function getMappingsByContext(context: string): TerminologyMapping[] {
  return SOP_TERMINOLOGY_MAPPINGS.filter(mapping => 
    mapping.context.includes(context as any)
  );
}

// Helper function to get high-priority mappings
export function getHighPriorityMappings(): TerminologyMapping[] {
  return SOP_TERMINOLOGY_MAPPINGS.filter(mapping => 
    mapping.priority === 'critical' || mapping.priority === 'high'
  );
}

// Helper function to validate a terminology set
export function validateTerminologySet(set: TerminologySet): { 
  isValid: boolean; 
  errors: string[]; 
} {
  const errors: string[] = [];
  
  // Check required fields
  if (!set.id) errors.push('ID is required');
  if (!set.name) errors.push('Name is required');
  if (!set.version) errors.push('Version is required');
  
  // Validate mappings
  set.mappings.forEach((mapping, index) => {
    if (!mapping.original) {
      errors.push(`Mapping ${index}: Original term is required`);
    }
    if (!mapping.sop) {
      errors.push(`Mapping ${index}: SOP term is required`);
    }
    if (!mapping.context || mapping.context.length === 0) {
      errors.push(`Mapping ${index}: At least one context is required`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}