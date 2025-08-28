'use client';

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn:
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    'https://c35e2e5f3e1ef7ac81d048f2e531b23b@o4509906185748480.ingest.us.sentry.io/4509906187517952',

  environment: process.env.SENTRY_ENVIRONMENT || 'development',
  tracesSampleRate: 0.1,

  // Reduce replay sample rates for better performance
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 0.1,

  // Filter out common browser errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Network Error',
    'Load failed',
    'Failed to fetch',
    'Request aborted',
    'Non-Error promise rejection captured',
  ],

  beforeSend(event) {
    // Remove sensitive data
    if (event.request?.headers) event.request.headers = {};
    if (event.user) {
      event.user = { id: event.user.id as string };
    }
    return event;
  },

  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
