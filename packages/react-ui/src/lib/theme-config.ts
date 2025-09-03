/**
 * Comprehensive Theme Configuration System for Activepieces SOP Customization
 * 
 * This file defines the complete theme configuration including:
 * - Theme type definitions
 * - Default Activepieces theme
 * - Custom SOP theme
 * - Theme utilities and helpers
 */

// Base theme interface
export interface ThemeColors {
  // Primary brand colors
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // Accent/secondary colors
  accent: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // Process step colors
  steps: {
    primary: string;
    human: string;
    compliance: string;
    integration: string;
    conditional: string;
  };
  
  // UI component colors
  ui: {
    sidebar: {
      background: string;
      border: string;
    };
    canvas: {
      background: string;
      grid: string;
    };
    panel: {
      background: string;
      border: string;
    };
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  light: ThemeColors;
  dark: ThemeColors;
}

// Default Activepieces Theme
export const activepiecesTheme: ThemeConfig = {
  id: 'activepieces',
  name: 'Activepieces',
  description: 'Default Activepieces branding and colors',
  light: {
    primary: {
      50: '#f3f0ff',
      100: '#e6dbff',
      200: '#d1bbff',
      300: '#b894ff',
      400: '#9b6aff',
      500: '#8b3cff',
      600: '#7b2cbf',
      700: '#6b1fa3',
      800: '#5a1887',
      900: '#4a156b',
    },
    accent: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    steps: {
      primary: '#8b3cff',
      human: '#f59e0b',
      compliance: '#10b981',
      integration: '#8b5cf6',
      conditional: '#ef4444',
    },
    ui: {
      sidebar: {
        background: '#f8fafc',
        border: '#e2e8f0',
      },
      canvas: {
        background: '#ffffff',
        grid: '#f1f5f9',
      },
      panel: {
        background: '#f8fafc',
        border: '#e2e8f0',
      },
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      disabled: '#94a3b8',
      inverse: '#ffffff',
    },
  },
  dark: {
    primary: {
      50: '#4a156b',
      100: '#5a1887',
      200: '#6b1fa3',
      300: '#7b2cbf',
      400: '#8b3cff',
      500: '#9b6aff',
      600: '#b894ff',
      700: '#d1bbff',
      800: '#e6dbff',
      900: '#f3f0ff',
    },
    accent: {
      50: '#0f172a',
      100: '#1e293b',
      200: '#334155',
      300: '#475569',
      400: '#64748b',
      500: '#94a3b8',
      600: '#cbd5e1',
      700: '#e2e8f0',
      800: '#f1f5f9',
      900: '#f8fafc',
    },
    steps: {
      primary: '#9b6aff',
      human: '#fbbf24',
      compliance: '#34d399',
      integration: '#a78bfa',
      conditional: '#f87171',
    },
    ui: {
      sidebar: {
        background: '#1e293b',
        border: '#334155',
      },
      canvas: {
        background: '#0f172a',
        grid: '#1e293b',
      },
      panel: {
        background: '#1e293b',
        border: '#334155',
      },
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      disabled: '#64748b',
      inverse: '#0f172a',
    },
  },
};

// SOP Theme Configuration
export const sopTheme: ThemeConfig = {
  id: 'sop',
  name: 'SOP Professional',
  description: 'Professional SOP branding with blue primary colors',
  light: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    accent: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    steps: {
      primary: '#2563eb',
      human: '#f59e0b',
      compliance: '#10b981',
      integration: '#8b5cf6',
      conditional: '#ef4444',
    },
    ui: {
      sidebar: {
        background: '#f8fafc',
        border: '#e2e8f0',
      },
      canvas: {
        background: '#ffffff',
        grid: '#f1f5f9',
      },
      panel: {
        background: '#f8fafc',
        border: '#e2e8f0',
      },
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      disabled: '#94a3b8',
      inverse: '#ffffff',
    },
  },
  dark: {
    primary: {
      50: '#1e3a8a',
      100: '#1e40af',
      200: '#1d4ed8',
      300: '#2563eb',
      400: '#3b82f6',
      500: '#60a5fa',
      600: '#93c5fd',
      700: '#bfdbfe',
      800: '#dbeafe',
      900: '#eff6ff',
    },
    accent: {
      50: '#0f172a',
      100: '#1e293b',
      200: '#334155',
      300: '#475569',
      400: '#64748b',
      500: '#94a3b8',
      600: '#cbd5e1',
      700: '#e2e8f0',
      800: '#f1f5f9',
      900: '#f8fafc',
    },
    steps: {
      primary: '#60a5fa',
      human: '#fbbf24',
      compliance: '#34d399',
      integration: '#a78bfa',
      conditional: '#f87171',
    },
    ui: {
      sidebar: {
        background: '#1e293b',
        border: '#334155',
      },
      canvas: {
        background: '#0f172a',
        grid: '#1e293b',
      },
      panel: {
        background: '#1e293b',
        border: '#334155',
      },
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      disabled: '#64748b',
      inverse: '#0f172a',
    },
  },
};

