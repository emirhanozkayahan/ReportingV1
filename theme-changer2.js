const fs = require('fs');

function processFile(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Light theme replacements for charts and other missed classes
    const replacements = {
        '#1e293b': '#e2e8f0', // grid lines
        '#64748b': '#64748b', // axis text
        '#0f172a': '#ffffff', // tooltip bg
        '#f8fafc': '#0f172a', // tooltip text
        '#475569': '#64748b', // bar chart axis
        'bg-[#1e293b]': 'bg-slate-200', // progress bar backgrounds
        'text-white': 'text-slate-900', // missed text-white
        'bg-slate-900/50': 'bg-slate-50',
    };

    let newContent = content;
    for (const [key, value] of Object.entries(replacements)) {
        const escapedKey = key.replace(/[\[\]\/#]/g, '\\$&');
        const re = new RegExp(escapedKey, 'g');
        newContent = newContent.replace(re, value);
    }
    
    if (content !== newContent) {
        fs.writeFileSync(path, newContent, 'utf8');
        console.log('Updated charts in ' + path);
    }
}

processFile('app/dashboard/[brand-slug]/dashboard-client.tsx');
processFile('components/dashboard-sidebar.tsx');
processFile('app/login/page.tsx');
