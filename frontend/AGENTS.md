# AI Coding Agent Rules & Next.js Architecture Guide

You are assisting on the Employee Attendance Management System frontend. You must strictly adhere to these implementation rules.

## 1. Core Stack Rules
- **Backend:** Node.js, Express, MongoDB (Running on port `5000`)
- **Frontend:** Next.js (App Router), Tailwind CSS, Axios (Running on port `3000`)
- **Language:** Clean JavaScript (ES6+), NO TypeScript.

## 2. Next.js App Router Architecture
- **Client vs. Server Components:** Any page or component utilizing state (`useState`), side-effects (`useEffect`), or form events (`onSubmit`) **MUST** include the `'use client';` directive at the absolute top of the file.
- **Routing & Navigation:**
  - Use `import Link from 'next/link';` for structural links.
  - Use `import { useRouter } from 'next/navigation';` (NOT `next/router`) for client-side programmatic redirects.

## 3. Directory Mapping Blueprint
All frontend development happens inside `frontend/src/`:
- `src/app/page.js` ➜ Root Redirection Gate
- `src/app/login/page.js` ➜ Authentication Login Form
- `src/app/register/page.js` ➜ User Registration Form
- `src/app/dashboard/page.js` ➜ Employee Dashboard Portal
- `src/app/admin/dashboard/page.js` ➜ Manager/Admin Analytics Panel
- `src/utils/api.js` ➜ Global Axios instance with JWT request interceptors