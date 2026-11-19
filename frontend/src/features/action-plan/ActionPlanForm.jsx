import { Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import styles from './ActionPlanForm.module.css';

export function ActionPlanForm({
  fields,
  values,
  errors,
  fieldRefs,
  onChangeValue,
  onSubmitPlan,
  onRequestClear,
  hasAnyInput,
}) {
  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmitPlan();
      }}
      noValidate
    >
      <div className={styles.card}>
        {fields.map((field) => (
          <FormField
            key={field.id}
            ref={(el) => {
              fieldRefs.current[field.id] = el;
            }}
            id={`plan-${field.id}`}
            label={field.label}
            required={field.required}
            optionalLabel="Opsional di rencana awal"
            helperText={field.helperText}
            multiline={field.multiline}
            maxLength={1200}
            rows={field.multiline ? 3 : undefined}
            value={values[field.id] || ''}
            error={errors[field.id]}
            placeholder={field.placeholder}
            onChange={(event) => onChangeValue(field.id, event.target.value)}
          />
        ))}
      </div>

      <div className={styles.actions}>
        <Button type="submit" variant="primary">
          Lihat Rencanaku
        </Button>
        {hasAnyInput && (
          <Button type="button" variant="dangerText" onClick={onRequestClear}>
            <Trash2 size={16} aria-hidden="true" />
            <span>Hapus Isian</span>
          </Button>
        )}
      </div>
    </form>
  );
}
