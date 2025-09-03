#!/usr/bin/env python3
"""
Claude Code ADR Post-Hook
Automatically generates ADRs when significant architectural decisions are made
"""

import json
import sys
import os
import subprocess
import datetime
from pathlib import Path

class ADRHook:
    def __init__(self):
        self.project_root = Path.cwd()
        self.adr_dir = self.project_root / 'adr'
        self.adr_script = self.project_root / 'scripts' / 'generate-adr.js'
        
    def should_generate_adr(self, tool_data):
        """Determine if the tool usage warrants ADR generation"""
        
        # High-significance indicators
        high_significance_patterns = [
            'architecture', 'design', 'framework', 'system',
            'integration', 'phase', 'component', 'service',
            'implementation', 'structure', 'pattern'
        ]
        
        # Check tool name and description
        tool_name = tool_data.get('name', '').lower()
        description = tool_data.get('description', '').lower()
        
        # File modification patterns that suggest architectural changes  
        file_changes = tool_data.get('file_changes', [])
        significant_files = [
            'package.json', 'tsconfig.json', 'webpack.config.js',
            'docker-compose.yml', 'dockerfile', '.env'
        ]
        
        # Check for significant patterns
        significance_score = 0
        
        if any(pattern in tool_name for pattern in high_significance_patterns):
            significance_score += 3
            
        if any(pattern in description for pattern in high_significance_patterns):
            significance_score += 2
            
        if any(any(sig_file in change.lower() for sig_file in significant_files) 
               for change in file_changes):
            significance_score += 4
            
        # Agent-based decisions are often significant
        if 'agent' in tool_name or 'task' in tool_name:
            significance_score += 2
            
        return significance_score >= 7
    
    def extract_decision_info(self, tool_data):
        """Extract decision information from tool data"""
        
        tool_name = tool_data.get('name', 'Unknown Tool')
        description = tool_data.get('description', 'No description provided')
        output = tool_data.get('output', '')
        
        # Create title
        title = f"Architectural Decision from {tool_name}"
        
        # Create context
        context = f"""Tool: {tool_name}
Description: {description}

This decision was made automatically by a Claude Code agent during development."""
        
        # Create decision statement
        decision = f"Implemented changes using {tool_name}:\n{output[:500]}..."
        
        # Basic consequences
        consequences = """- System architecture has been modified
- Development workflow may be impacted  
- Future development should consider these changes"""
        
        return {
            'title': title,
            'context': context, 
            'decision': decision,
            'consequences': consequences
        }
    
    def generate_adr(self, decision_info):
        """Generate ADR using the decision information"""
        try:
            if not self.adr_script.exists():
                print(f"ADR script not found: {self.adr_script}")
                return False
                
            # Call the ADR generation script
            cmd = [
                'node', str(self.adr_script),
                decision_info['title'],
                decision_info['context'],
                decision_info['decision']
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=self.project_root)
            
            if result.returncode == 0:
                print(f"ADR generated successfully: {result.stdout.strip()}")
                return True
            else:
                print(f"ADR generation failed: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"Error generating ADR: {str(e)}")
            return False

def main():
    """Main hook function called by Claude Code"""
    
    # Read tool usage data from stdin
    try:
        tool_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        print("Invalid JSON data received")
        return
    
    hook = ADRHook()
    
    # Check if we should generate an ADR
    if hook.should_generate_adr(tool_data):
        print("Significant architectural decision detected, generating ADR...")
        
        decision_info = hook.extract_decision_info(tool_data)
        success = hook.generate_adr(decision_info)
        
        if success:
            print("✅ ADR generated successfully")
        else:
            print("❌ ADR generation failed")
    else:
        print("Tool usage not significant enough for ADR generation")

if __name__ == '__main__':
    main()