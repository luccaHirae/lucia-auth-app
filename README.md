# Lucia Auth App

A modern authentication system built with Next.js, PostgreSQL, Prisma, and a custom design system using Tailwind CSS v4. This project demonstrates secure authentication with email/password, 2FA (TOTP), password reset, and a fully responsive, dark-themed UI.

## Overview

This app is a full-featured authentication system inspired by the [Lucia Auth Guide](https://lucia-auth.com/sessions/overview) and related example repositories. It is designed for modern web applications that require robust authentication, security, and a great user experience.

**Core Features:**

- User registration with email and password
- Login with email/password and optional 2FA (TOTP)
- 2FA setup with QR code and authenticator app
- Password reset via email
- Secure session management (cookie-based)
- Responsive, accessible, and dark-mode-first UI

## Technologies Used

- **Frontend:** Next.js (App Router), React, Tailwind CSS v4 (CSS-first config)
- **Backend:** Next.js API routes, PostgreSQL, Prisma ORM
- **Authentication:** Custom implementation following Lucia Auth patterns (no external auth library)
- **2FA:** TOTP (Time-based One-Time Password) with QR code
- **Validation:** Zod, React Hook Form

## Architecture

- **App Directory Structure:**

  - `src/app/` — Next.js app router pages (register, login, dashboard, 2fa-setup, forgot/reset password)
  - `src/components/` — Reusable UI components (Button, Card, Input, FormField, etc.)
  - `src/lib/` — Authentication/session/2FA/password reset logic and validation schemas
  - `prisma/` — Prisma schema and migrations
  - `api/auth/*` — API routes for registration, login, 2FA, password reset, session, etc.

- **Authentication Flow:**

  1. **Register:** User creates an account with email/password. Password is hashed and stored securely.
  2. **Login:** User logs in with email/password. If 2FA is enabled, a second step prompts for a TOTP code.
  3. **2FA Setup:** User can enable 2FA from the dashboard, scan a QR code, and verify with a TOTP code.
  4. **Password Reset:** User requests a reset link via email, sets a new password using the link.
  5. **Session Management:** Secure, httpOnly cookies are used for session tokens. Sessions are stored in the database.

- **Design System:**
  - Built with Tailwind CSS v4 using CSS-first configuration and custom CSS variables for theme tokens
  - All UI components use the design system for consistent dark/light theming, spacing, and typography
  - Responsive and accessible by default

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

- [Lucia Auth Guide](https://lucia-auth.com/sessions/overview)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4#css-first-configuration)
- [Prisma ORM](https://www.prisma.io/)
