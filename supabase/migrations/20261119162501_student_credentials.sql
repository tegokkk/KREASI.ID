ALTER TABLE "__KREASI_SCHEMA__"."user"
  ADD COLUMN nisn TEXT,
  ADD COLUMN school TEXT,
  ADD CONSTRAINT user_student_profile_check CHECK (
    (nisn IS NULL AND school IS NULL) OR (
      nisn IS NOT NULL AND school IS NOT NULL AND nisn ~ '^[0-9]{10}$'
      AND char_length(btrim(school)) BETWEEN 1 AND 150
    )
  );

CREATE UNIQUE INDEX user_nisn_unique ON "__KREASI_SCHEMA__"."user" (nisn) WHERE nisn IS NOT NULL;
