import { accountRequest } from './auth';

export const MATERIAL_CATEGORIES = [
  {
    id: 'kenali-potensi',
    label: 'Kenali Potensi (Langkah 2)',
    shortLabel: 'Kenali Potensi',
  },
  {
    id: 'mengembangkan-potensi',
    label: 'Mengembangkan Potensi (Langkah 3)',
    shortLabel: 'Mengembangkan Potensi',
  },
  {
    id: 'umum',
    label: 'Materi Tambahan (Dashboard Siswa)',
    shortLabel: 'Materi Tambahan',
  },
];

export const MATERIAL_CATEGORY_LABELS = Object.fromEntries(
  MATERIAL_CATEGORIES.map((item) => [item.id, item.shortLabel])
);

export async function listMaterials({ category = '', scope = '', signal } = {}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (scope) params.set('scope', scope);
  const query = params.toString();
  const data = await accountRequest(`/api/materials${query ? `?${query}` : ''}`, { signal });
  return Array.isArray(data?.materials) ? data.materials : [];
}

export async function createMaterial(payload) {
  const data = await accountRequest('/api/materials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return data.material;
}

export async function deleteMaterial(id) {
  return accountRequest(`/api/materials/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
