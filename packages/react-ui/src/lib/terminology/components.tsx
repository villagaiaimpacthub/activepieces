/**
 * SOP Terminology React Components
 * 
 * Pre-built React components with automatic terminology translation
 */

import React, { forwardRef } from 'react';
import { 
  TerminologyTextProps,
  TerminologyButtonProps,
  TerminologyLabelProps,
  TerminologyContext
} from './types';
import { useTranslation, useTerminologyContext } from './hooks';
import { cn } from '../utils'; // Assuming utility for className merging

/**
 * Text component with automatic terminology translation
 */
export const TerminologyText = forwardRef<
  HTMLElement,
  TerminologyTextProps
>(({ 
  children, 
  context = 'general',
  className,
  as: Component = 'span',
  fallback,
  ...props
}, ref) => {
  const translatedText = useTranslation(children, context, fallback);

  return React.createElement(
    Component,
    {
      ref,
      className,
      ...props
    },
    translatedText
  );
});

TerminologyText.displayName = 'TerminologyText';

/**
 * Button component with automatic terminology translation
 */
export const TerminologyButton = forwardRef<
  HTMLButtonElement,
  TerminologyButtonProps
>(({ 
  children, 
  context = 'buttons',
  className,
  terminologyFallback,
  ...props
}, ref) => {
  const translatedText = useTranslation(children, context, terminologyFallback);

  return (
    <button
      ref={ref}
      className={className}
      {...props}
    >
      {translatedText}
    </button>
  );
});

TerminologyButton.displayName = 'TerminologyButton';

/**
 * Label component with automatic terminology translation
 */
export const TerminologyLabel = forwardRef<
  HTMLLabelElement,
  TerminologyLabelProps
>(({ 
  children, 
  context = 'forms',
  className,
  terminologyFallback,
  ...props
}, ref) => {
  const translatedText = useTranslation(children, context, terminologyFallback);

  return (
    <label
      ref={ref}
      className={className}
      {...props}
    >
      {translatedText}
    </label>
  );
});

TerminologyLabel.displayName = 'TerminologyLabel';

/**
 * Heading component with terminology translation
 */
export const TerminologyHeading = forwardRef<
  HTMLHeadingElement,
  {
    children: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    context?: TerminologyContext;
    className?: string;
    fallback?: string;
  }
>(({ 
  children, 
  level = 1,
  context = 'general',
  className,
  fallback,
  ...props
}, ref) => {
  const translatedText = useTranslation(children, context, fallback);
  const Component = `h${level}` as keyof JSX.IntrinsicElements;

  return React.createElement(
    Component,
    {
      ref,
      className,
      ...props
    },
    translatedText
  );
});

TerminologyHeading.displayName = 'TerminologyHeading';

/**
 * Status badge component with terminology translation
 */
export const TerminologyStatusBadge: React.FC<{
  status: string;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}> = ({ status, className, variant = 'default' }) => {
  const translatedStatus = useTranslation(status, 'status');

  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {translatedStatus}
    </span>
  );
};

/**
 * Page title component with terminology translation
 */
export const TerminologyPageTitle: React.FC<{
  title: string;
  subtitle?: string;
  context?: TerminologyContext;
  className?: string;
}> = ({ title, subtitle, context = 'general', className }) => {
  const translatedTitle = useTranslation(title, context);
  const translatedSubtitle = subtitle ? useTranslation(subtitle, context) : undefined;

  return (
    <div className={cn('mb-6', className)}>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {translatedTitle}
      </h1>
      {translatedSubtitle && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {translatedSubtitle}
        </p>
      )}
    </div>
  );
};

/**
 * Navigation link component with terminology translation
 */
export const TerminologyNavLink: React.FC<{
  href: string;
  children: string;
  context?: TerminologyContext;
  className?: string;
  isActive?: boolean;
}> = ({ href, children, context = 'general', className, isActive }) => {
  const translatedText = useTranslation(children, context);

  return (
    <a
      href={href}
      className={cn(
        'px-3 py-2 text-sm font-medium rounded-md transition-colors',
        isActive
          ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
        className
      )}
    >
      {translatedText}
    </a>
  );
};

