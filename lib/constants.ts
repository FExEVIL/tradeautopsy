/**
 * Centralized domain and URL constants for the application.
 * Uses environment variables when provided, otherwise falls back to the new production domain.
 */

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.tradeautopsy.in'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || `${APP_URL}/api`

export const AUTH_CALLBACK_URL =
  process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || `${APP_URL}/auth/callback`

export const PASSWORD_RESET_URL =
  process.env.NEXT_PUBLIC_PASSWORD_RESET_URL ||
  `${APP_URL}/auth/reset-password`

export const EMAIL_CONFIRMATION_URL =
  process.env.NEXT_PUBLIC_EMAIL_CONFIRMATION_URL ||
  `${APP_URL}/auth/callback`
