/**
 * SOP Asset Pipeline Test Component
 * 
 * Test component to verify SOP assets are loading and integrating correctly
 * Only used for development/debugging - remove in production
 */

import React from 'react';
import {
  useSopAssets,
  useSopTheme,
  useSopBranding,
  useSopAssetValidator,
  SopLogo,
  SopIcon,
  SopThemeToggle
} from './use-sop-assets';

export const SopAssetTest: React.FC = () => {
  const { assetsLoaded, loadingError, logos, icons } = useSopAssets();
  const { currentTheme, setTheme, isDark } = useSopTheme();
  const { branding, getBrandedTitle } = useSopBranding();
  const { validateAssets, generateReport, validationResult } = useSopAssetValidator();

  const handleValidateAssets = async () => {
    await validateAssets();
  };

  const handleGenerateReport = async () => {
    const report = await generateReport();
    console.log('SOP Asset Report:', report);
    alert('Asset report generated - check console');
  };

  if (loadingError) {
    return (
      <div className="sop-asset-test error">
        <h3>❌ SOP Asset Loading Error</h3>
        <p>{loadingError}</p>
      </div>
    );
  }

  if (!assetsLoaded) {
    return (
      <div className="sop-asset-test loading">
        <h3>⏳ Loading SOP Assets...</h3>
        <div className="sop-skeleton" style={{ width: 200, height: 20, marginTop: 10 }} />
      </div>
    );
  }

  return (
    <div className="sop-asset-test" style={{ padding: 20, border: '1px solid var(--sop-accent-200)', borderRadius: 8, margin: 20 }}>
      <h3 style={{ color: 'var(--sop-primary-600)' }}>🎨 SOP Asset Pipeline Test</h3>
      
      {/* Branding Test */}
      <section style={{ marginBottom: 20 }}>
        <h4>Brand Assets</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
          <SopLogo variant="main" style={{ maxHeight: 40 }} />
          <SopLogo variant="icon" style={{ maxHeight: 32 }} />
        </div>
        <p><strong>App Title:</strong> {getBrandedTitle()}</p>
        <p><strong>Company:</strong> {branding.companyName}</p>
        <p><strong>Version:</strong> {branding.version}</p>
      </section>

      {/* Theme Test */}
      <section style={{ marginBottom: 20 }}>
        <h4>Theme System</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
          <SopThemeToggle showLabel />
          <span>Current: {currentTheme}</span>
          <span>Mode: {isDark ? 'Dark' : 'Light'}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTheme('sop-light')} style={{ padding: '4px 8px' }}>
            Light
          </button>
          <button onClick={() => setTheme('sop-dark')} style={{ padding: '4px 8px' }}>
            Dark
          </button>
        </div>
      </section>

      {/* Icon Test */}
      <section style={{ marginBottom: 20 }}>
        <h4>Process Step Icons</h4>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <SopIcon iconType="processStep" size={32} />
            <div style={{ fontSize: 12, marginTop: 4 }}>Process</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <SopIcon iconType="humanTask" size={32} />
            <div style={{ fontSize: 12, marginTop: 4 }}>Human</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <SopIcon iconType="complianceCheck" size={32} />
            <div style={{ fontSize: 12, marginTop: 4 }}>Compliance</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <SopIcon iconType="integration" size={32} />
            <div style={{ fontSize: 12, marginTop: 4 }}>Integration</div>
          </div>
        </div>
      </section>

      {/* Asset URLs Test */}
      <section style={{ marginBottom: 20 }}>
        <h4>Asset URLs</h4>
        <div style={{ fontSize: 12, fontFamily: 'monospace' }}>
          <p><strong>Main Logo:</strong> {logos.main}</p>
          <p><strong>Icon:</strong> {logos.icon}</p>
          <p><strong>Process Icon:</strong> {icons.processStep}</p>
          <p><strong>Human Icon:</strong> {icons.humanTask}</p>
        </div>
      </section>

      {/* Color System Test */}
      <section style={{ marginBottom: 20 }}>
        <h4>Color System</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ 
            width: 40, height: 40, backgroundColor: 'var(--sop-primary-600)', 
            borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: 'white'
          }}>Primary</div>
          <div style={{ 
            width: 40, height: 40, backgroundColor: 'var(--sop-step-human)', 
            borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: 'white'
          }}>Human</div>
          <div style={{ 
            width: 40, height: 40, backgroundColor: 'var(--sop-step-compliance)', 
            borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: 'white'
          }}>Compliance</div>
          <div style={{ 
            width: 40, height: 40, backgroundColor: 'var(--sop-step-integration)', 
            borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: 'white'
          }}>Integration</div>
        </div>
      </section>

      {/* Validation Test */}
      <section style={{ marginBottom: 20 }}>
        <h4>Asset Validation</h4>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button onClick={handleValidateAssets} style={{ padding: '6px 12px' }}>
            Validate Assets
          </button>
          <button onClick={handleGenerateReport} style={{ padding: '6px 12px' }}>
            Generate Report
          </button>
        </div>
        {validationResult && (
          <div style={{
            padding: 10,
            borderRadius: 4,
            backgroundColor: validationResult.valid ? 'var(--sop-step-compliance)' : 'var(--sop-step-conditional)',
            color: 'white',
            fontSize: 12
          }}>
            {validationResult.valid ? '✅ All assets valid' : `❌ ${validationResult.missing.length} missing assets`}
            {validationResult.missing.length > 0 && (
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {validationResult.missing.map(asset => (
                  <li key={asset}>{asset}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <div style={{ 
        fontSize: 11, 
        color: 'var(--sop-accent-600)', 
        borderTop: '1px solid var(--sop-accent-200)', 
        paddingTop: 10,
        marginTop: 20
      }}>
        ℹ️ This test component verifies SOP asset pipeline functionality. Remove in production.
      </div>
    </div>
  );
};

// Export for development console access
if (process.env.NODE_ENV === 'development') {
  (window as any).SopAssetTest = SopAssetTest;
}