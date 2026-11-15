const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', '.next', '.git'].includes(file)) {
                processDirectory(fullPath);
            }
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    // Restore text-white on primary buttons and badges that have dark backgrounds
    // bg-[#8A151B] or bg-slate-900 or bg-[#701015]
    // These had "text-slate-900" inserted by the global replace.
    
    newContent = newContent.replace(/bg-\[#8A151B\]([^>]*?)text-slate-900/g, 'bg-[#8A151B]$1text-white');
    newContent = newContent.replace(/bg-\[#701015\]([^>]*?)text-slate-900/g, 'bg-[#701015]$1text-white');
    newContent = newContent.replace(/bg-slate-900([^>]*?)text-slate-900/g, 'bg-slate-900$1text-white');
    newContent = newContent.replace(/group-hover:bg-\[#8A151B\]([^>]*?)group-hover:text-slate-900/g, 'group-hover:bg-[#8A151B]$1group-hover:text-white');
    newContent = newContent.replace(/group-hover:text-slate-900([^>]*?)group-hover:bg-\[#8A151B\]/g, 'group-hover:text-white$1group-hover:bg-[#8A151B]');

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Fixed buttons in ' + filePath);
    }
}

processDirectory('app');
processDirectory('components');
