/**
 * SOP Terminology Service - Usage Examples
 * 
 * Examples demonstrating how to use the terminology service in React components
 */

import React from 'react';
import {
  useTerminology,
  useTranslation,
  TerminologyProvider,
  TerminologyText,
  TerminologyButton,
  TerminologyPageTitle,
  TerminologySettingsPanel,
  useTerminologyStats,
  useTerminologyDebug
} from './hooks';
import {
  TerminologyText as TermText,
  TerminologyButton as TermButton,
  TerminologyLabel,
  TerminologyStatusBadge
} from './components';

/**
 * Basic usage example
 */
export const BasicUsageExample: React.FC = () => {
  const { translate } = useTerminology();

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Basic Terminology Translation</h2>
      
      {/* Manual translation */}
      <p className="mb-2">
        Original: "Create a new Flow"
      </p>
      <p className="mb-4 font-semibold">
        Translated: "{translate('Create a new Flow', 'flow-builder')}"
      </p>

      {/* Using the hook */}
      <div className="mb-4">
        <TranslatedFlowStatus />
      </div>

      {/* Using components */}
      <div className="space-y-2">
        <TermText context="flow-builder">Flow Builder</TermText>
        <br />
        <TermButton context="buttons">Create Action</TermButton>
        <br />
        <TerminologyLabel context="forms">Connection Name</TerminologyLabel>
      </div>
    </div>
  );
};

/**
 * Component using the translation hook
 */
const TranslatedFlowStatus: React.FC = () => {
  const flowStatus = useTranslation('Flow is running', 'status');
  const actionCount = useTranslation('5 Actions completed', 'general');

  return (
    <div className="bg-green-100 p-3 rounded">
      <p>{flowStatus}</p>
      <p className="text-sm text-gray-600">{actionCount}</p>
    </div>
  );
};

/**
 * Flow builder interface example
 */
