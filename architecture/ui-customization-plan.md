# UI Customization Plan

## Overview

This document outlines the comprehensive plan for customizing the Activepieces Angular frontend to create a SOP-focused user interface. The approach focuses on overlay customization rather than rebuilding, maintaining compatibility with the core Activepieces framework.

## Customization Strategy

### 1. Overlay Approach
- **Extend, Don't Replace**: Override existing components rather than rebuilding from scratch
- **Theme Override**: Use Angular Material theming system for visual customization
- **Component Inheritance**: Extend existing components where possible
- **Service Decoration**: Wrap existing services with SOP-specific functionality

### 2. Terminology Translation System
- **Dynamic Translation**: Real-time translation of Activepieces terminology to SOP terms
- **Context Awareness**: Different translations based on UI context
- **Consistency**: Maintain consistent SOP terminology throughout the interface

## Frontend Structure Modifications

### Core Module Structure
```typescript
// New SOP-specific module structure:
src/app/modules/sop/
├── components/
│   ├── sop-layout/              // Main layout wrapper
│   ├── sop-navbar/              // Custom navigation bar
│   ├── sop-sidebar/             // SOP-specific sidebar
│   ├── sop-dashboard/           // Dashboard customization
│   ├── sop-designer/            // Main SOP design interface
│   ├── sop-pieces-palette/      // Custom pieces palette
│   ├── sop-canvas/              // Workflow canvas wrapper
│   ├── sop-export-panel/        // Export functionality UI
│   └── sop-client-selector/     // Multi-client workspace selector
├── services/
│   ├── sop-terminology.service.ts    // Text translation service
│   ├── sop-branding.service.ts       // Dynamic branding service
│   ├── sop-export.service.ts         // Export functionality service
│   ├── sop-validation.service.ts     // SOP validation service
│   └── sop-client.service.ts         // Client management service
├── models/
│   ├── sop.models.ts                 // SOP data models
│   ├── export.models.ts              // Export format models
│   └── client.models.ts              // Client workspace models
├── guards/
│   └── sop-auth.guard.ts             // SOP-specific authorization
└── pipes/
    ├── sop-terminology.pipe.ts       // Template terminology translation
    └── sop-format.pipe.ts            // SOP-specific formatting
```

## Component Customization Details

### 1. Navigation Bar Customization

#### SopNavbarComponent
```typescript
@Component({
  selector: 'sop-navbar',
  template: `
    <nav class="sop-navbar" [ngClass]="currentTheme">
      <div class="sop-navbar-brand">
        <img [src]="brandingService.logoUrl" alt="SOP Designer" class="sop-logo">
        <span class="sop-title">{{ brandingService.appTitle }}</span>
      </div>
      
      <ul class="sop-nav-items">
        <li>
          <a routerLink="/sops" 
             routerLinkActive="active"
             class="sop-nav-link">
            <mat-icon>assignment</mat-icon>
            <span>{{ 'My SOPs' | sopTranslate }}</span>
          </a>
        </li>
        <li>
          <a routerLink="/templates" 
             routerLinkActive="active"
             class="sop-nav-link">
            <mat-icon>library_books</mat-icon>
            <span>{{ 'Templates' | sopTranslate }}</span>
          </a>
        </li>
        <li>
          <a routerLink="/export" 
             routerLinkActive="active"
             class="sop-nav-link">
            <mat-icon>download</mat-icon>
            <span>{{ 'Export Center' | sopTranslate }}</span>
          </a>
        </li>
      </ul>
      
      <div class="sop-navbar-actions">
        <sop-client-selector></sop-client-selector>
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
      </div>
    </nav>
    
    <mat-menu #userMenu="matMenu">
      <button mat-menu-item (click)="logout()">
        <mat-icon>logout</mat-icon>
        <span>Sign Out</span>
      </button>
    </mat-menu>
  `,
  styleUrls: ['./sop-navbar.component.scss']
})
export class SopNavbarComponent extends NavbarComponent {
  
  constructor(
    public brandingService: SopBrandingService,
    private authService: AuthService,
    private clientService: SopClientService
  ) {
    super();
  }
  
  get currentTheme(): string {
    return this.brandingService.currentTheme;
  }
  
  logout(): void {
    this.authService.logout();
  }
}
```

