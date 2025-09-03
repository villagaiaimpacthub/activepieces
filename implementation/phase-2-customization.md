# Phase 2: UI Customization and Branding (Week 2)

## Objective
Transform the Activepieces interface into a SOP-focused design tool through theming, component customization, and terminology translation.

## Tasks Overview

### Day 6: Core UI Framework Setup

#### 6.1 Create SOP Module Structure
```bash
# Generate SOP-specific Angular module
cd packages/ui/frontend/src/app/modules
ng generate module sop
ng generate component sop/sop-layout
ng generate component sop/sop-navbar
ng generate component sop/sop-sidebar
ng generate component sop/sop-dashboard

# Generate SOP services
ng generate service sop/services/sop-terminology
ng generate service sop/services/sop-branding
ng generate service sop/services/sop-client

# Generate SOP pipes
ng generate pipe sop/pipes/sop-terminology
```

#### 6.2 Theme System Implementation
```scss
/* Create packages/ui/frontend/src/assets/sop/themes/sop-theme.scss */
@use '@angular/material' as mat;

// SOP Color Palette
$sop-primary-palette: mat.define-palette((
  50: #e3f2fd,
  100: #bbdefb,
  200: #90caf9,
  300: #64b5f6,
  400: #42a5f5,
  500: #2196f3,  // Primary color
  600: #1e88e5,
  700: #1976d2,
  800: #1565c0,
  900: #0d47a1,
  contrast: (
    50: rgba(black, 0.87),
    100: rgba(black, 0.87),
    200: rgba(black, 0.87),
    300: rgba(black, 0.87),
    400: rgba(black, 0.87),
    500: white,
    600: white,
    700: white,
    800: white,
    900: white,
  )
));

$sop-accent-palette: mat.define-palette(mat.$gray-palette, 600);
$sop-warn-palette: mat.define-palette(mat.$red-palette, 500);

// Create SOP theme
$sop-theme: mat.define-light-theme((
  color: (
    primary: $sop-primary-palette,
    accent: $sop-accent-palette,
    warn: $sop-warn-palette,
  )
));

// Custom CSS variables for SOP
:root {
  --sop-primary: #2196f3;
  --sop-primary-dark: #1976d2;
  --sop-primary-light: #64b5f6;
  --sop-accent: #757575;
  --sop-warn: #f44336;
  --sop-success: #4caf50;
  --sop-background: #fafafa;
  --sop-surface: #ffffff;
  --sop-text-primary: rgba(0, 0, 0, 0.87);
  --sop-text-secondary: rgba(0, 0, 0, 0.6);
  --sop-border: rgba(0, 0, 0, 0.12);
}

// Apply theme
@include mat.all-component-themes($sop-theme);
```

#### 6.3 SOP Layout Component
```typescript
// sop-layout.component.ts
@Component({
  selector: 'sop-layout',
  template: `
    <div class="sop-layout" [ngClass]="currentTheme">
      <sop-navbar></sop-navbar>
      
      <div class="sop-content">
        <sop-sidebar *ngIf="showSidebar"></sop-sidebar>
        
        <main class="sop-main" [ngClass]="{'with-sidebar': showSidebar}">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styleUrls: ['./sop-layout.component.scss']
})
export class SopLayoutComponent {
  
  showSidebar = true;
  currentTheme = 'sop-theme-default';
  
  constructor(
    private brandingService: SopBrandingService,
    private clientService: SopClientService
  ) {}
  
  ngOnInit(): void {
    this.loadClientBranding();
  }
  
  private async loadClientBranding(): Promise<void> {
    const clientId = this.clientService.getCurrentClientId();
    if (clientId) {
      const branding = await this.brandingService.getClientBranding(clientId);
      this.applyBranding(branding);
    }
  }
  
