const AUTH_MESSAGES = {
  INVALID_EMAIL_OR_PASSWORD: 'Email atau kata sandi tidak sesuai.',
  USER_ALREADY_EXISTS: 'Email sudah terdaftar. Silakan masuk.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Email sudah terdaftar. Silakan masuk.',
  PASSWORD_TOO_SHORT: 'Gunakan kata sandi minimal 12 karakter.',
  PASSWORD_TOO_LONG: 'Kata sandi maksimal 128 karakter.',
  INVALID_EMAIL: 'Masukkan alamat email yang valid.',
};

// A misrouted API must not accept the SPA's HTML as a successful response.
export async function jsonRequest(url, { method = 'GET', body, signal, timeoutMs = 10000 } = {}) {
  const requestSignal = AbortSignal.any([
    AbortSignal.timeout(timeoutMs),
    ...(signal ? [signal] : []),
  ]);
  const response = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: requestSignal,
  });
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Respons API tidak valid. Periksa konfigurasi server dan coba lagi.');
  }
  const data = await response.json();
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Respons API tidak valid. Coba lagi.');
  }
  return { ok: response.ok, status: response.status, data };
}

export async function accountRequest(url, options) {
  const { ok, status, data } = await jsonRequest(url, options);
  if (!ok) {
    const message = status === 429
      ? 'Terlalu banyak percobaan. Tunggu satu menit lalu coba lagi.'
      : AUTH_MESSAGES[data.code] ?? data.error ?? 'Permintaan belum berhasil. Periksa isian dan coba lagi.';
    const error = new Error(message);
    error.status = status;
    throw error;
  }
  return data;
}
