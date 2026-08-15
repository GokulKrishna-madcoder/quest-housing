# Agent.md – Project Details for Quest Housing

## 1️⃣ Project Overview & Purpose
Quest Housing is a React‑based web application that connects property owners and tenants through lead‑generation funnels. It captures leads via Supabase, offers admin dashboards, integrates Google Maps and CanvasJS for analytics, and runs on AI Studio.

## 2️⃣ Tech Stack & Dependencies
| Package | Version | Type |
|---|---|---|
| react | 19.0.1 | Dependency |
| react‑dom | 19.0.1 | Dependency |
| @supabase/supabase‑js | 2.106.1 | Dependency |
| @sanity/client | 7.22.0 | Dependency |
| @google/genai | 1.29.0 | Dependency |
| @google/generative‑ai | 0.24.1 | Dependency |
| @tanstack/react‑query | 5.100.14 | Dependency |
| tailwindcss | 4.1.14 | Dev Dependency |
| vite | 6.2.3 | Dev Dependency |
| typescript | ~5.8.2 | Dev Dependency |
| @vitejs/plugin‑react | 5.0.4 | Dev Dependency |
| zod | 4.4.3 | Dependency |
| ... | ... | ... |

> *Only the most relevant packages are shown; the full list is in `package.json`.*

## 3️⃣ Key Components & File Layout
- **src/components/** – Reusable UI (Navbar, Footer, AnalyticsTracker, CanvasJSChart, etc.)
- **src/components/admin/** – Admin dashboard widgets (AdminLayout, DeleteModal, StatusSelector, …)
- **src/components/lead‑funnel/** – Multi‑step owner lead capture
- **src/components/owner‑funnel/** – Multi‑step tenant lead capture
- **src/pages/** – Top‑level routes (Home, About, PropertyDetails, Registration, SavedProperties, admin pages)
- **src/App.tsx & src/main.tsx** – Application entry points

## 4️⃣ Data & API Model
Supabase tables (see `supabase_schema.sql`):
- **owner_leads** – Owner‑submitted property lead data.
- **tenant_leads** – Tenant‑submitted interest data.
- **analytics_events** – Front‑end interaction logging.

Row‑Level Security (RLS) policies allow anonymous inserts for public forms while restricting reads/updates to the authenticated admin (`questhousingblr@gmail.com`). A storage bucket `owner‑property‑images` stores uploaded images with public read access.

## 5️⃣ Build & Deployment Workflow
| Step | Command | Description |
|---|---|---|
| Install deps | `npm install` | Install Node dependencies |
| Run locally | `npm run dev` | Starts Vite dev server on port 3000 |
| Build | `npm run build` | Generates production assets in `dist/` |
| Preview | `npm run preview` | Serves built assets locally |
| Lint/Type‑check | `npm run lint` | Runs `tsc --noEmit` |
| Deploy Edge Functions | Use Supabase CLI or `mcp__supabase__deploy_edge_function` tool |

## 6️⃣ Known Configurations / Environment Variables
| Variable | Description |
|---|---|
| **NVIDIA_API_KEY** | Required for NVIDIA Llama AI API calls |
| **APP_URL** | URL where the app is hosted (injected by AI Studio) |
| **VITE_APPS_SCRIPT_URL** | Google Apps Script endpoint for form POSTs |
| **NEXT_PUBLIC_SANITY_PROJECT_ID** | Sanity CMS project identifier |
| **NEXT_PUBLIC_SANITY_DATASET** | Sanity dataset (e.g., `production`) |
| **NEXT_PUBLIC_SANITY_API_VERSION** | Sanity API version date |
| **SANITY_API_TOKEN** | Optional token for server‑side Sanity access |

---
*Generated on 2026‑06‑03 by Claude Code (caveman ultra mode).*