#### Navigation Styling
```scss
// sop-navbar.component.scss
.sop-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  background: var(--sop-primary-color);
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  &-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .sop-logo {
      height: 32px;
      width: auto;
    }
    
    .sop-title {
      font-size: 1.2rem;
      font-weight: 600;
    }
  }
  
  &-items {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 24px;
    
    .sop-nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      border-radius: 4px;
      transition: all 0.2s;
      
      &:hover, &.active {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }
    }
  }
  
  &-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}
```

### 2. SOP Designer Canvas

#### SopDesignerComponent
```typescript
@Component({
  selector: 'sop-designer',
  template: `
    <div class="sop-designer-container">
      <div class="sop-designer-sidebar">
        <sop-pieces-palette 
          [availablePieces]="sopPieces"
          (pieceSelected)="onPieceSelected($event)">
        </sop-pieces-palette>
      </div>
      
      <div class="sop-designer-canvas">
        <div class="sop-canvas-toolbar">
          <button mat-raised-button 
                  color="primary" 
                  (click)="saveSop()"
                  [disabled]="!isDirty">
            <mat-icon>save</mat-icon>
            Save SOP
          </button>
          
          <button mat-raised-button 
                  color="accent" 
                  (click)="validateSop()"
                  [disabled]="!currentSop">
            <mat-icon>check_circle</mat-icon>
            Validate
          </button>
          
          <button mat-raised-button 
                  (click)="openExportPanel()"
                  [disabled]="!currentSop?.isValid">
            <mat-icon>download</mat-icon>
            Export
          </button>
        </div>
        
        <sop-canvas 
          [sopDefinition]="currentSop"
          [availablePieces]="sopPieces"
          (sopUpdated)="onSopUpdated($event)"
          (validationRequested)="validateSop()">
        </sop-canvas>
      </div>
      
      <div class="sop-designer-properties" *ngIf="selectedPiece">
        <sop-piece-properties 
          [piece]="selectedPiece"
          (propertiesChanged)="onPropertiesChanged($event)">
        </sop-piece-properties>
      </div>
    </div>
    
    <!-- Export Panel -->
    <sop-export-panel 
      [(visible)]="exportPanelVisible"
      [sopData]="currentSop"
      (exportCompleted)="onExportCompleted($event)">
    </sop-export-panel>
  `,
  styleUrls: ['./sop-designer.component.scss']
})
export class SopDesignerComponent extends FlowBuilderComponent {
  
  sopPieces: SopPiece[] = [];
  currentSop: SopDefinition | null = null;
  selectedPiece: SopPiece | null = null;
  exportPanelVisible = false;
  isDirty = false;
  
  constructor(
    private sopService: SopService,
    private validationService: SopValidationService,
    private exportService: SopExportService
  ) {
    super();
    this.loadSopPieces();
  }
  
  private loadSopPieces(): void {
    this.sopPieces = this.sopService.getAvailablePieces();
  }
  
  onPieceSelected(piece: SopPiece): void {
    // Add piece to canvas
    this.selectedPiece = piece;
  }
  
  onSopUpdated(sop: SopDefinition): void {
    this.currentSop = sop;
    this.isDirty = true;
  }
  
  async saveSop(): Promise<void> {
    if (this.currentSop) {
      await this.sopService.save(this.currentSop);
      this.isDirty = false;
    }
  }
  
  async validateSop(): Promise<void> {
    if (this.currentSop) {
      const validation = await this.validationService.validate(this.currentSop);
      this.currentSop.isValid = validation.isValid;
      this.currentSop.validationErrors = validation.errors;
    }
  }
  
  openExportPanel(): void {
    this.exportPanelVisible = true;
  }
  
  onExportCompleted(result: ExportResult): void {
    this.exportPanelVisible = false;
    // Handle export completion
  }
}
```

### 3. SOP Pieces Palette

