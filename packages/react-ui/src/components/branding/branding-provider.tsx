/**
 * Branding Provider Component
 * 
 * This provider component integrates the branding service with React:
 * - Initializes branding system
 * - Provides branding context to child components
 * - Manages branding lifecycle and error handling
 * - Integrates with theme system provider
 * 
 * Phase 2 GROUP E - Agent 2 of 2
 * Wraps application with branding capabilities
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { brandingService, BrandConfiguration } from '@/lib/branding/branding-service';

interface BrandingContextType {
  activeBrand: BrandConfiguration;
  availableBrands: BrandConfiguration[];
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Brand management
  switchBrand: (brandId: string) => Promise<boolean>;
  refreshBrands: () => void;
  
  // Quick access helpers
  brandId: string;
  brandName: string;
  brandDisplayName: string;
  appTitle: string;
  appDescription: string;
}

const BrandingContext = createContext<BrandingContextType | null>(null);

interface BrandingProviderProps {
  children: ReactNode;
  autoInitialize?: boolean;
  fallbackBrand?: string;
  onBrandChange?: (brand: BrandConfiguration) => void;
  onError?: (error: string) => void;
}

/**
 * Branding Provider Component
 * Initializes and provides branding context to the application
 */
export function BrandingProvider({
  children,
  autoInitialize = true,
  fallbackBrand = 'activepieces',
  onBrandChange,
  onError,
}: BrandingProviderProps) {
  const [state, setState] = useState({
    activeBrand: brandingService.getActiveBrand(),
    availableBrands: brandingService.getAvailableBrands(),
    isInitialized: false,
    isLoading: autoInitialize,
    error: null as string | null,
  });

  /**
   * Switch brand with error handling
   */
  const switchBrand = async (brandId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const success = await brandingService.switchBrand(brandId);
      
      if (success) {
        const newBrand = brandingService.getActiveBrand();
        setState(prev => ({
          ...prev,
          activeBrand: newBrand,
          isLoading: false,
        }));
        
        onBrandChange?.(newBrand);
        return true;
      } else {
        const error = `Failed to switch to brand "${brandId}"`;
        setState(prev => ({ ...prev, isLoading: false, error }));
        onError?.(error);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      onError?.(errorMessage);
      return false;
    }
  };

  /**
   * Refresh available brands
   */
  const refreshBrands = () => {
    setState(prev => ({
      ...prev,
      availableBrands: brandingService.getAvailableBrands(),
    }));
  };

  /**
   * Initialize branding system
   */
  useEffect(() => {
    if (!autoInitialize) return;

    let isMounted = true;

    const initializeBranding = async () => {
      try {
        await brandingService.initialize();
        
        if (isMounted) {
          const activeBrand = brandingService.getActiveBrand();
          setState({
            activeBrand,
            availableBrands: brandingService.getAvailableBrands(),
            isInitialized: true,
            isLoading: false,
            error: null,
          });
          
          onBrandChange?.(activeBrand);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize branding';
        
        if (isMounted) {
          // Try to fallback to default brand
          try {
            await brandingService.switchBrand(fallbackBrand);
            const fallbackBrandConfig = brandingService.getActiveBrand();
            
            setState({
              activeBrand: fallbackBrandConfig,
              availableBrands: brandingService.getAvailableBrands(),
              isInitialized: true,
              isLoading: false,
              error: `Initialized with fallback brand: ${errorMessage}`,
            });
            
            onBrandChange?.(fallbackBrandConfig);
          } catch (fallbackError) {
            setState(prev => ({
              ...prev,
              isInitialized: false,
              isLoading: false,
              error: `Failed to initialize branding and fallback: ${errorMessage}`,
            }));
          }
        }
        
        onError?.(errorMessage);
      }
    };

    initializeBranding();

    return () => {
      isMounted = false;
    };
  }, [autoInitialize, fallbackBrand, onBrandChange, onError]);

  /**
   * Subscribe to branding changes
   */
  useEffect(() => {
    const unsubscribe = brandingService.subscribe((brand) => {
      setState(prev => ({
        ...prev,
        activeBrand: brand,
        availableBrands: brandingService.getAvailableBrands(),
      }));
      
      onBrandChange?.(brand);
    });

    return unsubscribe;
  }, [onBrandChange]);

  /**
   * Update document head with brand information
   */
  useEffect(() => {
    if (!state.isInitialized) return;

    const { activeBrand } = state;
    
    // Update page title if different
    if (document.title !== activeBrand.appTitle) {
      document.title = activeBrand.appTitle;
    }

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', activeBrand.appDescription);

    // Update brand data attribute
    document.documentElement.setAttribute('data-brand', activeBrand.id);
    document.documentElement.setAttribute('data-brand-name', activeBrand.displayName);

  }, [state.activeBrand, state.isInitialized]);

  // Create context value with quick access helpers
  const contextValue: BrandingContextType = {
    ...state,
    switchBrand,
    refreshBrands,
    
    // Quick access helpers
    brandId: state.activeBrand.id,
    brandName: state.activeBrand.name,
    brandDisplayName: state.activeBrand.displayName,
    appTitle: state.activeBrand.appTitle,
    appDescription: state.activeBrand.appDescription,
  };

  return (
    <BrandingContext.Provider value={contextValue}>
      {children}
    </BrandingContext.Provider>
  );
}

/**
 * Hook to access branding context
 */
export function useBrandingContext(): BrandingContextType {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBrandingContext must be used within a BrandingProvider');
  }
  return context;
}