  private applyBranding(branding: ClientBranding): void {
    document.documentElement.style.setProperty('--sop-primary', branding.primaryColor);
    document.documentElement.style.setProperty('--sop-accent', branding.secondaryColor);
    this.currentTheme = branding.themeName || 'sop-theme-default';
  }
}
```

### Day 7: Navigation and Branding

#### 7.1 SOP Navbar Implementation
```typescript
// sop-navbar.component.ts
@Component({
  selector: 'sop-navbar',
  template: `
    <mat-toolbar class="sop-navbar" color="primary">
      
      <!-- Brand Section -->
      <div class="sop-navbar-brand">
        <img [src]="brandingService.logoUrl" 
             [alt]="brandingService.appTitle"
             class="sop-logo"
             *ngIf="brandingService.logoUrl">
        <span class="sop-title">{{ brandingService.appTitle | sopTranslate }}</span>
      </div>
      
      <!-- Navigation Links -->
      <nav class="sop-nav-links">
        <a mat-button 
           routerLink="/sops" 
           routerLinkActive="active"
           class="sop-nav-link">
          <mat-icon>assignment</mat-icon>
          <span>{{ 'My SOPs' | sopTranslate }}</span>
        </a>
        
        <a mat-button 
           routerLink="/templates" 
           routerLinkActive="active"
           class="sop-nav-link">
          <mat-icon>library_books</mat-icon>
          <span>{{ 'Templates' | sopTranslate }}</span>
        </a>
        
        <a mat-button 
           routerLink="/export" 
           routerLinkActive="active"
           class="sop-nav-link">
          <mat-icon>download</mat-icon>
          <span>{{ 'Export Center' | sopTranslate }}</span>
        </a>
        
        <a mat-button 
           routerLink="/help" 
           routerLinkActive="active"
           class="sop-nav-link">
          <mat-icon>help</mat-icon>
          <span>{{ 'Help' | sopTranslate }}</span>
        </a>
      </nav>
      
      <!-- Right Side Actions -->
      <div class="sop-navbar-actions">
        
        <!-- Client Selector -->
        <mat-form-field appearance="outline" class="client-selector" *ngIf="hasMultipleClients">
          <mat-label>Client</mat-label>
          <mat-select [(value)]="currentClientId" (selectionChange)="onClientChanged($event)">
            <mat-option *ngFor="let client of availableClients" [value]="client.id">
              {{client.name}}
            </mat-option>
          </mat-select>
        </mat-form-field>
        
        <!-- User Menu -->
        <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-menu-trigger">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item (click)="openProfile()">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </button>
          <button mat-menu-item (click)="openSettings()">
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </mat-menu>
        
      </div>
    </mat-toolbar>
  `,
  styleUrls: ['./sop-navbar.component.scss']
})
export class SopNavbarComponent {
  
  currentClientId: string | null = null;
  availableClients: ClientInfo[] = [];
  hasMultipleClients = false;
  
  constructor(
    public brandingService: SopBrandingService,
    private clientService: SopClientService,
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadClientData();
  }
  
  private async loadClientData(): Promise<void> {
    this.availableClients = await this.clientService.getAvailableClients();
    this.currentClientId = this.clientService.getCurrentClientId();
    this.hasMultipleClients = this.availableClients.length > 1;
  }
  
  onClientChanged(event: MatSelectChange): void {
    this.clientService.switchClient(event.value);
    // Reload page to apply new client branding
    window.location.reload();
  }
  
  openProfile(): void {
    this.router.navigate(['/profile']);
  }
  
