/**
 * SOP Template List Page
 */

import React from 'react';
import { SOPBreadcrumbs } from '@/app/components/sidebar/sop-navigation-extension';
import { useTerminologyContext } from '@/lib/terminology/hooks';

export default function SOPTemplateList() {
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
          {translate('SOP Templates')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {translate('Pre-built templates to accelerate SOP creation')}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📎</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {translate('No Templates Available')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {translate('SOP templates will be available here.')}
          </p>
        </div>
      </div>
    </div>
  );
}