/**
 * HOC for components that need branding context
 */
export function withBranding<P extends object>(Component: React.ComponentType<P>) {
  const WrappedComponent = (props: P) => {
    const branding = useBrandingContext();
    return <Component {...props} branding={branding} />;
  };
  
  WrappedComponent.displayName = `withBranding(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Brand-aware component wrapper that only renders when branding is initialized
 */
interface BrandAwareProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: (error: string) => ReactNode;
}

export function BrandAware({ children, fallback, errorFallback }: BrandAwareProps) {
  const { isInitialized, isLoading, error } = useBrandingContext();

  if (error && errorFallback) {
    return <>{errorFallback(error)}</>;
  }

  if (!isInitialized || isLoading) {
    return <>{fallback || <div>Loading branding...</div>}</>;
  }

  return <>{children}</>;
}

/**
 * Conditional brand renderer - only renders children for specific brand(s)
 */
interface BrandConditionalProps {
  brandId?: string | string[];
  not?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function BrandConditional({ 
  brandId, 
  not = false, 
  children, 
  fallback 
}: BrandConditionalProps) {
  const { activeBrand } = useBrandingContext();
  
  let shouldRender: boolean;
  
  if (Array.isArray(brandId)) {
    shouldRender = brandId.includes(activeBrand.id);
  } else if (brandId) {
    shouldRender = activeBrand.id === brandId;
  } else {
    shouldRender = true; // No condition, always render
  }
  
  if (not) {
    shouldRender = !shouldRender;
  }
  
  return <>{shouldRender ? children : (fallback || null)}</>;
}

/**
 * Brand logo component with automatic asset loading
 */
interface BrandLogoProps {
  variant?: 'main' | 'icon' | 'iconSmall';
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function BrandLogo({ 
  variant = 'main', 
  className, 
  style, 
  alt, 
  onLoad, 
  onError 
}: BrandLogoProps) {
  const { activeBrand } = useBrandingContext();
  const logoUrl = activeBrand.assets.logo[variant];
  const logoAlt = alt || `${activeBrand.displayName} ${variant === 'main' ? 'logo' : 'icon'}`;

  return (
    <img
      src={logoUrl}
      alt={logoAlt}
      className={className}
      style={style}
      onLoad={onLoad}
      onError={onError}
      data-brand={activeBrand.id}
      data-logo-variant={variant}
    />
  );
}

/**
 * Brand title component with automatic brand name
 */
interface BrandTitleProps {
  variant?: 'app' | 'display' | 'company';
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

export function BrandTitle({ 
  variant = 'app', 
  className, 
  style, 
  children 
}: BrandTitleProps) {
  const { activeBrand } = useBrandingContext();
  
  const title = children || (
    variant === 'app' ? activeBrand.appTitle :
    variant === 'display' ? activeBrand.displayName :
    variant === 'company' ? activeBrand.companyName :
    activeBrand.appTitle
  );

  return (
    <span
      className={className}
      style={style}
      data-brand={activeBrand.id}
      data-title-variant={variant}
    >
      {title}
    </span>
  );
}

// Export types for component usage
export type {
  BrandingContextType,
  BrandingProviderProps,
  BrandAwareProps,
  BrandConditionalProps,
  BrandLogoProps,
  BrandTitleProps,
};