#!/usr/bin/env node

/**
 * Automated Styling Fix Script
 * Replaces hardcoded Tailwind colors with theme-aware variables
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Color replacement mappings
const colorReplacements = {
  // Text colors - Gray
  'text-gray-400': 'text-muted-foreground/70',
  'text-gray-500': 'text-muted-foreground/80',
  'text-gray-600': 'text-muted-foreground',
  'text-gray-700': 'text-foreground/90',
  'text-gray-800': 'text-foreground',
  'text-gray-900': 'text-foreground',

  // Background colors - Gray
  'bg-gray-50': 'bg-accent',
  'bg-gray-100': 'bg-muted',
  'bg-gray-200': 'bg-muted/80',
  'bg-gray-800': 'dark:bg-card',
  'bg-gray-900': 'dark:bg-background',

  // Border colors - Gray
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-input',

  // Blue colors (Primary)
  'text-blue-50': 'text-primary-foreground',
  'text-blue-600': 'text-primary',
  'text-blue-700': 'text-primary',
  'text-blue-800': 'text-primary',
  'bg-blue-50': 'bg-primary/10',
  'bg-blue-100': 'bg-primary/20',
  'bg-blue-500': 'bg-primary',
  'bg-blue-600': 'bg-primary',
  'border-blue-200': 'border-primary/20',
  'border-blue-500': 'border-primary',

  // Red colors (Destructive)
  'text-red-50': 'text-destructive-foreground',
  'text-red-600': 'text-destructive',
  'text-red-700': 'text-destructive',
  'text-red-800': 'text-destructive',
  'bg-red-50': 'bg-destructive/10',
  'bg-red-100': 'bg-destructive/20',
  'bg-red-600': 'bg-destructive',
  'border-red-200': 'border-destructive/20',

  // Green colors (Success)
  'text-green-50': 'text-success-foreground',
  'text-green-600': 'text-success',
  'text-green-700': 'text-success',
  'text-green-800': 'text-success',
  'bg-green-50': 'bg-success/10',
  'bg-green-100': 'bg-success/20',
  'bg-green-600': 'bg-success',
  'border-green-200': 'border-success/20',

  // Yellow colors (Warning)
  'text-yellow-600': 'text-warning',
  'text-yellow-700': 'text-warning',
  'text-yellow-800': 'text-warning',
  'bg-yellow-50': 'bg-warning/10',
  'bg-yellow-100': 'bg-warning/20',
  'border-yellow-200': 'border-warning/20',

  // Focus states - CRITICAL
  'focus:border-blue-500': 'focus-visible:ring-ring',
  'focus:ring-blue-500': 'focus-visible:ring-ring',
  'focus:ring-2 focus:ring-blue-500': 'focus-visible:ring-2 focus-visible:ring-ring',

  // Border radius standardization
  'rounded-md': 'rounded-lg',
};

// Files to process
const patterns = [
  'frontend/src/components/**/*.tsx',
  'frontend/src/components/**/*.jsx',
  'frontend/src/features/**/*.tsx',
  'frontend/src/features/**/*.jsx',
  'frontend/src/pages/**/*.tsx',
  'frontend/src/pages/**/*.jsx',
];

async function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Apply each replacement
  for (const [oldColor, newColor] of Object.entries(colorReplacements)) {
    const regex = new RegExp(oldColor.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
    if (regex.test(content)) {
      content = content.replace(regex, newColor);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed: ${filePath}`);
    return 1;
  }

  return 0;
}

async function main() {
  console.log('🎨 Starting styling fix...\n');

  let totalFixed = 0;

  for (const pattern of patterns) {
    const files = await glob(pattern, { cwd: process.cwd(), absolute: true });

    for (const file of files) {
      totalFixed += await fixFile(file);
    }
  }

  console.log(`\n✅ Fixed ${totalFixed} files`);
  console.log('\n⚠️  Manual review recommended for:');
  console.log('   - Complex color combinations');
  console.log('   - Context-specific styling');
  console.log('   - Custom components');
}

main().catch(console.error);
