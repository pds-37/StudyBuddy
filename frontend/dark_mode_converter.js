import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(SRC_DIR);
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Remove dark: prefix from tailwind classes
  // e.g., dark:bg-obsidian -> bg-obsidian, dark:text-white -> text-white
  content = content.replace(/dark:([a-zA-Z0-9\-\/\[\]\.]+)/g, '$1');

  // Replace light mode specific colors
  content = content.replace(/bg-white(?!\/|\]|\-)/g, 'bg-transparent'); // Replace bg-white but not bg-white/[0.03]
  content = content.replace(/text-slate-900/g, 'text-white');
  content = content.replace(/text-slate-700/g, 'text-slate-300');
  content = content.replace(/text-slate-600/g, 'text-slate-400');
  content = content.replace(/text-gray-900/g, 'text-white');
  content = content.replace(/bg-slate-50/g, 'bg-transparent');
  content = content.replace(/bg-slate-100/g, 'bg-transparent');
  content = content.replace(/border-slate-200/g, 'border-white/10');
  content = content.replace(/border-gray-200/g, 'border-white/10');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
  }
});

console.log(`Successfully modified ${modifiedCount} files.`);
