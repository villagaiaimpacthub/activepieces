/**
 * SOP Loading Spinner Component
 * Provides consistent loading indicators throughout the SOP module
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, FileText, Cog, CheckCircle2 } from 'lucide-react';

export interface SopLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'progress';
  message?: string;
  submessage?: string;
  progress?: number; // 0-100 for progress variant
  className?: string;
  overlay?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'amber';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const colorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  amber: 'text-amber-600'
};

// Default spinner with rotation
const DefaultSpinner: React.FC<{ size: string; color: string }> = ({ size, color }) => (
  <Loader2 className={cn('animate-spin', size, color)} />
);

// Animated dots
const DotsSpinner: React.FC<{ color: string }> = ({ color }) => (
  <div className="flex space-x-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn(
          'h-2 w-2 rounded-full animate-pulse',
          color.replace('text-', 'bg-')
        )}
        style={{
          animationDelay: `${i * 0.2}s`,
          animationDuration: '1s'
        }}
      />
    ))}
  </div>
);

// Pulsing icon
const PulseSpinner: React.FC<{ size: string; color: string }> = ({ size, color }) => (
  <FileText className={cn('animate-pulse', size, color)} />
);

// Progress bar with percentage
const ProgressSpinner: React.FC<{ 
  progress: number; 
  color: string; 
  size: string;
}> = ({ progress, color, size }) => {
  const radius = size === sizeClasses.xl ? 20 : size === sizeClasses.lg ? 16 : 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      <svg className={cn(size)} viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-200"
        />
        <circle
          cx="25"
          cy="25"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(color, 'transition-all duration-300 ease-in-out')}
          transform="rotate(-90 25 25)"
        />
      </svg>
      {progress > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
};

export const SopLoadingSpinner: React.FC<SopLoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  message,
  submessage,
  progress = 0,
  className,
  overlay = false,
  color = 'blue'
}) => {
  const sizeClass = sizeClasses[size];
  const colorClass = colorClasses[color];

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner color={colorClass} />;
      case 'pulse':
        return <PulseSpinner size={sizeClass} color={colorClass} />;
      case 'progress':
        return <ProgressSpinner progress={progress} size={sizeClass} color={colorClass} />;
      default:
        return <DefaultSpinner size={sizeClass} color={colorClass} />;
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-3',
      className
    )}>
      {renderSpinner()}
      
      {message && (
        <div className="text-center space-y-1">
          <p className={cn(
            'font-medium',
            size === 'xl' ? 'text-base' : 
            size === 'lg' ? 'text-sm' : 'text-xs'
          )}>
            {message}
          </p>
          {submessage && (
            <p className={cn(
              'text-muted-foreground',
              size === 'xl' ? 'text-sm' : 'text-xs'
            )}>
              {submessage}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg max-w-sm mx-4">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Specialized loading states for common SOP operations
export const SopOperationLoading: React.FC<{
  operation: 'loading' | 'saving' | 'executing' | 'exporting' | 'validating';
  progress?: number;
  className?: string;
}> = ({ operation, progress, className }) => {
  const configs = {
    loading: {
      message: 'Loading SOP Data',
      submessage: 'Fetching the latest information...',
      variant: 'default' as const,
      color: 'blue' as const
    },
    saving: {
      message: 'Saving Changes',
      submessage: 'Please wait while we save your updates...',
      variant: 'pulse' as const,
      color: 'green' as const
    },
    executing: {
      message: 'Executing SOP',
      submessage: 'Running through procedure steps...',
      variant: progress !== undefined ? 'progress' as const : 'default' as const,
      color: 'purple' as const
    },
    exporting: {
      message: 'Exporting SOP',
      submessage: 'Generating export file...',
      variant: 'dots' as const,
      color: 'amber' as const
    },
    validating: {
      message: 'Validating SOP',
      submessage: 'Checking compliance and requirements...',
      variant: 'default' as const,
      color: 'blue' as const
    }
  };

  const config = configs[operation];

  return (
    <SopLoadingSpinner
      size="lg"
      variant={config.variant}
      message={config.message}
      submessage={config.submessage}
      progress={progress}
      color={config.color}
      className={className}
    />
  );
};

// Page-level loading component
export const SopPageLoading: React.FC<{
  title?: string;
  description?: string;
}> = ({ 
  title = 'Loading SOP Module', 
  description = 'Please wait while we prepare your Standard Operating Procedures...' 
}) => (
  <div className="min-h-[400px] flex items-center justify-center p-6">
    <div className="text-center space-y-6">
      <SopLoadingSpinner
        size="xl"
        variant="default"
        color="blue"
      />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      </div>
    </div>
  </div>
);

// Inline loading for small components
export const SopInlineLoading: React.FC<{
  text?: string;
  size?: 'sm' | 'md';
  className?: string;
}> = ({ text = 'Loading...', size = 'sm', className }) => (
  <div className={cn('flex items-center gap-2', className)}>
    <SopLoadingSpinner size={size} variant="default" color="blue" />
    <span className="text-sm text-muted-foreground">{text}</span>
  </div>
);

// Loading overlay for specific sections
export const SopSectionLoading: React.FC<{
  message?: string;
  className?: string;
}> = ({ 
  message = 'Loading section...', 
  className 
}) => (
  <div className={cn(
    'absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg',
    'flex items-center justify-center z-10',
    className
  )}>
    <SopLoadingSpinner
      size="md"
      variant="default"
      message={message}
      color="blue"
    />
  </div>
);