/**
 * Form field component with terminology translation
 */
export const TerminologyFormField: React.FC<{
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ label, error, hint, required, children, className }) => {
  const translatedLabel = useTranslation(label, 'forms');
  const translatedError = error ? useTranslation(error, 'errors') : undefined;
  const translatedHint = hint ? useTranslation(hint, 'help') : undefined;

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {translatedLabel}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {translatedHint && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {translatedHint}
        </p>
      )}
      {translatedError && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {translatedError}
        </p>
      )}
    </div>
  );
};

/**
 * Terminology settings panel component
 */
export const TerminologySettingsPanel: React.FC<{
  className?: string;
}> = ({ className }) => {
  const {
    config,
    updateConfig,
    currentSet,
    switchSet,
    isLoading
  } = useTerminologyContext();

  const handleToggleEnabled = () => {
    updateConfig({ enabled: !config.enabled });
  };

  const handleSetChange = (setType: string) => {
    switchSet(setType as any);
  };

  return (
    <div className={cn('p-6 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700', className)}>
      <h3 className="text-lg font-semibold mb-4">Terminology Settings</h3>
      
      <div className="space-y-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Enable SOP Terminology</label>
          <button
            onClick={handleToggleEnabled}
            disabled={isLoading}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              config.enabled ? 'bg-blue-600' : 'bg-gray-200'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out',
                config.enabled ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        {/* Terminology Set Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Active Terminology Set</label>
          <select
            value={currentSet.id}
            onChange={(e) => handleSetChange(e.target.value)}
            disabled={isLoading || !config.enabled}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="default">Activepieces Default</option>
            <option value="sop">Standard Operating Procedure</option>
            <option value="custom">Custom Terminology</option>
          </select>
          <p className="text-xs text-gray-500">
            {currentSet.description}
          </p>
        </div>

        {/* Debug Mode Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Debug Mode</label>
          <button
            onClick={() => updateConfig({ debugMode: !config.debugMode })}
            disabled={isLoading}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              config.debugMode ? 'bg-blue-600' : 'bg-gray-200'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out',
                config.debugMode ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        {/* Active Contexts */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Active Contexts</label>
          <div className="text-xs text-gray-500">
            {config.enabledContexts.length} of {config.enabledContexts.length} contexts enabled
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * HOC for adding terminology translation to any text-based component
 */
export function withTerminology<P extends { children: string }>(
  Component: React.ComponentType<P>,
  defaultContext: TerminologyContext = 'general'
) {
  const WrappedComponent = forwardRef<any, P & { terminologyContext?: TerminologyContext }>((
    { terminologyContext = defaultContext, children, ...props },
    ref
  ) => {
    const translatedText = useTranslation(children, terminologyContext);
    
    return (
      <Component
        ref={ref}
        {...(props as P)}
      >
        {translatedText as P['children']}
      </Component>
    );
  });

  WrappedComponent.displayName = `withTerminology(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Terminology status indicator component
 */
export const TerminologyStatusIndicator: React.FC<{
  className?: string;
}> = ({ className }) => {
  const { config, currentSet, isReady, isLoading, error } = useTerminologyContext();

  const getStatusColor = () => {
    if (error) return 'text-red-600';
    if (isLoading) return 'text-yellow-600';
    if (!config.enabled) return 'text-gray-400';
    if (isReady) return 'text-green-600';
    return 'text-gray-400';
  };

  const getStatusText = () => {
    if (error) return 'Error';
    if (isLoading) return 'Loading';
    if (!config.enabled) return 'Disabled';
    if (isReady) return currentSet.name;
    return 'Not Ready';
  };

  return (
    <div className={cn('flex items-center space-x-2 text-xs', className)}>
      <div className={cn('w-2 h-2 rounded-full', getStatusColor().replace('text-', 'bg-'))} />
      <span className={getStatusColor()}>
        {getStatusText()}
      </span>
    </div>
  );
};