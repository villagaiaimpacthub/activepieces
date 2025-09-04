/**
 * SOP Execution Detail Page
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { SOPBreadcrumbs } from '@/app/components/sidebar/sop-navigation-extension';
import { useTerminologyContext } from '@/lib/terminology/hooks';

export default function SOPExecutionDetail() {
  const { executionId } = useParams<{ executionId: string }>();
  
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
          {translate('Execution Details')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {translate('Execution ID')}: {executionId}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📈</div>
          <p className="text-gray-500 dark:text-gray-400">
            {translate('Execution details will be displayed here')}
          </p>
        </div>
      </div>
    </div>
  );
}