#### SopPiecesPaletteComponent
```typescript
@Component({
  selector: 'sop-pieces-palette',
  template: `
    <div class="sop-pieces-palette">
      <div class="sop-palette-header">
        <h3>{{ 'Process Steps' | sopTranslate }}</h3>
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search pieces</mat-label>
          <input matInput 
                 [(ngModel)]="searchTerm" 
                 (ngModelChange)="filterPieces()"
                 placeholder="Search...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>
      
      <mat-accordion class="sop-pieces-categories">
        <mat-expansion-panel 
          *ngFor="let category of filteredCategories"
          [expanded]="category.expanded">
          
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon [color]="category.color">{{category.icon}}</mat-icon>
              <span>{{category.name | sopTranslate}}</span>
            </mat-panel-title>
            <mat-panel-description>
              {{category.pieces.length}} pieces
            </mat-panel-description>
          </mat-expansion-panel-header>
          
          <div class="sop-pieces-grid">
            <div *ngFor="let piece of category.pieces" 
                 class="sop-piece-card"
                 draggable="true"
                 (dragstart)="onDragStart($event, piece)"
                 (click)="selectPiece(piece)">
              
              <div class="sop-piece-icon">
                <img [src]="piece.logoUrl" [alt]="piece.displayName">
              </div>
              
              <div class="sop-piece-info">
                <h4>{{piece.displayName | sopTranslate}}</h4>
                <p>{{piece.description | sopTranslate}}</p>
              </div>
            </div>
          </div>
          
        </mat-expansion-panel>
      </mat-accordion>
    </div>
  `,
  styleUrls: ['./sop-pieces-palette.component.scss']
})
export class SopPiecesPaletteComponent {
  
  @Input() availablePieces: SopPiece[] = [];
  @Output() pieceSelected = new EventEmitter<SopPiece>();
  
  searchTerm = '';
  filteredCategories: PieceCategory[] = [];
  
  pieceCategories: PieceCategory[] = [
    {
      name: 'Process Steps',
      icon: 'settings',
      color: 'primary',
      expanded: true,
      pieces: []
    },
    {
      name: 'Human Tasks',
      icon: 'person',
      color: 'accent',
      expanded: false,
      pieces: []
    },
    {
      name: 'Integrations',
      icon: 'integration_instructions',
      color: 'warn',
      expanded: false,
      pieces: []
    },
    {
      name: 'Compliance',
      icon: 'verified',
      color: 'primary',
      expanded: false,
      pieces: []
    }
  ];
  
  ngOnInit(): void {
    this.organizePiecesByCategory();
    this.filterPieces();
  }
  
  private organizePiecesByCategory(): void {
    this.pieceCategories.forEach(category => {
      category.pieces = this.availablePieces.filter(piece => 
        piece.categories.includes(category.name.toLowerCase().replace(' ', '_'))
      );
    });
  }
  
  filterPieces(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = this.pieceCategories;
      return;
    }
    
    this.filteredCategories = this.pieceCategories
      .map(category => ({
        ...category,
        pieces: category.pieces.filter(piece =>
          piece.displayName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          piece.description.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      }))
      .filter(category => category.pieces.length > 0);
  }
  
  onDragStart(event: DragEvent, piece: SopPiece): void {
    event.dataTransfer?.setData('text/json', JSON.stringify(piece));
  }
  
  selectPiece(piece: SopPiece): void {
    this.pieceSelected.emit(piece);
  }
}
```

### 4. Export Panel

#### SopExportPanelComponent
```typescript
@Component({
  selector: 'sop-export-panel',
  template: `
    <mat-drawer-container class="sop-export-container">
      <mat-drawer mode="over" 
                  position="end" 
                  [(opened)]="visible"
                  class="sop-export-drawer">
        
        <div class="sop-export-header">
          <h2>Export SOP</h2>
          <button mat-icon-button (click)="close()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <div class="sop-export-content">
          
          <!-- Export Format Selection -->
          <mat-card class="export-section">
            <mat-card-header>
              <mat-card-title>Export Format</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-radio-group [(ngModel)]="selectedFormat">
                <mat-radio-button 
                  *ngFor="let format of exportFormats" 
                  [value]="format.value"
                  class="export-format-option">
                  <div class="format-details">
                    <div class="format-name">{{format.name}}</div>
                    <div class="format-description">{{format.description}}</div>
                  </div>
                </mat-radio-button>
              </mat-radio-group>
            </mat-card-content>
          </mat-card>
          
          <!-- Export Options -->
          <mat-card class="export-section">
            <mat-card-header>
              <mat-card-title>Export Options</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-checkbox [(ngModel)]="includeDocumentation">
                Include detailed documentation
              </mat-checkbox>
              <mat-checkbox [(ngModel)]="includeValidation">
                Include validation results
              </mat-checkbox>
              <mat-checkbox [(ngModel)]="includeMetadata">
                Include process metadata
              </mat-checkbox>
            </mat-card-content>
          </mat-card>
          
          <!-- Export Actions -->
          <div class="export-actions">
            <button mat-raised-button 
                    color="primary" 
                    (click)="exportSop()"
                    [disabled]="isExporting">
              <mat-icon *ngIf="!isExporting">download</mat-icon>
              <mat-spinner *ngIf="isExporting" diameter="20"></mat-spinner>
              {{ isExporting ? 'Exporting...' : 'Export SOP' }}
            </button>
          </div>
          
        </div>
      </mat-drawer>
    </mat-drawer-container>
  `,
  styleUrls: ['./sop-export-panel.component.scss']
})
export class SopExportPanelComponent {
  
  @Input() sopData: SopDefinition | null = null;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() exportCompleted = new EventEmitter<ExportResult>();
  
  selectedFormat = 'json';
  includeDocumentation = true;
  includeValidation = true;
  includeMetadata = true;
  isExporting = false;
  
  exportFormats = [
    {
      value: 'json',
      name: 'JSON Specification',
      description: 'Technical specification for automation implementation'
    },
    {
      value: 'pdf',
      name: 'PDF Document',
      description: 'Human-readable SOP documentation'
    },
    {
      value: 'yaml',
      name: 'YAML Configuration',
      description: 'Clean configuration format for developers'
    }
  ];
  
  constructor(private exportService: SopExportService) {}
  
  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
  
  async exportSop(): Promise<void> {
    if (!this.sopData) return;
    
    this.isExporting = true;
    
    try {
      const exportOptions: ExportOptions = {
        format: this.selectedFormat,
        includeDocumentation: this.includeDocumentation,
        includeValidation: this.includeValidation,
        includeMetadata: this.includeMetadata
      };
      
      const result = await this.exportService.export(this.sopData.id, exportOptions);
      this.exportCompleted.emit(result);
      
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      this.isExporting = false;
    }
  }
}
```