  openSettings(): void {
    this.router.navigate(['/settings']);
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
```

#### 7.2 Navbar Styling
```scss
// sop-navbar.component.scss
.sop-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  min-height: 64px;
  
  &-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .sop-logo {
      height: 32px;
      width: auto;
      max-width: 120px;
    }
    
    .sop-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: white;
    }
  }
  
  .sop-nav-links {
    display: flex;
    gap: 8px;
    
    .sop-nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.9);
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }
      
      &.active {
        background: rgba(255, 255, 255, 0.15);
        color: white;
      }
    }
  }
  
  &-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .client-selector {
      width: 150px;
      
      ::ng-deep {
        .mat-form-field-outline {
          color: rgba(255, 255, 255, 0.3);
        }
        
        .mat-form-field-label {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .mat-select-value {
          color: white;
        }
      }
    }
    
    .user-menu-trigger {
      color: white;
    }
  }
}
```

### Day 8: Terminology Translation System

#### 8.1 SOP Terminology Service
```typescript
// sop-terminology.service.ts
@Injectable({
  providedIn: 'root'
})
export class SopTerminologyService {
  
  private terminologyMap = new Map<string, string>([
    // Core workflow terms
    ['Flow', 'SOP'],
    ['Flows', 'SOPs'],
    ['flow', 'SOP'],
    ['flows', 'SOPs'],
    
    // Action/step terms
    ['Action', 'Step'],
    ['Actions', 'Steps'],
    ['action', 'step'],
    ['actions', 'steps'],
    
    // Piece terms
    ['Piece', 'Process Step'],
    ['Pieces', 'Process Steps'],
    ['piece', 'process step'],
    ['pieces', 'process steps'],
    
    // Trigger terms
    ['Trigger', 'Initiator'],
    ['Triggers', 'Initiators'],
    ['trigger', 'initiator'],
    ['triggers', 'initiators'],
    
    // Execution terms
    ['Run', 'Execute'],
    ['Running', 'Executing'],
    ['Executed', 'Completed'],
    ['Execution', 'Process Execution'],
    
    // UI terms
    ['Flow Builder', 'SOP Designer'],
    ['Piece Library', 'Process Library'],
    ['Flow History', 'SOP History'],
    
    // Status terms
    ['Flow Status', 'SOP Status'],
    ['Flow Runs', 'SOP Executions'],
    
    // Configuration terms
    ['Flow Configuration', 'SOP Configuration'],
    ['Piece Settings', 'Step Settings']
  ]);
  
  private contextSpecificTerms = new Map<string, Map<string, string>>([
    ['navigation', new Map([
      ['Dashboard', 'SOP Dashboard'],
      ['Projects', 'Client Workspaces'],
      ['Settings', 'SOP Settings']
    ])],
    ['buttons', new Map([
      ['Create Flow', 'Create SOP'],
      ['Import Flow', 'Import SOP'],
      ['Export Flow', 'Export SOP']
    ])]
  ]);
  
  translate(text: string, context?: string): string {
    if (!text) return text;
    
    let translatedText = text;
    
    // Apply context-specific translations first
    if (context && this.contextSpecificTerms.has(context)) {
      const contextMap = this.contextSpecificTerms.get(context)!;
      contextMap.forEach((replacement, original) => {
        const regex = new RegExp(`\\b${this.escapeRegex(original)}\\b`, 'gi');
        translatedText = translatedText.replace(regex, replacement);
      });
    }
    
    // Apply general terminology translations
    this.terminologyMap.forEach((replacement, original) => {
      const regex = new RegExp(`\\b${this.escapeRegex(original)}\\b`, 'g');
      translatedText = translatedText.replace(regex, replacement);
    });
    
    return translatedText;
  }
  
  translateObject<T>(obj: T, context?: string): T {
    if (typeof obj === 'string') {
      return this.translate(obj, context) as T;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.translateObject(item, context)) as T;
    }
    
    if (obj && typeof obj === 'object') {
      const translated: any = {};
      Object.keys(obj).forEach(key => {
        translated[key] = this.translateObject((obj as any)[key], context);
      });
      return translated;
    }
    
    return obj;
  }
  
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  // Method to add custom terminology mappings
  addCustomTerminology(original: string, replacement: string): void {
    this.terminologyMap.set(original, replacement);
  }
  
  // Method to remove terminology mappings
  removeTerminology(original: string): void {
    this.terminologyMap.delete(original);
  }
}
```

#### 8.2 SOP Terminology Pipe
```typescript
// sop-terminology.pipe.ts
@Pipe({
  name: 'sopTranslate',
  pure: false
})
export class SopTerminologyPipe implements PipeTransform {
  
