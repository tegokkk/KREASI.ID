# Supabase PostgreSQL CA

`supabase-root-2021.crt` is a public CA certificate, not a secret. Downloaded from:

https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt

SHA-256 fingerprint: `80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`.

Valid through 2031-04-26. The backend trusts this CA for Supabase database hostnames while preserving certificate and hostname verification. Set `DATABASE_SSL_CA` to a replacement PEM when Supabase rotates its CA. Never disable verification to work around certificate errors.

Reference: https://supabase.com/docs/guides/platform/ssl-enforcement
