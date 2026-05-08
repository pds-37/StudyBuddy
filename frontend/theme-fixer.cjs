const fs = require('fs');
const path = require('path');

const directory = './src';

const replacements = [
  // Text colors
  { from: /"([^"]*)\btext-white\b([^"]*)"/g, to: '"$1text-slate-900 dark:text-white$2"' },
  { from: /"([^"]*)\btext-slate-400\b([^"]*)"/g, to: '"$1text-slate-500 dark:text-slate-400$2"' },
  { from: /"([^"]*)\btext-slate-300\b([^"]*)"/g, to: '"$1text-slate-700 dark:text-slate-300$2"' },
  
  // Border colors (including bracketed versions)
  { from: /"([^"]*)\bborder-white\/10\b([^"]*)"/g, to: '"$1border-slate-200 dark:border-white/10$2"' },
  { from: /"([^"]*)\bborder-white\/0\.0([0-9])\b([^"]*)"/g, to: '"$1border-slate-100 dark:border-white/0.0$2$3"' },
  { from: /"([^"]*)\bborder-white\/\[0\.0([0-9])\]\b([^"]*)"/g, to: '"$1border-slate-100 dark:border-white/[0.0$2]$3"' },
  
  // Background colors (including bracketed versions)
  { from: /"([^"]*)\bbg-white\/5\b([^"]*)"/g, to: '"$1bg-slate-50 dark:bg-white/5$2"' },
  { from: /"([^"]*)\bbg-white\/10\b([^"]*)"/g, to: '"$1bg-slate-100 dark:bg-white/10$2"' },
  { from: /"([^"]*)\bbg-white\/0\.0([0-9])\b([^"]*)"/g, to: '"$1bg-slate-50 dark:bg-white/0.0$2$3"' },
  { from: /"([^"]*)\bbg-white\/\[0\.0([0-9])\]\b([^"]*)"/g, to: '"$1bg-slate-50 dark:bg-white/[0.0$2]$3"' },
  
  // Obsidian and Panel (only if not already fixed)
  { from: /"([^"]*)\b(bg-obsidian|bg-ink)\b(?! dark:bg-obsidian)([^"]*)"/g, to: '"$1$2 bg-white dark:$2$4"' },
  { from: /"([^"]*)\bbg-panel\b(?! dark:bg-panel)([^"]*)"/g, to: '"$1bg-panel bg-slate-50 dark:bg-panel$2"' },
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      for (const r of replacements) {
        content = content.replace(r.from, r.to);
      }
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Fixed ${fullPath}`);
      }
    }
  }
}

console.log('Starting theme fix phase 2...');
walk(directory);
console.log('Theme fix completed!');