  constructor(private terminologyService: SopTerminologyService) {}
  
  transform(value: string, context?: string): string {
    if (!value) return value;
    return this.terminologyService.translate(value, context);
  }
}
```

#### 8.3 SOP Terminology Directive
```typescript
// sop-terminology.directive.ts
@Directive({
  selector: '[sopTranslate]'
})
export class SopTerminologyDirective implements OnInit, OnDestroy {
  
  @Input('sopTranslate') context?: string;
  
  private originalContent: string = '';
  private mutationObserver?: MutationObserver;
  
  constructor(
    private elementRef: ElementRef,
    private terminologyService: SopTerminologyService
  ) {}
  
  ngOnInit(): void {
    this.originalContent = this.elementRef.nativeElement.textContent;
    this.translateContent();
    this.observeChanges();
  }
  
  ngOnDestroy(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }
  
  private translateContent(): void {
    const element = this.elementRef.nativeElement;
    const translatedContent = this.terminologyService.translate(
      this.originalContent, 
      this.context
    );
    
    if (element.textContent !== translatedContent) {
      element.textContent = translatedContent;
    }
  }
  
  private observeChanges(): void {
    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const newContent = this.elementRef.nativeElement.textContent;
          if (newContent !== this.originalContent) {
            this.originalContent = newContent;
            this.translateContent();
          }
        }
      });
    });
    
    this.mutationObserver.observe(this.elementRef.nativeElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }
}
```

### Day 9: Branding Service Implementation

#### 9.1 SOP Branding Service
```typescript
// sop-branding.service.ts
@Injectable({
  providedIn: 'root'
})
export class SopBrandingService {
  
  private defaultBranding: ClientBranding = {
    appTitle: 'SOP Designer',
    logoUrl: '/assets/sop/logos/default-logo.svg',
    primaryColor: '#2196f3',
    secondaryColor: '#757575',
    themeName: 'sop-theme-default',
    companyName: 'SOP Designer'
  };
  
  private currentBranding: ClientBranding = { ...this.defaultBranding };
  
  constructor(
    private http: HttpClient,
    private clientService: SopClientService
  ) {}
  
  get appTitle(): string {
    return this.currentBranding.appTitle;
  }
  
  get logoUrl(): string {
    return this.currentBranding.logoUrl;
  }
  
  get primaryColor(): string {
    return this.currentBranding.primaryColor;
  }
  
  get secondaryColor(): string {
    return this.currentBranding.secondaryColor;
  }
  
  get themeName(): string {
    return this.currentBranding.themeName;
  }
  
  async loadClientBranding(clientId: string): Promise<void> {
    try {
      const branding = await this.getClientBranding(clientId);
      this.applyBranding(branding);
    } catch (error) {
      console.warn('Failed to load client branding, using default:', error);
      this.applyBranding(this.defaultBranding);
    }
  }
  
  async getClientBranding(clientId: string): Promise<ClientBranding> {
    // In real implementation, this would fetch from backend API
    const response = await this.http.get<ClientBranding>(
      `/api/clients/${clientId}/branding`
    ).toPromise();
    
    return response || this.defaultBranding;
  }
  
  private applyBranding(branding: ClientBranding): void {
    this.currentBranding = { ...this.defaultBranding, ...branding };
    
    // Apply CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--sop-primary', branding.primaryColor);
    root.style.setProperty('--sop-accent', branding.secondaryColor);
    
    // Update page title
    document.title = branding.appTitle;
    
    // Update favicon if provided
    if (branding.faviconUrl) {
      this.updateFavicon(branding.faviconUrl);
    }
  }
  
