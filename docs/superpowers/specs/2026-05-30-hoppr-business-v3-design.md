# Hoppr Business v3 — Design Spec

**Date:** 2026-05-30
**Status:** In Progress
**Approach:** Full rebuild following the complete spec

## Core Architecture

Same shared PostgreSQL (Neon), NextAuth with BAR_MANAGER + SUPER_ADMIN roles, Styled Components (Dark & Bold theme), Prisma ORM.

## What Changes from v2

| Area | v2 | v3 |
|---|---|---|
| Bar Manager Dashboard | Simple overview | KPI cards, pending approvals, activity feed, AI insights, staff summary, compliance score, quick actions |
| Promotions | Basic CRUD | Full CRUD + AI wizard + A/B testing + bulk actions + export |
| VIP Passes | Stub | Full CRUD + inventory + redemption log + analytics |
| Staff | None | Invite, manage, permissions, activity log, performance |
| Content Approval | None | Full workflow: staff submits → manager approves → publishes |
| Analytics | Basic | Deep: impressions, clicks, heatmap, competitor benchmark, custom dashboards, export |
| Compliance | Rules + queue | Score card, violations, appeals, auto-fix, training |
| Bar Settings | Basic | Full: hours, media gallery, social links, notifications, billing, API access |
| QR Scanner | Built | Same + manual entry + history |
| Admin | Basic | Full platform: KPI, alerts, revenue, user/bar growth charts, top bars |
| CRM | Basic claims | Full pipeline + sales activities + tasks + email campaigns |
| AI Management | None | Model performance, training data, retraining, API cost tracking |
| Audit Log | Basic | Full with changes diff, export, retention |
| Support | None | Chat interface, conversation list, ticket analytics |

## Build Order

1. **Dashboard Shell** — layout, sidebar, KPI cards, quick actions
2. **Promotions 2.0** — full CRUD with AI wizard, approval workflow, A/B testing
3. **VIP Passes 2.0** — full CRUD with inventory tracking, redemption log
4. **Staff Management** — invite, roles, permissions, activity log
5. **Analytics 2.0** — deep bar analytics with charts, heatmap, export
6. **Compliance 2.0** — score card, violations, appeals, training
7. **Bar Settings 2.0** — full settings with hours, media, billing
8. **Admin 2.0** — platform dashboard, CRM pipeline, user management, AI management
9. **Support Chat** — real-time messaging with bars
10. **Audit Log 2.0** — full logging with changes diff, retention

## Test Accounts

| Email | Password | Role |
|---|---|---|
| admin@hoppr.fi | password123 | SUPER_ADMIN |
| manager@barloose.fi | password123 | BAR_MANAGER (Bar Loose) |
| manager@clubx.fi | password123 | BAR_MANAGER (Club X) |
| staff@barloose.fi | password123 | STAFF (Bar Loose) |

## Shared DB

Both consumer and business apps point to same Neon PostgreSQL. Business creates promotions → consumer feed reads them. Consumer purchases passes → business sees redemptions.
