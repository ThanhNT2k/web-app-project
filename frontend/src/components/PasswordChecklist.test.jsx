import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PasswordChecklist from './PasswordChecklist';

describe('PasswordChecklist', () => {
  it('does not render before the user types a password', () => {
    const { container } = render(<PasswordChecklist password="" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('marks all password requirements as met for a strong password', () => {
    const { container } = render(<PasswordChecklist password="StrongPass1!" />);

    expect(container.querySelectorAll('.password-checklist__item')).toHaveLength(4);
    expect(container.querySelectorAll('.password-checklist__item.met')).toHaveLength(4);
  });
});
