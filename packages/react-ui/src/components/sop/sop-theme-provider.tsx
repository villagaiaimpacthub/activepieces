import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from '../theme-provider';

type SOPThemeMode = 'light' | 'dark' | 'auto';

interface SOPThemeContextType {
  sopTheme: SOPThemeMode;
  setSopTheme: (theme: SOPThemeMode) => void;
  isSOPBranded: boolean;
  setIsSOPBranded: (branded: boolean) => void;
  toggleSOPBranding: () => void;
}

interface SOPThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: SOPThemeMode;
  enableSOPBranding?: boolean;
  storageKey?: string;
}

const SOPThemeContext = createContext<SOPThemeContextType | null>(null);

const SOP_THEME_STORAGE_KEY = 'sop-theme-mode';
const SOP_BRANDING_STORAGE_KEY = 'sop-branding-enabled';

export function SOPThemeProvider({
  children,
  defaultTheme = 'auto',
  enableSOPBranding = true,
  storageKey = SOP_THEME_STORAGE_KEY,
}: SOPThemeProviderProps) {
  const { theme: systemTheme, setTheme: setSystemTheme } = useTheme();
  
  // SOP theme state
  const [sopTheme, setSopThemeState] = useState<SOPThemeMode>(() => {
    const stored = localStorage.getItem(storageKey);
    return (stored as SOPThemeMode) || defaultTheme;
  });
  
  // SOP branding state
  const [isSOPBranded, setIsSOPBrandedState] = useState<boolean>(() => {
    const stored = localStorage.getItem(SOP_BRANDING_STORAGE_KEY);
    return stored !== null ? stored === 'true' : enableSOPBranding;
  });

  // Apply SOP theme classes to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing SOP classes
    root.classList.remove('sop-light', 'sop-dark', 'sop-branded');
    
    if (isSOPBranded) {
      // Apply SOP branding class
      root.classList.add('sop-branded');
      
      // Determine effective theme
      let effectiveTheme: 'light' | 'dark' = 'light';
      
      if (sopTheme === 'auto') {
        // Follow system theme
        effectiveTheme = systemTheme === 'dark' ? 'dark' : 'light';
      } else {
        effectiveTheme = sopTheme;
      }
      
      // Apply SOP theme class
      root.classList.add(`sop-${effectiveTheme}`);
      
      // Update system theme to match SOP theme
      if (systemTheme !== effectiveTheme) {
        setSystemTheme(effectiveTheme);
      }
      
      // Apply SOP CSS custom properties
      root.style.setProperty('--primary', 'var(--sop-primary-600)');
      root.style.setProperty('--primary-100', 'var(--sop-primary-100)');
      root.style.setProperty('--primary-300', 'var(--sop-primary-700)');
      root.style.setProperty('--primary-foreground', 'var(--sop-text-inverse)');
      
      // Apply SOP sidebar variables
      root.style.setProperty('--sidebar-background', 'var(--sop-sidebar-bg)');
      root.style.setProperty('--sidebar-border', 'var(--sop-sidebar-border)');
      root.style.setProperty('--sidebar-primary', 'var(--sop-primary-600)');
    } else {
      // Remove SOP custom properties to revert to default theme
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-100');
      root.style.removeProperty('--primary-300');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--sidebar-background');
      root.style.removeProperty('--sidebar-border');
      root.style.removeProperty('--sidebar-primary');
    }
  }, [sopTheme, isSOPBranded, systemTheme, setSystemTheme]);

  const setSopTheme = (theme: SOPThemeMode) => {
    localStorage.setItem(storageKey, theme);
    setSopThemeState(theme);
  };

  const setIsSOPBranded = (branded: boolean) => {
    localStorage.setItem(SOP_BRANDING_STORAGE_KEY, branded.toString());
    setIsSOPBrandedState(branded);
  };

  const toggleSOPBranding = () => {
    setIsSOPBranded(!isSOPBranded);
  };

  const contextValue: SOPThemeContextType = {
    sopTheme,
    setSopTheme,
    isSOPBranded,
    setIsSOPBranded,
    toggleSOPBranding,
  };

  return (
    <SOPThemeContext.Provider value={contextValue}>
      {children}
    </SOPThemeContext.Provider>
  );
}

export function useSOPTheme(): SOPThemeContextType {
  const context = useContext(SOPThemeContext);
  if (!context) {
    throw new Error('useSOPTheme must be used within a SOPThemeProvider');
  }
  return context;
}

// Hook to get current effective SOP theme
export function useEffectiveSOPTheme(): 'light' | 'dark' {
  const { sopTheme, isSOPBranded } = useSOPTheme();
  const { theme: systemTheme } = useTheme();

  if (!isSOPBranded) {
    return systemTheme === 'dark' ? 'dark' : 'light';
  }

  if (sopTheme === 'auto') {
    return systemTheme === 'dark' ? 'dark' : 'light';
  }

  return sopTheme;
}

// Hook for SOP-branded components
export function useSOPStyles() {
  const { isSOPBranded } = useSOPTheme();
  const effectiveTheme = useEffectiveSOPTheme();

  return {
    isSOPBranded,
    effectiveTheme,
    getSOPClass: (baseClass: string, sopClass?: string) => {
      if (isSOPBranded && sopClass) {
        return `${baseClass} ${sopClass}`;
      }
      return baseClass;
    },
    getSOPStyles: (baseStyles: React.CSSProperties, sopStyles?: React.CSSProperties) => {
      if (isSOPBranded && sopStyles) {
        return { ...baseStyles, ...sopStyles };
      }
      return baseStyles;
    },
  };
}