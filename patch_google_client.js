const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'dashboard', '[brand-slug]', 'google', 'google-client.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Insert Sort Functions
const sortFunctions = `
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "desc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (arr: any[]) => {
    if (!sortConfig || !arr) return arr;
    return [...arr].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const SortableHeader = ({ label, sortKey, align = "left" }: { label: string; sortKey: string; align?: "left" | "right" }) => {
    const isActive = sortConfig?.key === sortKey;
    return (
      <th 
        className={\`pb-3 font-semibold cursor-pointer select-none hover:text-[#f97316] transition-colors text-\${align}\`}
        onClick={() => handleSort(sortKey)}
      >
        <div className={\`flex items-center gap-1 \${align === 'right' ? 'justify-end' : ''}\`}>
          {label}
          {isActive ? (sortConfig.direction === "asc" ? "↑" : "↓") : <span className="text-slate-300">↕</span>}
        </div>
      </th>
    );
  };
`;

content = content.replace(
  `const [filterCampaign, setFilterCampaign] = useState<string>("all");`,
  `const [filterCampaign, setFilterCampaign] = useState<string>("all");\n${sortFunctions}`
);

// 2. Campaigns Table
content = content.replace(
  /<th className="pb-3 font-semibold">Kampanya<\/th>[\s\S]*?<th className="pb-3 font-semibold text-right">Gös\. Payı<\/th>/,
  `<SortableHeader label="Kampanya" sortKey="name" />
                    <SortableHeader label="Tür" sortKey="type" />
                    <SortableHeader label="Durum" sortKey="status" />
                    <SortableHeader label="Harcama" sortKey="spend" align="right" />
                    <SortableHeader label="Gösterim" sortKey="impressions" align="right" />
                    <SortableHeader label="Tıklama" sortKey="clicks" align="right" />
                    <SortableHeader label="CTR" sortKey="ctr" align="right" />
                    <SortableHeader label="CPC" sortKey="cpc" align="right" />
                    <SortableHeader label="Dönüşüm" sortKey="conversions" align="right" />
                    <SortableHeader label="Dön. Değeri" sortKey="convValue" align="right" />
                    <SortableHeader label="ROAS" sortKey="roas" align="right" />
                    <SortableHeader label="Gös. Payı" sortKey="impressionShare" align="right" />`
);
content = content.replace(
  `{data.campaigns.map((c: any) => (`,
  `{getSortedData(data.campaigns).map((c: any) => (`
);

// 3. AdGroups Table
content = content.replace(
  /<th className="pb-3 font-semibold">Öğe Grubu<\/th>[\s\S]*?<th className="pb-3 font-semibold text-right">ROAS<\/th>/,
  `<SortableHeader label="Öğe Grubu" sortKey="name" />
                    <SortableHeader label="Kampanya" sortKey="campaignName" />
                    <SortableHeader label="Durum" sortKey="status" />
                    <SortableHeader label="Harcama" sortKey="spend" align="right" />
                    <SortableHeader label="Gösterim" sortKey="impressions" align="right" />
                    <SortableHeader label="Tıklama" sortKey="clicks" align="right" />
                    <SortableHeader label="CTR" sortKey="ctr" align="right" />
                    <SortableHeader label="CPC" sortKey="cpc" align="right" />
                    <SortableHeader label="Dönüşüm" sortKey="conversions" align="right" />
                    <SortableHeader label="Dön. Değeri" sortKey="convValue" align="right" />
                    <SortableHeader label="ROAS" sortKey="roas" align="right" />`
);
content = content.replace(
  `{filtered.adGroups.map((ag: any) => (`,
  `{getSortedData(filtered.adGroups).map((ag: any) => (`
);

// 4. Keywords Table
content = content.replace(
  /<th className="pb-3 font-semibold">Anahtar Kelime<\/th>[\s\S]*?<th className="pb-3 font-semibold text-right">Konum<\/th>/,
  `<SortableHeader label="Anahtar Kelime" sortKey="keyword" />
                    <SortableHeader label="Eşleşme" sortKey="matchType" />
                    <SortableHeader label="Kampanya" sortKey="campaignName" />
                    <SortableHeader label="Harcama" sortKey="spend" align="right" />
                    <SortableHeader label="Gösterim" sortKey="impressions" align="right" />
                    <SortableHeader label="Tıklama" sortKey="clicks" align="right" />
                    <SortableHeader label="CTR" sortKey="ctr" align="right" />
                    <SortableHeader label="CPC" sortKey="cpc" align="right" />
                    <SortableHeader label="Dönüşüm" sortKey="conversions" align="right" />
                    <SortableHeader label="Dön. Değeri" sortKey="convValue" align="right" />
                    <SortableHeader label="Kalite" sortKey="qualityScore" align="right" />
                    <SortableHeader label="Konum" sortKey="position" align="right" />`
);
content = content.replace(
  `{filtered.keywords.map((kw: any) => (`,
  `{getSortedData(filtered.keywords).map((kw: any) => (`
);

// 5. Search Terms Table
content = content.replace(
  /<th className="pb-3 font-semibold">Arama Terimi<\/th>[\s\S]*?<th className="pb-3 font-semibold text-right">Dön\. Değeri<\/th>/,
  `<SortableHeader label="Arama Terimi" sortKey="searchTerm" />
                    <SortableHeader label="Eşleşen Anahtar Kelime" sortKey="matchedKeyword" />
                    <SortableHeader label="Kampanya" sortKey="campaignName" />
                    <SortableHeader label="Gösterim" sortKey="impressions" align="right" />
                    <SortableHeader label="Tıklama" sortKey="clicks" align="right" />
                    <SortableHeader label="CTR" sortKey="ctr" align="right" />
                    <SortableHeader label="Harcama" sortKey="spend" align="right" />
                    <SortableHeader label="Dönüşüm" sortKey="conversions" align="right" />
                    <SortableHeader label="Dön. Değeri" sortKey="convValue" align="right" />`
);
content = content.replace(
  `{data.searchTerms.map((st: any) => (`,
  `{getSortedData(data.searchTerms).map((st: any) => (`
);

// 6. PMax Table
content = content.replace(
  /<th className="pb-3 font-semibold">Yerleşim<\/th>[\s\S]*?<th className="pb-3 font-semibold text-right">Dön\. Değeri<\/th>/,
  `<SortableHeader label="Yerleşim" sortKey="placement" />
                    <SortableHeader label="Tür" sortKey="type" />
                    <SortableHeader label="Kampanya" sortKey="campaignName" />
                    <SortableHeader label="Gösterim" sortKey="impressions" align="right" />
                    <SortableHeader label="Tıklama" sortKey="clicks" align="right" />
                    <SortableHeader label="Harcama" sortKey="spend" align="right" />
                    <SortableHeader label="Dönüşüm" sortKey="conversions" align="right" />
                    <SortableHeader label="Dön. Değeri" sortKey="convValue" align="right" />`
);
content = content.replace(
  `{data.pmaxPlacements\\?.map((p: any) => (`.replace(/\?/g, '\\?'),
  `{getSortedData(data.pmaxPlacements || []).map((p: any) => (`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched google-client.tsx');
