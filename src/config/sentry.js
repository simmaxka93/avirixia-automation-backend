const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

function initSentry(app) {
  if (!process.env.SENTRY_DSN) {
    console.warn('⚠️  Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      new ProfilingIntegration(),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      // Filter out sensitive data
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
      }
      return event;
    },
  });

  console.log('✅ Sentry error tracking initialized');
}

function getSentryMiddleware() {
  return {
    requestHandler: Sentry.Handlers.requestHandler(),
    tracingHandler: Sentry.Handlers.tracingHandler(),
    errorHandler: Sentry.Handlers.errorHandler(),
  };
}

module.exports = { initSentry, getSentryMiddleware, Sentry };
