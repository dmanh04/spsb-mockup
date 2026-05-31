---
title: Pet Care System — Customer + Staff Portals
status: Đã lập kế hoạch
created_date: 2026-05-31
started_date:
completed_date:
cancel_reason:
owner: ai
related_spec: docs/superpowers/specs/2026-05-31-petcare-system-redesign.md
---

# Customer + Staff Portals Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task.

**Goal:** Implement all page content for Customer, Operation Staff, and Pet Care Staff portals with real mock data and complex UI components.

**Architecture:** Each portal has dedicated pages under src/pages/{portal}/. Shared components in src/components/{domain}/. All pages use TypeScript + Tailwind CSS design system from Plan 1.

**Tech Stack:** React 18, TypeScript 5, React Router DOM v6, Tailwind CSS, Lucide React

---

## Files

| File | Action |
|---|---|
| `src/data/petMockData.ts` | Rewrite — pet profiles |
| `src/utils/format.ts` | Create — formatPrice, formatDate |
| `src/pages/customer/HomePage.tsx` | Create |
| `src/pages/customer/ProductListPage.tsx` | Create |
| `src/components/product/SKUVariantSelector.tsx` | Create — key complex component |
| `src/pages/customer/ProductDetailPage.tsx` | Create |
| `src/pages/customer/ServiceListPage.tsx` | Create |
| `src/pages/customer/ServiceDetailPage.tsx` | Create |
| `src/pages/customer/BookingWizardPage.tsx` | Create — 4-step wizard |
| `src/pages/customer/MyBookingsPage.tsx` | Create |
| `src/pages/customer/BookingDetailPage.tsx` | Create |
| `src/pages/customer/PetProfilePage.tsx` | Create |
| `src/pages/customer/CartPage.tsx` | Create |
| `src/pages/customer/OrderListPage.tsx` | Create |
| `src/pages/customer/OrderDetailPage.tsx` | Create |
| `src/pages/operation/DashboardPage.tsx` | Create |
| `src/pages/operation/QueuePage.tsx` | Create — Kanban board |
| `src/pages/operation/CalendarPage.tsx` | Create — week view by room |
| `src/pages/operation/MySchedulePage.tsx` | Create |
| `src/pages/petcare/TodayPage.tsx` | Create |
| `src/pages/petcare/BookingWorkPage.tsx` | Create |
| `src/pages/petcare/MySchedulePage.tsx` | Create |
| `src/App.tsx` | Modify — wire real pages instead of StubPage |