// Available themes registry
export const availableThemes: Record<string, ThemeConfig> = {
  activepieces: activepiecesTheme,
  sop: sopTheme,
};

// Theme utility functions
export class ThemeUtils {
  /**
   * Apply theme colors to CSS custom properties
   */
  static applyThemeColors(theme: ThemeConfig, mode: 'light' | 'dark' = 'light') {
    const colors = theme[mode];
    const root = document.documentElement;

    // Apply primary colors
    Object.entries(colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--theme-primary-${key}`, value);
    });

    // Apply accent colors
    Object.entries(colors.accent).forEach(([key, value]) => {
      root.style.setProperty(`--theme-accent-${key}`, value);
    });

    // Apply step colors
    Object.entries(colors.steps).forEach(([key, value]) => {
      root.style.setProperty(`--theme-step-${key}`, value);
    });

    // Apply UI colors
    root.style.setProperty('--theme-sidebar-bg', colors.ui.sidebar.background);
    root.style.setProperty('--theme-sidebar-border', colors.ui.sidebar.border);
    root.style.setProperty('--theme-canvas-bg', colors.ui.canvas.background);
    root.style.setProperty('--theme-canvas-grid', colors.ui.canvas.grid);
    root.style.setProperty('--theme-panel-bg', colors.ui.panel.background);
    root.style.setProperty('--theme-panel-border', colors.ui.panel.border);

    // Apply text colors
    Object.entries(colors.text).forEach(([key, value]) => {
      root.style.setProperty(`--theme-text-${key}`, value);
    });

    // Apply to main CSS variables for compatibility
    root.style.setProperty('--primary', colors.primary[600]);
    root.style.setProperty('--primary-100', colors.primary[100]);
    root.style.setProperty('--primary-300', colors.primary[700]);
    root.style.setProperty('--primary-foreground', colors.text.inverse);
  }

  /**
   * Remove theme colors from CSS custom properties
   */
  static removeThemeColors() {
    const root = document.documentElement;
    
    // Remove theme-specific variables
    const themeProps = [
      '--theme-primary-50', '--theme-primary-100', '--theme-primary-200',
      '--theme-primary-300', '--theme-primary-400', '--theme-primary-500',
      '--theme-primary-600', '--theme-primary-700', '--theme-primary-800',
      '--theme-primary-900',
      '--theme-accent-50', '--theme-accent-100', '--theme-accent-200',
      '--theme-accent-300', '--theme-accent-400', '--theme-accent-500',
      '--theme-accent-600', '--theme-accent-700', '--theme-accent-800',
      '--theme-accent-900',
      '--theme-step-primary', '--theme-step-human', '--theme-step-compliance',
      '--theme-step-integration', '--theme-step-conditional',
      '--theme-sidebar-bg', '--theme-sidebar-border',
      '--theme-canvas-bg', '--theme-canvas-grid',
      '--theme-panel-bg', '--theme-panel-border',
      '--theme-text-primary', '--theme-text-secondary',
      '--theme-text-disabled', '--theme-text-inverse',
    ];

    themeProps.forEach(prop => root.style.removeProperty(prop));
  }

  /**
   * Get theme color value
   */
  static getThemeColor(
    theme: ThemeConfig,
    mode: 'light' | 'dark',
    colorPath: string
  ): string {
    const colors = theme[mode];
    const pathParts = colorPath.split('.');
    
    let value: any = colors;
    for (const part of pathParts) {
      value = value?.[part];
    }
    
    return value || '';
  }

  /**
   * Generate CSS classes for theme colors
   */
  static generateThemeClasses(theme: ThemeConfig, mode: 'light' | 'dark'): string {
    const colors = theme[mode];
    const classes: string[] = [];

    // Generate utility classes
    classes.push(`
      .theme-primary { color: ${colors.primary[600]}; }
      .theme-primary-bg { background-color: ${colors.primary[600]}; }
      .theme-accent { color: ${colors.accent[600]}; }
      .theme-accent-bg { background-color: ${colors.accent[600]}; }
      .theme-text-primary { color: ${colors.text.primary}; }
      .theme-text-secondary { color: ${colors.text.secondary}; }
      .theme-sidebar-bg { background-color: ${colors.ui.sidebar.background}; }
      .theme-canvas-bg { background-color: ${colors.ui.canvas.background}; }
    `);

    return classes.join('\n');
  }
}

// Theme mode type
export type ThemeMode = 'light' | 'dark' | 'auto';

// Theme configuration type for components
export interface ComponentThemeConfig {
  themeId: string;
  mode: ThemeMode;
  isCustomBranded: boolean;
}

// Default component theme config
export const defaultComponentThemeConfig: ComponentThemeConfig = {
  themeId: 'activepieces',
  mode: 'auto',
  isCustomBranded: false,
};

// Theme storage keys
export const THEME_STORAGE_KEYS = {
  THEME_ID: 'activepieces-theme-id',
  THEME_MODE: 'activepieces-theme-mode', 
  CUSTOM_BRANDING: 'activepieces-custom-branding',
} as const;