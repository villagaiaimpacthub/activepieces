/**
 * Team Collaboration Interface - Team management and collaboration tools for SOPs
 * Provides user management, permissions, communication, and collaboration features
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  MessageSquare, 
  Calendar,
  Shield,
  Settings,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Filter,
  Search,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeSystem } from '@/components/theme/theme-system-provider';

export interface CollaborationFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  permissions: string[];
}

export interface TeamCollaborationInterfaceProps {
  config?: {
    showUserManagement?: boolean;
    showCommunication?: boolean;
    showPermissions?: boolean;
    showActivity?: boolean;
    maxUsers?: number;
  };
  userRole?: 'admin' | 'manager' | 'user';
  onActionClick?: (action: string, data?: any) => void;
  className?: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'manager' | 'user';
  status: 'online' | 'offline' | 'busy';
  department: string;
  joinDate: string;
  lastActive: string;
  completedSOPs: number;
  assignedSOPs: number;
  permissions: string[];
  skills: string[];
}

interface Activity {
  id: string;
  type: 'sop_created' | 'sop_completed' | 'user_joined' | 'permission_changed' | 'comment_added';
  user: string;
  description: string;
  timestamp: string;
  sopId?: string;
  sopName?: string;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@company.com',
    avatar: '/avatars/alice.jpg',
    role: 'admin',
    status: 'online',
    department: 'Operations',
    joinDate: '2023-06-15',
    lastActive: '2024-01-15 09:30',
    completedSOPs: 45,
    assignedSOPs: 12,
    permissions: ['read', 'write', 'execute', 'admin'],
    skills: ['Process Design', 'Team Leadership', 'Quality Control']
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@company.com',
    avatar: '/avatars/bob.jpg',
    role: 'manager',
    status: 'online',
    department: 'Customer Service',
    joinDate: '2023-08-22',
    lastActive: '2024-01-15 08:45',
    completedSOPs: 32,
    assignedSOPs: 8,
    permissions: ['read', 'write', 'execute'],
    skills: ['Customer Relations', 'Training', 'Documentation']
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@company.com',
    avatar: '/avatars/carol.jpg',
    role: 'user',
    status: 'busy',
    department: 'Quality Assurance',
    joinDate: '2023-09-10',
    lastActive: '2024-01-15 07:15',
    completedSOPs: 28,
    assignedSOPs: 15,
    permissions: ['read', 'execute'],
    skills: ['Quality Testing', 'Compliance', 'Documentation']
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david@company.com',
    avatar: '/avatars/david.jpg',
    role: 'user',
    status: 'offline',
    department: 'IT Operations',
    joinDate: '2023-11-05',
    lastActive: '2024-01-14 18:30',
    completedSOPs: 19,
    assignedSOPs: 6,
    permissions: ['read', 'execute'],
    skills: ['System Administration', 'Monitoring', 'Incident Response']
  }
];

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'sop_completed',
    user: 'Bob Smith',
    description: 'completed Customer Onboarding SOP',
    timestamp: '2024-01-15 09:45',
    sopId: '1',
    sopName: 'Customer Onboarding SOP'
  },
  {
    id: '2',
    type: 'sop_created',
    user: 'Alice Johnson',
    description: 'created new Quality Assurance Checklist',
    timestamp: '2024-01-15 08:30',
    sopId: '3',
    sopName: 'Quality Assurance Checklist'
  },
  {
    id: '3',
    type: 'permission_changed',
    user: 'Admin',
    description: 'updated permissions for Carol Davis',
    timestamp: '2024-01-14 16:20'
  },
  {
    id: '4',
    type: 'comment_added',
    user: 'Carol Davis',
    description: 'added comment to Employee Training Protocol',
    timestamp: '2024-01-14 14:15',
    sopId: '2',
    sopName: 'Employee Training Protocol'
  }
];

const TeamCollaborationInterface: React.FC<TeamCollaborationInterfaceProps> = ({
  config = {},
  userRole = 'user',
  onActionClick,
  className
}) => {
  const { isCustomBranded } = useThemeSystem();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [selectedTab, setSelectedTab] = useState<'team' | 'activity' | 'communication' | 'permissions'>('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const {
    showUserManagement = userRole !== 'user',
    showCommunication = true,
    showPermissions = userRole === 'admin',
    showActivity = true,
    maxUsers = 50
  } = config;

  const handleActionClick = (action: string, data?: any) => {
    onActionClick?.(action, data);
  };

  const handleUserAction = (userId: string, action: string) => {
    switch (action) {
      case 'view-profile':
        handleActionClick('view-user-profile', { userId });
        break;
      case 'edit-permissions':
        handleActionClick('edit-user-permissions', { userId });
        break;
      case 'send-message':
        handleActionClick('send-user-message', { userId });
        break;
      case 'assign-sop':
        handleActionClick('assign-sop-to-user', { userId });
        break;
      case 'remove-user':
        if (confirm('Remove this user from the team?')) {
          setTeamMembers(prev => prev.filter(member => member.id !== userId));
          handleActionClick('remove-team-member', { userId });
        }
        break;
      default:
        handleActionClick(action, { userId });
    }
  };

  // Filter team members
  const filteredMembers = React.useMemo(() => {
    return teamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'all' || member.role === selectedRole;
      const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
      
      return matchesSearch && matchesRole && matchesDepartment;
    });
  }, [teamMembers, searchQuery, selectedRole, selectedDepartment]);

  // Get unique departments
  const departments = React.useMemo(() => {
    return ['all', ...Array.from(new Set(teamMembers.map(member => member.department)))];
  }, [teamMembers]);

  const getStatusIndicator = (status: TeamMember['status']) => {
    const colors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      busy: 'bg-orange-500'
    };
    return <div className={cn("w-2 h-2 rounded-full", colors[status])} />;
  };

  const getRoleColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'sop_created': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sop_completed': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'user_joined': return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'permission_changed': return <Shield className="h-4 w-4 text-purple-500" />;
      case 'comment_added': return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderTeamMember = (member: TeamMember) => (
    <div key={member.id} className="group p-4 bg-card border rounded-lg hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {member.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5">
              {getStatusIndicator(member.status)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-foreground">{member.name}</h3>
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getRoleColor(member.role))}>
                {member.role}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground">{member.email}</p>
            <p className="text-sm text-muted-foreground">{member.department}</p>
            
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>{member.completedSOPs} completed</span>
              <span>{member.assignedSOPs} assigned</span>
              <span>Joined {member.joinDate}</span>
            </div>
            
            {member.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {member.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="px-2 py-0.5 bg-muted/50 text-xs rounded">
                    {skill}
                  </span>
                ))}
                {member.skills.length > 3 && (
                  <span className="px-2 py-0.5 bg-muted/50 text-xs rounded">
                    +{member.skills.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Action Menu */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleUserAction(member.id, 'send-message')}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Send Message"
            >
              <Mail className="h-4 w-4" />
            </button>
            
            {showUserManagement && (
              <>
                <button
                  onClick={() => handleUserAction(member.id, 'assign-sop')}
                  className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                  title="Assign SOP"
                >
                  <Calendar className="h-4 w-4" />
                </button>
                
                {showPermissions && (
                  <button
                    onClick={() => handleUserAction(member.id, 'edit-permissions')}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Edit Permissions"
                  >
                    <Shield className="h-4 w-4" />
                  </button>
                )}
              </>
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

  const renderActivity = (activity: Activity) => (
    <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-muted/30 rounded-lg transition-colors">
      {getActivityIcon(activity.type)}
      
      <div className="flex-1 space-y-1">
        <p className="text-sm text-foreground">
          <span className="font-medium">{activity.user}</span> {activity.description}
          {activity.sopName && (
            <button
              onClick={() => handleActionClick('view-sop', { sopId: activity.sopId })}
              className="text-primary hover:text-primary/80 ml-1"
            >
              {activity.sopName}
            </button>
          )}
        </p>
        <p className="text-xs text-muted-foreground flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {activity.timestamp}
        </p>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {isCustomBranded ? 'Stakeholder Collaboration' : 'Team Collaboration'}
          </h3>
          <p className="text-muted-foreground">
            {teamMembers.length} team members • {teamMembers.filter(m => m.status === 'online').length} online
          </p>
        </div>

        {showUserManagement && (
          <button
            onClick={() => handleActionClick('invite-user')}
            className="px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm"
          >
            <UserPlus className="h-4 w-4 mr-1 inline" />
            Invite User
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-6">
          {[
            { id: 'team' as const, label: 'Team', icon: Users },
            ...(showActivity ? [{ id: 'activity' as const, label: 'Activity', icon: Bell }] : []),
            ...(showCommunication ? [{ id: 'communication' as const, label: 'Messages', icon: MessageSquare }] : []),
            ...(showPermissions ? [{ id: 'permissions' as const, label: 'Permissions', icon: Shield }] : [])
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id)}
              className={cn(
                "flex items-center space-x-2 pb-2 border-b-2 transition-colors",
                selectedTab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))
        }
      </div>

      {/* Tab Content */}
      <div>
        {selectedTab === 'team' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 w-full rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-input rounded bg-background"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </select>
                
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 border border-input rounded bg-background"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMembers.map(renderTeamMember)}
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No team members found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'activity' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-foreground">Recent Activity</h4>
              <button
                onClick={() => handleActionClick('view-all-activity')}
                className="text-sm text-primary hover:text-primary/80"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-1">
              {activities.map(renderActivity)}
            </div>
          </div>
        )}

        {selectedTab === 'communication' && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Team Communication</h3>
            <p className="text-muted-foreground mb-4">
              Integrated messaging system for team collaboration
            </p>
            <button
              onClick={() => handleActionClick('open-chat')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Open Chat
            </button>
          </div>
        )}

        {selectedTab === 'permissions' && (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Permission Management</h3>
            <p className="text-muted-foreground mb-4">
              Configure user roles and access permissions
            </p>
            <button
              onClick={() => handleActionClick('manage-permissions')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Manage Permissions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamCollaborationInterface;