import { isIP } from 'node:net';

export function clientIp(req, { vercel = false } = {}) {
  // Trust this header only inside the Vercel adapter, where Vercel overwrites it.
  // Local requests cannot opt in by sending an x-vercel-* header.
  const value = vercel ? req.headers['x-vercel-forwarded-for'] : req.socket?.remoteAddress;
  if (typeof value !== 'string' || !isIP(value.trim())) return null;
  const address = value.trim();
  if (address.startsWith('::ffff:') && isIP(address.slice(7)) === 4) return address.slice(7);
  if (isIP(address) === 6) return new URL(`http://[${address}]/`).hostname.slice(1, -1);
  return address;
}
