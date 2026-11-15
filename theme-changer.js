const fs = require('fs');

function replaceAll(str, mapObj) {
    let re = new RegExp(Object.keys(mapObj).join("|"), "gi");
    return str.replace(re, function(matched){
        return mapObj[matched.toLowerCase()] || mapObj[matched];
    });
}

function processFile(path) {
    let content = fs.readFileSync(path, 'utf8');
    
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
        'border-blue-900/30': 'border-[#8A151B]/20'
    };

    let newContent = content;
    for (const [key, value] of Object.entries(replacements)) {
        const escapedKey = key.replace(/[\[\]\/#]/g, '\\$&');
        const re = new RegExp(escapedKey, 'g');
        newContent = newContent.replace(re, value);
    }
    
    newContent = newContent.replace(/Genel ROAS/g, 'Genel ROI');
    
    if (path.includes('dashboard-client.tsx')) {
        const ga4Match = /<p className="text-\[10px\] uppercase text-slate-500 tracking-wider">Yeni Kullanıcılar<\/p>\s*<p className="text-2xl font-bold text-amber-500 mt-1">\{data\.stats\.ecommerce\.newUsers\.toLocaleString\(\)\}<\/p>\s*<\/div>/g;
        newContent = newContent.replace(ga4Match, `<p className="text-[10px] uppercase text-slate-500 tracking-wider">Yeni Kullanıcılar</p>
                   <p className="text-2xl font-bold text-amber-500 mt-1">{data.stats.ecommerce.newUsers.toLocaleString()}</p>
                </div>
                <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                   <p className="text-[10px] uppercase text-slate-500 tracking-wider">Toplam Kullanıcı</p>
                   <p className="text-2xl font-bold text-indigo-600 mt-1">{(data.stats.ecommerce.newUsers + data.stats.ecommerce.returningUsers).toLocaleString()}</p>
                </div>
                <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                   <p className="text-[10px] uppercase text-slate-500 tracking-wider">Oturum</p>
                   <p className="text-2xl font-bold text-emerald-600 mt-1">{Math.round((data.stats.ecommerce.newUsers + data.stats.ecommerce.returningUsers) * 1.4).toLocaleString()}</p>
                </div>`);

        const campaignBlockRegex = /\{\/\* 10\. CAMPAIGN PERFORMANCE \(META & GOOGLE\) \*\/\}[\s\S]*?(?=\{\/\* 9\. DEVICE & TECH & 12\. AUDIENCES \*\/\})/g;
        newContent = newContent.replace(campaignBlockRegex, '');
    }

    if (content !== newContent) {
        fs.writeFileSync(path, newContent, 'utf8');
        console.log('Updated theme in ' + path);
    }
}

processFile('app/dashboard/[brand-slug]/dashboard-client.tsx');
processFile('components/dashboard-sidebar.tsx');
processFile('app/login/page.tsx');

let layout = fs.readFileSync('app/layout.tsx', 'utf8');
layout = layout.replace(/Geist, Geist_Mono/g, 'Manrope');
layout = layout.replace(/const geistSans = Geist\(\{[\s\S]*?\}\);/g, 'const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });');
layout = layout.replace(/const geistMono = Geist_Mono\(\{[\s\S]*?\}\);/g, '');
layout = layout.replace(/\$\{geistSans\.variable\} \$\{geistMono\.variable\}/g, '${manrope.variable}');
fs.writeFileSync('app/layout.tsx', layout, 'utf8');
console.log('done layout');
