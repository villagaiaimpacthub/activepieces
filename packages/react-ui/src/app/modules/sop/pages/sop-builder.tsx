/**
 * SOP Builder Page
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { SOPBreadcrumbs } from '@/app/components/sidebar/sop-navigation-extension';
import { useTerminologyContext } from '@/lib/terminology/hooks';

export default function SOPBuilder() {
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
    <div className="h-screen flex flex-col">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="mb-4">
          <SOPBreadcrumbs enableSOPTerminology={true} />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {translate('SOP Builder')}
            </h1>
            {processId && (
              <p className="text-gray-600 dark:text-gray-400">
                {translate('Editing')}: {processId}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <button className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              {translate('Save Draft')}
            </button>
            <button className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
              {translate('Publish SOP')}
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🛠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {translate('SOP Builder')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {translate('Visual SOP builder interface will be integrated here.')}
          </p>
        </div>
      </div>
    </div>
  );
}