#!/usr/bin/env python3
"""
Claude Code ADR Completion Hook
Generates ADRs for phase completions and major milestones
"""

import json
import sys
import os
import subprocess
import datetime
from pathlib import Path

class CompletionADRHook:
    def __init__(self):
        self.project_root = Path.cwd()
        self.adr_dir = self.project_root / 'adr'
        self.adr_script = self.project_root / 'scripts' / 'generate-adr.js'
        
    def detect_completion_type(self, completion_data):
        """Detect what type of completion this is"""
        
        content = completion_data.get('content', '').lower()
        
        completion_types = {
            'phase': ['phase', 'group', 'stage', 'milestone'],
            'feature': ['feature', 'component', 'service', 'module'],
            'integration': ['integration', 'connection', 'api'],
            'deployment': ['deployment', 'build', 'release'],
            'testing': ['test', 'validation', 'verification']
        }
        
        for comp_type, patterns in completion_types.items():
            if any(pattern in content for pattern in patterns):
                return comp_type
                
        return 'general'
    
    def extract_completion_info(self, completion_data):
        """Extract completion information for ADR generation"""
        
        content = completion_data.get('content', '')
        completion_type = self.detect_completion_type(completion_data)
        
        # Create title based on completion type
        title_map = {
            'phase': 'Phase Completion',
            'feature': 'Feature Implementation Completion', 
            'integration': 'Integration Completion',
            'deployment': 'Deployment Completion',
            'testing': 'Testing Phase Completion',
            'general': 'Development Milestone Completion'
        }
        
        title = title_map.get(completion_type, 'Development Completion')
        
        # Extract key achievements from content
        lines = content.split('\n')
        achievements = [line.strip() for line in lines 
                      if ('✅' in line or 'complete' in line.lower() or 
                          'success' in line.lower() or 'implemented' in line.lower())]
        
        context = f"""Development milestone reached in the Activepieces SOP Tool project.

Type: {completion_type.title()}
Completion detected by Claude Code agent monitoring.

Key achievements identified:
{chr(10).join(f"- {achievement.replace('✅', '').strip()}" for achievement in achievements[:5])}"""

        decision = f"""Completed {completion_type} with the following outcomes:

{content[:800]}...

This represents a significant milestone in the project development."""

        consequences = f"""- {completion_type.title()} functionality is now available
- Project has progressed to the next development stage
- Architecture has been enhanced with new capabilities
- Ready for subsequent development phases"""

        return {
            'title': title,
            'context': context,
            'decision': decision, 
            'consequences': consequences,
            'completion_type': completion_type
        }
    
    def should_generate_completion_adr(self, completion_data):
        """Determine if completion warrants ADR generation"""
        
        content = completion_data.get('content', '').lower()
        
        # Significant completion indicators
        significance_indicators = [
            'phase complete', 'implementation complete', 'success',
            'deliverable', 'milestone', 'architecture', 'system',
            '100%', 'finished', 'deployed', 'integrated'
        ]
        
        return any(indicator in content for indicator in significance_indicators)
    
    def generate_completion_adr(self, completion_info):
        """Generate ADR for the completion"""
        try:
            if not self.adr_script.exists():
                print(f"ADR script not found: {self.adr_script}")
                return False
                
            # Call the ADR generation script
            cmd = [
                'node', str(self.adr_script),
                completion_info['title'],
                completion_info['context'],
                completion_info['decision']
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=self.project_root)
            
            if result.returncode == 0:
                print(f"Completion ADR generated: {result.stdout.strip()}")
                return True
            else:
                print(f"Completion ADR generation failed: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"Error generating completion ADR: {str(e)}")
            return False

def main():
    """Main completion hook function"""
    
    try:
        completion_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        print("Invalid JSON data received in completion hook")
        return
    
    hook = CompletionADRHook()
    
    if hook.should_generate_completion_adr(completion_data):
        print("Significant completion detected, generating ADR...")
        
        completion_info = hook.extract_completion_info(completion_data)
        success = hook.generate_completion_adr(completion_info)
        
        if success:
            print(f"✅ Completion ADR generated for {completion_info['completion_type']}")
        else:
            print("❌ Completion ADR generation failed")
    else:
        print("Completion not significant enough for ADR generation")

if __name__ == '__main__':
    main()