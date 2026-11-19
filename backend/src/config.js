import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
if (!['production', 'test'].includes(process.env.NODE_ENV) && process.env.VERCEL !== '1') {
  dotenv.config({ path: [path.resolve(__dirname, '../.env.local'), path.resolve(__dirname, '../../.env.local'),
    path.resolve(__dirname, '../.env'), path.resolve(__dirname, '../../.env')], quiet: true });
}

const ALLOWED_WEB_PROTOCOLS = new Set(['http:', 'https:']);
const ALLOWED_CONTACT_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

function parsePort(rawPort) {
  if (rawPort === undefined || rawPort === '') {
    return 3001;
  }
  const parsed = Number(rawPort);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    return 3001;
  }
  return parsed;
}

function parseRetentionDays(rawDays) {
  if (rawDays === undefined || rawDays === '') {
    return 30;
  }
  const parsed = Number(rawDays);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 365) {
    return 30;
  }
  return parsed;
}

function parseUrl(rawUrl, allowedProtocols) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return null;
  }
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const parsed = new URL(trimmed);
    if (!allowedProtocols.has(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function loadConfig(env = process.env) {
  const port = parsePort(env.PORT);
  const requestedMode = typeof env.QUIZ_MODE === 'string' ? env.QUIZ_MODE.trim().toLowerCase() : 'local';
  const formUrl = parseUrl(env.QUIZ_FORM_URL, ALLOWED_WEB_PROTOCOLS);
  const retentionDays = parseRetentionDays(env.QUIZ_RETENTION_DAYS);
  const contactUrl = parseUrl(env.BK_CONTACT_URL, ALLOWED_CONTACT_PROTOCOLS);

  // Fall back to local quiz whenever Google Forms mode lacks a valid responder URL.
  const quizMode = requestedMode === 'google-forms' && formUrl ? 'google-forms' : 'local';

  return {
    port,
    publicConfig: {
      quiz: {
        mode: quizMode,
        formUrl: quizMode === 'google-forms' ? formUrl : null,
        retentionDays,
      },
      support: {
        contactUrl,
      },
    },
  };
}
