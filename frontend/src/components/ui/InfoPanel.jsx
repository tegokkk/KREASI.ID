import { AlertCircle, CheckCircle2, Info, ShieldCheck } from 'lucide-react';
import styles from './InfoPanel.module.css';

const ICONS = {
  info: Info,
  privacy: ShieldCheck,
  success: CheckCircle2,
  warning: AlertCircle,
};

export function InfoPanel({
  tone = 'mint',
  icon = 'privacy',
  title,
  children,
  className = '',
  id,
  role,
}) {
  const IconComponent = ICONS[icon] || Info;

  return (
    <div
      id={id}
      role={role}
      className={[styles.panel, styles[tone] || styles.mint, className].filter(Boolean).join(' ')}
    >
      <div className={styles.iconWrap} aria-hidden="true">
        <IconComponent size={20} />
      </div>
      <div className={styles.content}>
        {title && <h2 className={styles.title}>{title}</h2>}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