## Theming System

### SOP Theme Configuration
```scss
// sop-theme.scss
@use '@angular/material' as mat;

// Define SOP color palette
$sop-primary-palette: mat.define-palette(mat.$blue-palette, 600);
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

// Custom SOP variables
:root {
  --sop-primary-color: #{mat.get-color-from-palette($sop-primary-palette, 600)};
  --sop-accent-color: #{mat.get-color-from-palette($sop-accent-palette, 600)};
  --sop-warn-color: #{mat.get-color-from-palette($sop-warn-palette, 500)};
  --sop-background-color: #fafafa;
  --sop-surface-color: #ffffff;
  --sop-text-primary: rgba(0, 0, 0, 0.87);
  --sop-text-secondary: rgba(0, 0, 0, 0.6);
}

// Apply theme
@include mat.all-component-themes($sop-theme);
```

## Services Integration

### SOP Terminology Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class SopTerminologyService {
  
  private terminologyMap = new Map([
    // Navigation terms
    ['Flows', 'SOPs'],
    ['Flow', 'SOP'],
    ['flows', 'SOPs'],
    ['flow', 'SOP'],
    
    // Workflow terms
    ['Actions', 'Steps'],
    ['Action', 'Step'],
    ['actions', 'steps'],
    ['action', 'step'],
    
    // Component terms
    ['Pieces', 'Process Steps'],
    ['Piece', 'Process Step'],
    ['pieces', 'process steps'],
    ['piece', 'process step'],
    
    // Execution terms
    ['Triggers', 'Initiators'],
    ['Trigger', 'Initiator'],
    ['triggers', 'initiators'],
    ['trigger', 'initiator'],
    
    // UI terms
    ['Run', 'Execute'],
    ['Running', 'Executing'],
    ['Execution', 'Process Execution']
  ]);
  
  translate(text: string): string {
    let translatedText = text;
    
    this.terminologyMap.forEach((sopTerm, originalTerm) => {
      const regex = new RegExp(`\\b${originalTerm}\\b`, 'g');
      translatedText = translatedText.replace(regex, sopTerm);
    });
    
    return translatedText;
  }
  
  translateHtml(html: string): string {
    // More complex HTML content translation
    return this.translate(html);
  }
}
```

### SOP Terminology Pipe
```typescript
@Pipe({
  name: 'sopTranslate',
  pure: false
})
export class SopTerminologyPipe implements PipeTransform {
  
  constructor(private terminologyService: SopTerminologyService) {}
  
  transform(value: string): string {
    if (!value) return value;
    return this.terminologyService.translate(value);
  }
}
```

This UI customization plan provides a comprehensive approach to transforming the Activepieces interface into a SOP-focused tool while maintaining compatibility and leveraging the existing Angular Material framework.