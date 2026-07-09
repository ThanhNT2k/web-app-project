import { FontAwesomeIcon } from '../lib/icons';

function IconBadge({ icon, className = '', size = 'md', tone = 'primary', label }) {
  return (
    <span
      className={`icon-badge icon-badge-${size} icon-badge-${tone} ${className}`.trim()}
      aria-hidden={label ? undefined : 'true'}
      aria-label={label}
    >
      <FontAwesomeIcon icon={icon} />
    </span>
  );
}

export default IconBadge;
