import axios from 'axios';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : dateFormatter.format(d);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : dateTimeFormatter.format(d);
}

export function formatRelative(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const seconds = Math.round((d.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return relativeFormatter.format(seconds, 'second');
  if (abs < 3600) return relativeFormatter.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return relativeFormatter.format(Math.round(seconds / 3600), 'hour');
  if (abs < 86400 * 30) return relativeFormatter.format(Math.round(seconds / 86400), 'day');
  return formatDate(value);
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${s % 60}s`;
  return `${s}s`;
}

export function shortId(id: string | null | undefined): string {
  return id ? id.split('-')[0] : '—';
}

export function titleCase(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initials(source: string | null | undefined): string {
  if (!source) return '?';
  const clean = source.includes('@') ? source.split('@')[0] : source;
  const parts = clean.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Returns the URL only if it is http(s). User-supplied links pass the API's
 * generic URL validation, which also accepts `javascript:` and `data:` URLs.
 */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

export type ApiErrorKind = 'network' | 'unauthorized' | 'forbidden' | 'not_found' | 'validation' | 'rate_limited' | 'server';

export interface ApiErrorInfo {
  kind: ApiErrorKind;
  status?: number;
  message: string;
}

/** Normalises Axios / Supabase / unknown errors into something a UI can present honestly. */
export function describeError(err: unknown, fallback = 'Something went wrong.'): ApiErrorInfo {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data: any = err.response?.data;
    let serverMessage: string | undefined;
    if (Array.isArray(data?.details)) serverMessage = data.details.map((e: any) => e?.message).filter(Boolean).join(' ');
    else if (Array.isArray(data?.error)) serverMessage = data.error.map((e: any) => e?.message).filter(Boolean).join(' ');
    else if (typeof data?.error === 'string') serverMessage = data.error;
    else if (typeof data?.message === 'string') serverMessage = data.message;

    if (!err.response) {
      return { kind: 'network', message: 'The server could not be reached. Check your connection and try again.' };
    }
    if (status === 401) return { kind: 'unauthorized', status, message: 'Your session has expired. Sign in again.' };
    if (status === 403) return { kind: 'forbidden', status, message: serverMessage || 'You do not have permission to do that.' };
    if (status === 404) return { kind: 'not_found', status, message: serverMessage || 'This could not be found.' };
    if (status === 400 || status === 422) return { kind: 'validation', status, message: serverMessage || 'Some fields need attention.' };
    if (status === 429) return { kind: 'rate_limited', status, message: serverMessage || 'Too many requests. Wait a moment and try again.' };
    return { kind: 'server', status, message: serverMessage || fallback };
  }
  if (err instanceof Error && err.message) return { kind: 'server', message: err.message };
  return { kind: 'server', message: fallback };
}
