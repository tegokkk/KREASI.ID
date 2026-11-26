CREATE TABLE "__KREASI_SCHEMA__".learning_materials (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 160),
  category TEXT NOT NULL CHECK (category IN ('kenali-potensi', 'mengembangkan-potensi', 'umum')),
  summary TEXT NOT NULL DEFAULT '' CHECK (char_length(summary) <= 300),
  content TEXT NOT NULL CHECK (char_length(btrim(content)) BETWEEN 1 AND 8000),
  resource_url TEXT,
  school TEXT,
  author_id TEXT NOT NULL REFERENCES "__KREASI_SCHEMA__"."user"(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('superadmin', 'admin', 'bk')),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX learning_materials_created_idx
  ON "__KREASI_SCHEMA__".learning_materials(created_at DESC, id DESC);

ALTER TABLE "__KREASI_SCHEMA__".learning_materials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "__KREASI_SCHEMA__".learning_materials FROM PUBLIC;
