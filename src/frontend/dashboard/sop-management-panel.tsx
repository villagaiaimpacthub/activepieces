/**
 * SOP Management Panel - Comprehensive SOP/Process management interface
 * Provides creation, editing, organization, and administration tools
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  Archive,
  Settings,
  Users,
  Calendar,
  Tag,
  FolderOpen,
  Upload,
  Download,
  Eye,
  GitBranch
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeSystem } from '@/components/theme/theme-system-provider';

export interface ManagementAction {
  id: string;
  label: string;
  sopLabel?: string;
  icon: React.ReactNode;
  action: string;
  permissions?: string[];
  variant?: 'primary' | 'secondary' | 'destructive';
}

export interface SOPManagementPanelProps {
  userRole?: 'admin' | 'manager' | 'user';
  config?: {
    showBulkActions?: boolean;
    showAdvancedSettings?: boolean;
    enableTemplateManagement?: boolean;
    itemsPerPage?: number;
  };
  onActionClick?: (action: string, data?: any) => void;
  className?: string;
}

interface SOPItem {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'paused' | 'archived';
  version: string;
  lastModified: string;
  owner: string;
  category: string;
  tags: string[];
  executions: number;
  successRate: number;
  permissions: string[];
}

const mockSOPs: SOPItem[] = [
  {
    id: '1',
    name: 'Customer Onboarding Process',
    description: 'Complete customer onboarding workflow with verification steps',
    status: 'active',
    version: '2.1',
    lastModified: '2024-01-15',
    owner: 'Alice Johnson',
    category: 'Customer Service',
    tags: ['onboarding', 'customer', 'verification'],
    executions: 156,
    successRate: 94.2,
    permissions: ['read', 'write', 'execute']
  },
  {
    id: '2',
    name: 'Employee Training Protocol',
    description: 'Comprehensive training workflow for new employees',
    status: 'active',
    version: '1.5',
    lastModified: '2024-01-12',
    owner: 'Bob Smith',
    category: 'Human Resources',
    tags: ['training', 'onboarding', 'hr'],
    executions: 89,
    successRate: 98.9,
    permissions: ['read', 'execute']
  },
  {
    id: '3',
    name: 'Quality Assurance Checklist',
    description: 'Automated quality checks and validation procedures',
    status: 'draft',
    version: '0.9',
    lastModified: '2024-01-10',
    owner: 'Carol Davis',
    category: 'Quality Control',
    tags: ['qa', 'validation', 'checklist'],
    executions: 0,
    successRate: 0,
    permissions: ['read', 'write']
  },
  {
    id: '4',
    name: 'Incident Response Procedure',
    description: 'Emergency response workflow for system incidents',
    status: 'paused',
    version: '1.2',
    lastModified: '2024-01-08',
    owner: 'David Wilson',
    category: 'IT Operations',
    tags: ['incident', 'emergency', 'response'],
    executions: 23,
    successRate: 91.3,
    permissions: ['read']
  },
  {
    id: '5',
    name: 'Monthly Report Generation',
    description: 'Automated monthly reporting and data aggregation',
    status: 'active',
    version: '3.0',
    lastModified: '2024-01-14',
    owner: 'Eve Chen',
    category: 'Reporting',
    tags: ['reporting', 'automation', 'monthly'],
    executions: 67,
    successRate: 95.5,
    permissions: ['read', 'write', 'execute']
  }
];

const SOPManagementPanel: React.FC<SOPManagementPanelProps> = ({
  userRole = 'user',
  config = {},
  onActionClick,
  className
}) => {
  const { isCustomBranded } = useThemeSystem();
  const [sops, setSOPs] = useState<SOPItem[]>(mockSOPs);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSOPs, setSelectedSOPs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'executions' | 'success'>('modified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const {
    showBulkActions = userRole !== 'user',
    showAdvancedSettings = userRole === 'admin',
    enableTemplateManagement = true,
    itemsPerPage = 10
  } = config;

  // Filter and sort SOPs
  const filteredSOPs = React.useMemo(() => {
    let filtered = sops.filter(sop => {
      const matchesSearch = sop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           sop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           sop.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || sop.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || sop.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'modified':
          aVal = new Date(a.lastModified).getTime();
          bVal = new Date(b.lastModified).getTime();
          break;
        case 'executions':
          aVal = a.executions;
          bVal = b.executions;
          break;
        case 'success':
          aVal = a.successRate;
          bVal = b.successRate;
          break;
        default:
          return 0;
      }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      } else {
        return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      }
    });

    return filtered;
  }, [sops, searchQuery, selectedCategory, selectedStatus, sortBy, sortOrder]);

  // Get unique categories
  const categories = React.useMemo(() => {
    return ['all', ...Array.from(new Set(sops.map(sop => sop.category)))];
  }, [sops]);

  const handleActionClick = (action: string, data?: any) => {
    onActionClick?.(action, data);
  };

  const handleSOPAction = (sopId: string, action: string) => {
    switch (action) {
      case 'edit':
        handleActionClick('edit-sop', { sopId });
        break;
      case 'duplicate':
        handleActionClick('duplicate-sop', { sopId });
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this SOP?')) {
          setSOPs(prev => prev.filter(sop => sop.id !== sopId));
          handleActionClick('delete-sop', { sopId });
        }
        break;
      case 'toggle-status':
        setSOPs(prev => prev.map(sop => 
          sop.id === sopId 
            ? { ...sop, status: sop.status === 'active' ? 'paused' : 'active' as any }
            : sop
        ));
        handleActionClick('toggle-sop-status', { sopId });
        break;
      case 'view':
        handleActionClick('view-sop', { sopId });
        break;
      case 'permissions':
        handleActionClick('manage-sop-permissions', { sopId });
        break;
      default:
        handleActionClick(action, { sopId });
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedSOPs.length === 0) return;
    
    switch (action) {
      case 'bulk-delete':
        if (confirm(`Delete ${selectedSOPs.length} selected SOPs?`)) {
          setSOPs(prev => prev.filter(sop => !selectedSOPs.includes(sop.id)));
          setSelectedSOPs([]);
          handleActionClick('bulk-delete-sops', { sopIds: selectedSOPs });
        }
        break;
      case 'bulk-activate':
        setSOPs(prev => prev.map(sop => 
          selectedSOPs.includes(sop.id) ? { ...sop, status: 'active' as any } : sop
        ));
        setSelectedSOPs([]);
        handleActionClick('bulk-activate-sops', { sopIds: selectedSOPs });
        break;
      case 'bulk-pause':
        setSOPs(prev => prev.map(sop => 
          selectedSOPs.includes(sop.id) ? { ...sop, status: 'paused' as any } : sop
        ));
        setSelectedSOPs([]);
        handleActionClick('bulk-pause-sops', { sopIds: selectedSOPs });
        break;
      default:
        handleActionClick(action, { sopIds: selectedSOPs });
    }
  };

  const toggleSOPSelection = (sopId: string) => {
    setSelectedSOPs(prev => 
      prev.includes(sopId) 
        ? prev.filter(id => id !== sopId)
        : [...prev, sopId]
    );
  };

  const getStatusIcon = (status: SOPItem['status']) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4 text-green-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-orange-500" />;
      case 'draft': return <Edit className="h-4 w-4 text-blue-500" />;
      case 'archived': return <Archive className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: SOPItem['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
    }
  };

  const renderSOPCard = (sop: SOPItem) => (
    <div
      key={sop.id}
      className={cn(
        "group p-4 bg-card border rounded-lg hover:shadow-md transition-all",
        selectedSOPs.includes(sop.id) && "ring-2 ring-primary/50 bg-primary/5"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {showBulkActions && (
            <input
              type="checkbox"
              checked={selectedSOPs.includes(sop.id)}
              onChange={() => toggleSOPSelection(sop.id)}
              className="mt-1"
            />
          )}
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon(sop.status)}
              <h3 
                className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                onClick={() => handleSOPAction(sop.id, 'view')}
              >
                {sop.name}
              </h3>
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getStatusColor(sop.status))}>
                {sop.status}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground">{sop.description}</p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span>v{sop.version}</span>
                <span>By {sop.owner}</span>
                <span>{sop.lastModified}</span>
                <span className="px-1.5 py-0.5 bg-muted rounded text-xs">{sop.category}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span>{sop.executions} runs</span>
                {sop.executions > 0 && <span>• {sop.successRate.toFixed(1)}% success</span>}
              </div>
            </div>
            
            {sop.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {sop.tags.map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 bg-muted/50 text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Action Menu */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleSOPAction(sop.id, 'view')}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              title="View SOP"
            >
              <Eye className="h-4 w-4" />
            </button>
            
            {sop.permissions.includes('write') && (
              <button
                onClick={() => handleSOPAction(sop.id, 'edit')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Edit SOP"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={() => handleSOPAction(sop.id, 'duplicate')}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Duplicate SOP"
            >
              <Copy className="h-4 w-4" />
            </button>
            
            {(userRole === 'admin' || sop.owner === 'Current User') && (
              <button
                onClick={() => handleSOPAction(sop.id, 'toggle-status')}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title={sop.status === 'active' ? 'Pause SOP' : 'Activate SOP'}
              >
                {sop.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
            )}
            
            <div className="relative">
              <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isCustomBranded ? 'SOP Management' : 'Process Management'}
          </h2>
          <p className="text-muted-foreground">
            {isCustomBranded 
              ? 'Create, manage, and organize your Standard Operating Procedures'
              : 'Create, manage, and organize your workflow processes'
            }
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleActionClick('import-sop')}
            className="px-3 py-2 text-sm border border-input rounded hover:bg-accent transition-colors"
          >
            <Upload className="h-4 w-4 mr-1 inline" />
            Import
          </button>
          
          <button
            onClick={() => handleActionClick('create-sop')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1 inline" />
            {isCustomBranded ? 'Create SOP' : 'New Process'}
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder={isCustomBranded ? "Search SOPs..." : "Search processes..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-input rounded bg-background"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-input rounded bg-background"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className="px-3 py-2 border border-input rounded bg-background"
          >
            <option value="modified-desc">Recently Modified</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="executions-desc">Most Executions</option>
            <option value="success-desc">Highest Success Rate</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && selectedSOPs.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium text-foreground">
            {selectedSOPs.length} {isCustomBranded ? 'SOPs' : 'processes'} selected
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBulkAction('bulk-activate')}
              className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction('bulk-pause')}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200 transition-colors"
            >
              Pause
            </button>
            <button
              onClick={() => handleBulkAction('bulk-delete')}
              className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedSOPs([])}
              className="px-3 py-1 text-xs border border-input rounded hover:bg-accent transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* SOP List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredSOPs.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' 
                ? 'No matching results' 
                : isCustomBranded ? 'No SOPs found' : 'No processes found'
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : isCustomBranded 
                  ? 'Create your first SOP to get started.'
                  : 'Create your first process to get started.'
              }
            </p>
            <button
              onClick={() => handleActionClick('create-sop')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              {isCustomBranded ? 'Create First SOP' : 'Create First Process'}
            </button>
          </div>
        ) : (
          filteredSOPs.map(renderSOPCard)
        )}
      </div>

      {/* Pagination would go here in a real implementation */}
      {filteredSOPs.length > itemsPerPage && (
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min(itemsPerPage, filteredSOPs.length)} of {filteredSOPs.length} {isCustomBranded ? 'SOPs' : 'processes'}
          </p>
          
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border border-input rounded hover:bg-accent transition-colors">
              Previous
            </button>
            <span className="px-3 py-1 text-sm">1 of 1</span>
            <button className="px-3 py-1 text-sm border border-input rounded hover:bg-accent transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOPManagementPanel;