import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';
import styles from './FormField.module.css';

export const FormField = forwardRef(function FormField(
  {
    id,
    label,
    required = false,
    optionalLabel = 'Opsional',
    helperText,
    error,
    multiline = false,
    rows = 4,
    value,
    onChange,
    placeholder = '',
    ...rest
  },
  ref
) {
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;

  const Control = multiline ? 'textarea' : 'input';

  return (
    <div className={styles.fieldGroup}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <span className={required ? styles.badgeRequired : styles.badgeOptional}>
          {required ? 'Wajib diisi' : optionalLabel}
        </span>
      </div>

      {helperText && (
        <p id={helperId} className={styles.helper}>
          {helperText}
        </p>
      )}

      <Control
        ref={ref}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-required={required || undefined}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        rows={multiline ? rows : undefined}
        className={[
          styles.control,
          multiline ? styles.textarea : styles.input,
          error ? styles.controlError : '',
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />

      {error && (
        <p id={errorId} role="alert" className={styles.errorText}>
          <AlertCircle size={16} aria-hidden="true" className={styles.errorIcon} />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
});
