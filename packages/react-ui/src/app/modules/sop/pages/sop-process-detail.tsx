/**
 * SOP Process Detail Page
 * Display detailed information about a specific SOP
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { SOPBreadcrumbs } from '@/app/components/sidebar/sop-navigation-extension';
import { useTerminologyContext } from '@/lib/terminology/hooks';

export default function SOPProcessDetail() {
  const { processId } = useParams<{ processId: string }>();
  
  // Get terminology if available
  let translate = (text: string) => text;
  try {
    const terminologyContext = useTerminologyContext();
    translate = terminologyContext.translate;
  } catch {
    // Terminology not available, use fallback
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <SOPBreadcrumbs enableSOPTerminology={true} />
      </div>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {translate('SOP Details')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {translate('Process ID')}: {processId}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {translate('SOP Overview')}
            </h2>
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📄</div>
              <p className="text-gray-500 dark:text-gray-400">
                {translate('SOP details will be displayed here')}
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {translate('Quick Actions')}
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                {translate('Execute Process')}
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                {translate('View Executions')}
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                {translate('Edit SOP')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}