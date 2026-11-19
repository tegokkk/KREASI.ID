ALTER TABLE "__KREASI_SCHEMA__"."user"
  DROP CONSTRAINT user_role_check,
  DROP CONSTRAINT user_student_profile_check,
  ADD CONSTRAINT user_role_check CHECK (role IN ('user', 'superadmin', 'admin', 'bk')),
  ADD CONSTRAINT user_student_profile_check CHECK (
    (role IN ('bk', 'admin') AND nisn IS NULL AND school IS NOT NULL AND char_length(btrim(school)) BETWEEN 1 AND 150)
    OR (role <> 'bk' AND (
      (nisn IS NULL AND school IS NULL)
      OR (nisn IS NOT NULL AND school IS NOT NULL AND nisn ~ '^[0-9]{10}$'
          AND char_length(btrim(school)) BETWEEN 1 AND 150)
    ))
  );

CREATE TABLE "__KREASI_SCHEMA__".student_recaps (
  user_id TEXT PRIMARY KEY REFERENCES "__KREASI_SCHEMA__"."user"(id) ON DELETE CASCADE,
  answers TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX student_recaps_submitted_idx ON "__KREASI_SCHEMA__".student_recaps(submitted_at DESC, user_id DESC);
ALTER TABLE "__KREASI_SCHEMA__".student_recaps ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "__KREASI_SCHEMA__".student_recaps FROM PUBLIC;
