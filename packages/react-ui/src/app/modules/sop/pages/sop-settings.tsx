/**
 * SOP Settings Page
 */

import React from 'react';
import { SOPBreadcrumbs } from '@/app/components/sidebar/sop-navigation-extension';
import { useTerminologyContext } from '@/lib/terminology/hooks';

export default function SOPSettings() {
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
          {translate('SOP Configuration')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {translate('Configure SOP system settings and preferences')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {translate('General Settings')}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {translate('Default SOP Template')}
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">{translate('Select Template')}</option>
                <option value="basic">{translate('Basic SOP Template')}</option>
                <option value="approval">{translate('Approval-based SOP')}</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {translate('Notification Settings')}
          </h2>
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {translate('Email notifications for approvals')}
              </span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {translate('Slack notifications for executions')}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}