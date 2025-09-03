#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Automatic ADR Generator for Activepieces SOP Tool
 * Generates Architecture Decision Records based on git history and current context
 */

class ADRGenerator {
  constructor() {
    this.adrDir = path.join(process.cwd(), 'adr');
    this.templatePath = path.join(this.adrDir, 'adr-YYYYMMDD-nn-short-title.md');
    this.indexPath = path.join(this.adrDir, 'README.md');
  }

  /**
   * Get the next ADR number by scanning existing ADRs
   */
  getNextADRNumber() {
    const adrFiles = fs.readdirSync(this.adrDir)
      .filter(file => file.match(/^adr-\d{8}-\d{3}-/))
      .map(file => {
        const match = file.match(/adr-\d{8}-(\d{3})-/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .sort((a, b) => b - a);
    
    return adrFiles.length > 0 ? adrFiles[0] + 1 : 1;
  }

  /**
   * Format date as YYYYMMDD
   */
  formatDate(date = new Date()) {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }

  /**
   * Get recent git activity for context
   */
  getRecentGitActivity() {
    try {
      const commits = execSync('git log --oneline --since="24 hours ago"', { encoding: 'utf8' });
      const changes = execSync('git diff --name-only HEAD~5..HEAD', { encoding: 'utf8' });
      return { commits: commits.trim(), changes: changes.trim() };
    } catch (error) {
      return { commits: '', changes: '' };
    }
  }

  /**
   * Generate ADR content based on template and context
   */
  generateADRContent(options = {}) {
    const {
      title,
      status = 'Accepted',
      context,
      decision,
      alternatives = '',
      consequences,
      references = '',
      author = 'claude-code agent'
    } = options;

    const date = new Date().toISOString().slice(0, 10);
    const number = String(this.getNextADRNumber()).padStart(3, '0');
    const formattedDate = this.formatDate();

    return `# ADR-${formattedDate}-${number}: ${title}

**Status:** ${status}  
**Date:** ${date}  
**Authors:** ${author}  

## Context

${context}

## Decision

${decision}

## Alternatives Considered

${alternatives}

## Consequences

${consequences}

## References

${references}
`;
  }

  /**
   * Create ADR file
   */
  createADR(title, options = {}) {
    const number = String(this.getNextADRNumber()).padStart(3, '0');
    const formattedDate = this.formatDate();
    const filename = `adr-${formattedDate}-${number}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    const filepath = path.join(this.adrDir, filename);

    const content = this.generateADRContent({ title, ...options });
    
    fs.writeFileSync(filepath, content);
    this.updateIndex(filename, title, options.status || 'Accepted');
    
    return filepath;
  }

  /**
   * Update the ADR index in README.md
   */
  updateIndex(filename, title, status) {
    try {
      let indexContent = fs.readFileSync(this.indexPath, 'utf8');
      const date = new Date().toISOString().slice(0, 10);
      const number = filename.match(/adr-\d{8}-(\d{3})-/)[1];
      
      // Find the table and add new entry
      const tableMatch = indexContent.match(/(.*\| ADR \| Date \| Status \| Title \| Summary \|\n\|-----|------|--------|-------|---------|(?:\n\|.*)*)/s);
      
      if (tableMatch) {
        const newRow = `| [ADR-${number}](${filename}) | ${date} | ${status} | ${title} | Auto-generated ADR |`;
        const updatedTable = tableMatch[1] + '\n' + newRow;
        indexContent = indexContent.replace(tableMatch[1], updatedTable);
        
        fs.writeFileSync(this.indexPath, indexContent);
      }
    } catch (error) {
      console.warn('Could not update ADR index:', error.message);
    }
  }

  /**
   * Generate ADR for Phase completion
   */
  generatePhaseADR(phaseName, phaseResults) {
    const title = `${phaseName} Completion`;
    const context = `Phase ${phaseName} of the SPARC methodology has been completed with multiple parallel agents working on SOP customization components.`;
    
    const decision = `Completed ${phaseName} with the following deliverables:\n${phaseResults.map(result => `- ${result}`).join('\n')}`;
    
    const consequences = `- SOP customization capabilities have been enhanced\n- System is ready for the next phase of development\n- Architecture has been extended with new components`;
    
    return this.createADR(title, {
      context,
      decision,
      consequences,
      references: 'Related to SPARC methodology implementation'
    });
  }

  /**
   * Generate ADR from git changes
   */
  generateFromGitChanges() {
    const activity = this.getRecentGitActivity();
    
    if (!activity.commits) {
      console.log('No recent git activity found');
      return null;
    }

    const title = 'Recent Development Changes';
    const context = `Recent development activity detected:\n\nCommits:\n${activity.commits}\n\nFiles changed:\n${activity.changes}`;
    
    const decision = 'Documented recent architectural changes and development progress';
    const consequences = 'Improved traceability of development decisions and changes';
    
    return this.createADR(title, {
      context,
      decision,
      consequences
    });
  }
}

// CLI interface
if (require.main === module) {
  const generator = new ADRGenerator();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('ADR Generator Usage:');
    console.log('  node generate-adr.js <title> [context] [decision]');
    console.log('  node generate-adr.js --phase <phase-name>');
    console.log('  node generate-adr.js --git');
    process.exit(0);
  }

  try {
    let result;
    
    if (args[0] === '--phase' && args[1]) {
      result = generator.generatePhaseADR(args[1], ['Phase completed successfully']);
    } else if (args[0] === '--git') {
      result = generator.generateFromGitChanges();
    } else {
      const title = args[0];
      const context = args[1] || 'Context not provided';
      const decision = args[2] || 'Decision not specified';
      
      result = generator.createADR(title, { context, decision });
    }
    
    if (result) {
      console.log(`ADR created: ${result}`);
    }
  } catch (error) {
    console.error('Error generating ADR:', error.message);
    process.exit(1);
  }
}

module.exports = ADRGenerator;