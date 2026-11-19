export const DEFAULT_PUBLIC_CONFIG = {
  quiz: {
    mode: 'local',
    formUrl: null,
    retentionDays: 30,
  },
  support: {
    contactUrl: null,
  },
  isFallback: true,
};

function sanitizeUrl(value, allowedProtocols) {
  if (!value || typeof value !== 'string') {
    return null;
  }
  try {
    const parsed = new URL(value.trim());
    return allowedProtocols.includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function normalizePublicConfig(payload) {
  if (!payload || typeof payload !== 'object') {
    return DEFAULT_PUBLIC_CONFIG;
  }

  const rawQuiz = payload.quiz && typeof payload.quiz === 'object' ? payload.quiz : {};
  const rawSupport = payload.support && typeof payload.support === 'object' ? payload.support : {};

  const formUrl = sanitizeUrl(rawQuiz.formUrl, ['http:', 'https:']);
  const mode = rawQuiz.mode === 'google-forms' && formUrl ? 'google-forms' : 'local';
  const retentionDays =
    Number.isInteger(rawQuiz.retentionDays) && rawQuiz.retentionDays > 0
      ? rawQuiz.retentionDays
      : 30;
  const contactUrl = sanitizeUrl(rawSupport.contactUrl, ['http:', 'https:', 'mailto:', 'tel:']);

  return {
    quiz: {
      mode,
      formUrl: mode === 'google-forms' ? formUrl : null,
      retentionDays,
    },
    support: {
      contactUrl,
    },
    isFallback: false,
  };
}

export async function fetchPublicConfig({ timeoutMs = 4000, signal, supportOnly = false } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const onParentAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timer);
      return DEFAULT_PUBLIC_CONFIG;
    }
    signal.addEventListener('abort', onParentAbort, { once: true });
  }

  try {
    const response = await fetch(supportOnly ? '/api/support' : '/api/public-config', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      return DEFAULT_PUBLIC_CONFIG;
    }

    const data = await response.json();
    return normalizePublicConfig(data);
  } catch {
    return DEFAULT_PUBLIC_CONFIG;
  } finally {
    clearTimeout(timer);
    if (signal) {
      signal.removeEventListener('abort', onParentAbort);
    }
  }
}
