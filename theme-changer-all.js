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
    
    const replacements = {
        'bg-[#050810]': 'bg-[#FAFAFA]',
        'bg-[#060A14]': 'bg-[#FFFFFF]',
        'bg-[#0a0f1c]': 'bg-[#FFFFFF]',
        'bg-[#0A101D]': 'bg-[#F3F4F6]',
        'bg-[#0B1221]': 'bg-white shadow-sm',
        'bg-[#0D1627]': 'bg-gray-50',
        'text-white': 'text-slate-900',
        'text-slate-300': 'text-slate-700',
        'text-slate-200': 'text-slate-800',
        'text-slate-400': 'text-slate-500',
        'text-slate-500': 'text-slate-500',
        'border-slate-800': 'border-slate-200',
        'border-slate-700': 'border-slate-300',
        'hover:bg-white/5': 'hover:bg-slate-100',
        'bg-slate-900/50': 'bg-slate-50',
        'bg-blue-600': 'bg-[#8A151B]',
        'bg-blue-700': 'bg-[#701015]',
        'text-blue-400': 'text-[#8A151B]',
        'border-blue-500/20': 'border-[#8A151B]/20',
        'shadow-blue-500/5': 'shadow-[#8A151B]/5',
        'bg-blue-600/15': 'bg-[#8A151B]/10',
        'text-blue-500': 'text-[#8A151B]',
        'from-blue-500 to-indigo-600': 'from-[#8A151B] to-[#B01A22]',
        'shadow-blue-500/20': 'shadow-[#8A151B]/20',
        'bg-blue-900/10': 'bg-[#8A151B]/5',
        'border-blue-900/30': 'border-[#8A151B]/20',
        
        '#1e293b': '#e2e8f0',
        '#64748b': '#64748b',
        '#0f172a': '#ffffff',
        '#f8fafc': '#0f172a',
        '#475569': '#64748b',
        'bg-[#1e293b]': 'bg-slate-200',
    };

    let newContent = content;
    for (const [key, value] of Object.entries(replacements)) {
        const escapedKey = key.replace(/[\[\]\/#]/g, '\\$&');
        const re = new RegExp(escapedKey, 'g');
        newContent = newContent.replace(re, value);
    }
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated theme in ' + filePath);
    }
}

processDirectory('app');
processDirectory('components');
