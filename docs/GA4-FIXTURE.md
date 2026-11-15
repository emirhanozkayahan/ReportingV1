# GA4 geçici fixture (deneme)

Analytics sayfası varsayılan olarak `public/ga4-fixture.json` içindeki ham GA4 yanıtını kullanır.

## Kapatmak

`.env.local`:

```
NEXT_PUBLIC_GA4_FIXTURE=false
```

## Yeni API yanıtı yapıştırmak

```bash
node scripts/import-ga4-fixture.mjs path/to/ga4-response.json
```

veya `public/ga4-fixture.json` dosyasını doğrudan değiştirin.

## Yeniden üretmek (repo içi satırlardan)

```bash
node scripts/build-ga4-fixture.mjs
```

## Ekranda GA4’ten gelenler

- Üst KPI kartları (`totals` satırı)
- Trafik kaynakları tablosu (57 satır, oturuma göre sıralı)
- Dönüşüm özeti (`keyEvents:purchase` → 209)
- Diğer sekmeler (huni, sayfa, kitle) hâlâ mock
