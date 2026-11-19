ALTER TABLE "__KREASI_SCHEMA__"."user"
  DROP CONSTRAINT user_role_check,
  DROP CONSTRAINT user_student_profile_check,
  ADD CONSTRAINT user_role_check CHECK (role IN ('user', 'superadmin', 'bk')),
  ADD CONSTRAINT user_student_profile_check CHECK (
    (role = 'bk' AND nisn IS NULL AND school IS NOT NULL AND char_length(btrim(school)) BETWEEN 1 AND 150)
    OR (role <> 'bk' AND (
      (nisn IS NULL AND school IS NULL)
      OR (nisn IS NOT NULL AND school IS NOT NULL AND nisn ~ '^[0-9]{10}$'
          AND char_length(btrim(school)) BETWEEN 1 AND 150)
    ))
  );