  private updateFavicon(faviconUrl: string): void {
    const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") ||
                                  document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = faviconUrl;
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  
  // Method to update branding dynamically
  updateBranding(branding: Partial<ClientBranding>): void {
    const updatedBranding = { ...this.currentBranding, ...branding };
    this.applyBranding(updatedBranding);
  }
  
  // Method to reset to default branding
  resetToDefault(): void {
    this.applyBranding(this.defaultBranding);
  }
}

interface ClientBranding {
  appTitle: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  themeName: string;
  companyName: string;
  faviconUrl?: string;
}
```

### Day 10: Dashboard Customization

#### 10.1 SOP Dashboard Component
```typescript
// sop-dashboard.component.ts
@Component({
  selector: 'sop-dashboard',
  template: `
    <div class="sop-dashboard">
      
      <!-- Dashboard Header -->
      <div class="sop-dashboard-header">
        <div class="header-content">
          <h1>{{ 'SOP Dashboard' | sopTranslate }}</h1>
          <p class="header-subtitle">
            {{ 'Design, manage, and export your standard operating procedures' | sopTranslate }}
          </p>
        </div>
        
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="createNewSop()">
            <mat-icon>add</mat-icon>
            {{ 'Create New SOP' | sopTranslate }}
          </button>
          
          <button mat-stroked-button (click)="importSop()">
            <mat-icon>upload</mat-icon>
            {{ 'Import SOP' | sopTranslate }}
          </button>
        </div>
      </div>
      
      <!-- Quick Stats -->
      <div class="dashboard-stats">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>assignment</mat-icon>
              </div>
              <div class="stat-details">
                <div class="stat-number">{{ sopStats.totalSops }}</div>
                <div class="stat-label">{{ 'Total SOPs' | sopTranslate }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>schedule</mat-icon>
              </div>
              <div class="stat-details">
                <div class="stat-number">{{ sopStats.inProgress }}</div>
                <div class="stat-label">{{ 'In Progress' | sopTranslate }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>check_circle</mat-icon>
              </div>
              <div class="stat-details">
                <div class="stat-number">{{ sopStats.completed }}</div>
                <div class="stat-label">{{ 'Completed' | sopTranslate }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>download</mat-icon>
              </div>
              <div class="stat-details">
                <div class="stat-number">{{ sopStats.exported }}</div>
                <div class="stat-label">{{ 'Exported' | sopTranslate }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <!-- Recent SOPs -->
      <div class="dashboard-section">
        <mat-card class="section-card">
          <mat-card-header>
            <mat-card-title>{{ 'Recent SOPs' | sopTranslate }}</mat-card-title>
            <mat-card-subtitle>{{ 'Your recently modified SOPs' | sopTranslate }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <mat-table [dataSource]="recentSops" class="sop-table">
              
              <ng-container matColumnDef="name">
                <mat-header-cell *matHeaderCellDef>{{ 'SOP Name' | sopTranslate }}</mat-header-cell>
                <mat-cell *matCellDef="let sop">
                  <div class="sop-name-cell">
                    <mat-icon class="sop-icon">assignment</mat-icon>
                    <div>
                      <div class="sop-title">{{ sop.name }}</div>
                      <div class="sop-description">{{ sop.description }}</div>
                    </div>
                  </div>
                </mat-cell>
              </ng-container>
              
              <ng-container matColumnDef="status">
                <mat-header-cell *matHeaderCellDef>{{ 'Status' | sopTranslate }}</mat-header-cell>
                <mat-cell *matCellDef="let sop">
                  <mat-chip-list>
                    <mat-chip [color]="getStatusColor(sop.status)" selected>
                      {{ sop.status | sopTranslate }}
                    </mat-chip>
                  </mat-chip-list>
                </mat-cell>
              </ng-container>
              
              <ng-container matColumnDef="modified">
                <mat-header-cell *matHeaderCellDef>{{ 'Last Modified' | sopTranslate }}</mat-header-cell>
                <mat-cell *matCellDef="let sop">{{ sop.updatedAt | date:'short' }}</mat-cell>
              </ng-container>
              
              <ng-container matColumnDef="actions">
                <mat-header-cell *matHeaderCellDef>{{ 'Actions' | sopTranslate }}</mat-header-cell>
                <mat-cell *matCellDef="let sop">
                  <button mat-icon-button (click)="editSop(sop)" matTooltip="Edit SOP">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button (click)="exportSop(sop)" matTooltip="Export SOP">
                    <mat-icon>download</mat-icon>
                  </button>
                </mat-cell>
              </ng-container>
              
              <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
              <mat-row *matRowDef="let row; columns: displayedColumns;" 
                       class="sop-row"
                       (click)="viewSop(row)">
              </mat-row>
              
            </mat-table>
          </mat-card-content>
          
          <mat-card-actions>
            <a mat-button routerLink="/sops">{{ 'View All SOPs' | sopTranslate }}</a>
          </mat-card-actions>
        </mat-card>
      </div>
      
    </div>
  `,
  styleUrls: ['./sop-dashboard.component.scss']
})
export class SopDashboardComponent implements OnInit {
  
