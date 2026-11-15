# GA4 ham JSON'u Analytics'e yükleme

Chat'e yapıştırınca JSON çoğu zaman **ortadan kesilir**. Tam paketi dosya olarak verin.

## Adımlar

1. GA4'ten kopyaladığınız **tüm** JSON'u bir dosyaya kaydedin:
   - `d:\pocketbusiness\docs\ga4-paste.json` (tek satır veya güzel format fark etmez)

2. Terminalde:

```bash
cd d:\pocketbusiness
node scripts/import-ga4-fixture.mjs docs/ga4-paste.json
```

3. Analytics sayfasını yenileyin (Ctrl+Shift+R).

## Kontrol

```bash
node -e "const j=require('./public/ga4-fixture.json'); console.log('satir', j.rows.length, 'oturum', j.totals?.[0]?.metricValues?.[5]?.value)"
```

## Kapatmak (tekrar mock)

`.env.local`:

```
NEXT_PUBLIC_GA4_FIXTURE=false
```

Sonra dev sunucuyu yeniden başlatın.
