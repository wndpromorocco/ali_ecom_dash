// In demo/mock mode, API calls are intercepted locally and images are served
// from /public/uploads, so DOMAIN_BASE must be empty (relative URLs). Otherwise
// it points at the configured back-end.
export const DOMAIN_BASE =
  import.meta.env.VITE_USE_MOCK === 'true'
    ? ''
    : import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || '';
export const API_BASE = `${DOMAIN_BASE}/api/v1`;
export const ERP_API_URL = import.meta.env.VITE_ERP_API_URL || '';