  sopStats = {
    totalSops: 0,
    inProgress: 0,
    completed: 0,
    exported: 0
  };
  
  recentSops: SopSummary[] = [];
  displayedColumns: string[] = ['name', 'status', 'modified', 'actions'];
  
  constructor(
    private sopService: SopService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadDashboardData();
  }
  
  private async loadDashboardData(): Promise<void> {
    try {
      this.sopStats = await this.sopService.getStats();
      this.recentSops = await this.sopService.getRecentSops(10);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }
  
  createNewSop(): void {
    this.router.navigate(['/sop-designer/new']);
  }
  
  importSop(): void {
    // Open import dialog
  }
  
  editSop(sop: SopSummary): void {
    this.router.navigate(['/sop-designer', sop.id]);
  }
  
  viewSop(sop: SopSummary): void {
    this.router.navigate(['/sops', sop.id]);
  }
  
  exportSop(sop: SopSummary): void {
    // Open export dialog
  }
  
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'primary';
      case 'in_progress': return 'accent';
      case 'draft': return 'warn';
      default: return 'basic';
    }
  }
}
```

## Integration Tasks

### Integration with Original Components
```typescript
// Override original navigation service
@Injectable({
  providedIn: 'root'
})
export class SopNavigationService extends NavigationService {
  
  constructor(
    private terminologyService: SopTerminologyService,
    private brandingService: SopBrandingService
  ) {
    super();
  }
  
  getNavigationItems(): NavigationItem[] {
    const originalItems = super.getNavigationItems();
    
    // Translate and customize navigation items
    return originalItems.map(item => ({
      ...item,
      label: this.terminologyService.translate(item.label, 'navigation'),
      children: item.children?.map(child => ({
        ...child,
        label: this.terminologyService.translate(child.label, 'navigation')
      }))
    }));
  }
}
```

## Testing and Validation

### End of Phase 2 Checklist
- [ ] SOP theme applied throughout the application
- [ ] Navigation shows SOP-specific terminology
- [ ] Branding system works with multiple clients
- [ ] Terminology translation working in all UI components
- [ ] Dashboard shows SOP-focused interface
- [ ] All Angular Material components styled appropriately
- [ ] Client-specific branding loads correctly
- [ ] No references to "Flows" or "Pieces" in the UI

## Deliverables

1. **Complete SOP Module** - All Angular components and services
2. **Theming System** - Material Design theme with SOP branding
3. **Terminology Translation** - Service and pipe for consistent language
4. **Navigation Customization** - SOP-focused navigation structure
5. **Dashboard Interface** - Client-friendly SOP management interface
6. **Branding Service** - Dynamic client branding support

Phase 2 transforms the generic workflow builder into a professional SOP design tool with client-specific branding and terminology.