export const FlowBuilderExample: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <TerminologyPageTitle 
        title="Flow Builder"
        subtitle="Create and manage your automated flows"
        context="flow-builder"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <TermText as="h3" context="flow-builder" className="text-lg font-semibold mb-4">
            Available Pieces
          </TermText>
          
          <div className="space-y-2">
            <FlowBuilderItem name="Trigger" type="trigger" />
            <FlowBuilderItem name="Action" type="action" />
            <FlowBuilderItem name="Connection" type="connection" />
          </div>
        </div>

        {/* Right panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <TermText as="h3" context="flow-builder" className="text-lg font-semibold mb-4">
            Flow Configuration
          </TermText>
          
          <FlowConfiguration />
        </div>
      </div>
    </div>
  );
};

/**
 * Flow builder item component
 */
const FlowBuilderItem: React.FC<{ name: string; type: string }> = ({ name, type }) => {
  const translatedName = useTranslation(name, 'flow-builder');
  
  return (
    <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
      <span>{translatedName}</span>
      <TerminologyStatusBadge status="Available" variant="success" />
    </div>
  );
};

/**
 * Flow configuration form
 */
const FlowConfiguration: React.FC = () => {
  return (
    <div className="space-y-4">
      <div>
        <TerminologyLabel context="forms">Flow Name</TerminologyLabel>
        <input 
          type="text"
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder={useTranslation('Enter flow name', 'forms')}
        />
      </div>
      
      <div>
        <TerminologyLabel context="forms">Trigger Type</TerminologyLabel>
        <select className="w-full mt-1 px-3 py-2 border rounded-md">
          <option>{useTranslation('Select a trigger', 'forms')}</option>
          <option>{useTranslation('Schedule', 'flow-builder')}</option>
          <option>{useTranslation('Webhook', 'flow-builder')}</option>
        </select>
      </div>

      <div className="flex space-x-3 pt-4">
        <TermButton context="buttons" className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Flow
        </TermButton>
        <TermButton context="buttons" className="bg-gray-300 text-gray-700 px-4 py-2 rounded">
          Cancel
        </TermButton>
      </div>
    </div>
  );
};

/**
 * Settings panel example
 */
export const SettingsExample: React.FC = () => {
  return (
    <div className="p-6">
      <TerminologyPageTitle 
        title="Project Settings"
        subtitle="Configure your project preferences"
        context="settings"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TerminologySettingsPanel />
        
        <div className="space-y-4">
          <ConnectionSettings />
          <PieceSettings />
        </div>
      </div>
    </div>
  );
};

/**
 * Connection settings component
 */
const ConnectionSettings: React.FC = () => {
  return (
    <div className="bg-white border rounded-lg p-6">
      <TermText as="h3" context="settings" className="text-lg font-semibold mb-4">
        Connection Management
      </TermText>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span>{useTranslation('Active Connections', 'settings')}</span>
          <TerminologyStatusBadge status="3 Connected" variant="success" />
        </div>
        
        <TermButton context="buttons" className="w-full bg-blue-600 text-white py-2 rounded">
          Create New Connection
        </TermButton>
      </div>
    </div>
  );
};

/**
 * Piece settings component
 */
const PieceSettings: React.FC = () => {
  return (
    <div className="bg-white border rounded-lg p-6">
      <TermText as="h3" context="settings" className="text-lg font-semibold mb-4">
        Piece Configuration
      </TermText>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span>{useTranslation('Installed Pieces', 'settings')}</span>
          <TerminologyStatusBadge status="12 Available" variant="default" />
        </div>
        
        <TermButton context="buttons" className="w-full bg-green-600 text-white py-2 rounded">
          Install New Piece
        </TermButton>
      </div>
    </div>
  );
};

/**
 * Debug panel example
 */
export const DebugExample: React.FC = () => {
  const { stats } = useTerminologyStats();
  const { debugMode, toggleDebug, getTranslationDetails, clearCache } = useTerminologyDebug();

  return (
    <div className="p-6">
      <TerminologyPageTitle 
        title="Terminology Debug Console"
        subtitle="Monitor and debug terminology translations"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats Panel */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Translation Statistics</h3>
          <div className="space-y-2 text-sm">
            <div>Total Translations: {stats.totalTranslations}</div>
            <div>Cache Hit Ratio: {(stats.cacheHitRatio * 100).toFixed(1)}%</div>
            <div>Average Time: {stats.averageTranslationTime.toFixed(2)}ms</div>
          </div>
        </div>

        {/* Debug Controls */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Debug Controls</h3>
          <div className="space-y-3">
            <button
              onClick={toggleDebug}
              className={`px-4 py-2 rounded ${
                debugMode ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-700'
              }`}
            >
              {debugMode ? 'Disable' : 'Enable'} Debug Mode
            </button>
            
            <button
              onClick={clearCache}
              className="px-4 py-2 bg-yellow-600 text-white rounded"
            >
              Clear Cache
            </button>
          </div>
        </div>

        {/* Translation Test */}
        <div className="bg-white border rounded-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Translation Test</h3>
          <TranslationTester getTranslationDetails={getTranslationDetails} />
        </div>
      </div>
    </div>
  );
};

/**
 * Translation testing component
 */
const TranslationTester: React.FC<{ 
  getTranslationDetails: (text: string, context?: any) => any 
}> = ({ getTranslationDetails }) => {
  const [testText, setTestText] = React.useState('Create a new Flow');
  const [context, setContext] = React.useState('flow-builder');
  const [result, setResult] = React.useState<any>(null);

  const testTranslation = () => {
    const details = getTranslationDetails(testText, context);
    setResult(details);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Test Text</label>
          <input
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Context</label>
          <select
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="general">General</option>
            <option value="flow-builder">Flow Builder</option>
            <option value="dashboard">Dashboard</option>
            <option value="settings">Settings</option>
          </select>
        </div>
      </div>

      <button
        onClick={testTranslation}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Test Translation
      </button>

      {result && (
        <div className="bg-gray-100 p-4 rounded-md">
          <h4 className="font-semibold mb-2">Translation Result:</h4>
          <div className="text-sm space-y-1">
            <div><strong>Original:</strong> {result.originalText}</div>
            <div><strong>Translated:</strong> {result.translatedText}</div>
            <div><strong>Applied Mappings:</strong> {result.appliedMappings.length}</div>
            <div><strong>Duration:</strong> {result.duration.toFixed(2)}ms</div>
            <div><strong>From Cache:</strong> {result.fromCache ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Complete application example with provider
 */
export const CompleteExample: React.FC = () => {
  return (
    <TerminologyProvider initialSet="sop" initialConfig={{ debugMode: true }}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <TermText context="general" className="text-xl font-bold">
                Flow Management System
              </TermText>
              
              <div className="flex space-x-4">
                <TermButton context="buttons" className="text-blue-600 hover:text-blue-800">
                  Create Flow
                </TermButton>
                <TermButton context="buttons" className="text-gray-600 hover:text-gray-800">
                  View Connections
                </TermButton>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <BasicUsageExample />
            <div className="mt-8">
              <FlowBuilderExample />
            </div>
          </div>
        </main>
      </div>
    </TerminologyProvider>
  );
};

// Export all examples for easy testing
export const examples = {
  BasicUsageExample,
  FlowBuilderExample,
  SettingsExample,
  DebugExample,
  CompleteExample
};