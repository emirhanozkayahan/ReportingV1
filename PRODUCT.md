# Orvalot — Product context

## What it is
Orvalot is a performance-reporting platform for digital marketing agencies. It pulls every client
brand's ad, sales and site data into one clear view, synced daily.

- **Ads:** Meta Ads, Google Ads
- **E-commerce:** ikas, Shopify, T-Soft, Ticimax, IdeaSoft, WooCommerce
- **Analytics:** Google Analytics 4
- **Metrics:** ad spend, revenue, ROAS, orders, conversions, top products, traffic, period-over-period change, last sync time
- **AI assistant:** explains the numbers, always tied to the metric it talks about

## Users
- **Agency team (role `agency`)** — sees all brands, manages brands, client users and integrations.
- **Brand / client (role `brand`)** — sees only its own dashboard. Replaces the end-of-month PDF report
  with an always-open, transparent view.

## Promise
Turn scattered data into one clear view. Slogan: **Bütün veriler. Tek gerçek.** / *All data. One truth.*

## Audience & language
Turkish agencies and their e-commerce clients. UI copy is **Turkish**. The product is also the
founder's portfolio piece, so the public landing page must hold up for an international design audience.

## Surfaces
| Surface | Route | Mode |
|---|---|---|
| Landing page (public, portfolio) | `/` | Persuade |
| Login (agency + client) | `/login` | Operate |
| Agency overview | `/dashboard` | Operate |
| Brand dashboard (+ Meta, Google, Analytics, E-commerce tabs) | `/dashboard/[brand-slug]/…` | Operate |
| Admin: brands, users, integrations | `/admin` | Operate |

## Tech
Next.js 16 (App Router, `proxy.ts` instead of middleware — read `node_modules/next/dist/docs/` before
using an API), React 19, Tailwind CSS v4 (tokens in `app/globals.css`), Supabase, Recharts, lucide-react.
