import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PasswordInput from './PasswordInput';

describe('PasswordInput', () => {
  it('toggles password visibility without submitting the form', () => {
    render(
      <form>
        <PasswordInput id="password" aria-label="Mật khẩu" defaultValue="Secret1!" />
      </form>
    );

    const input = screen.getByLabelText('Mật khẩu');
    const toggle = screen.getByRole('button', { name: 'Hiện mật khẩu' });

    expect(input).toHaveAttribute('type', 'password');
    expect(toggle).toHaveAttribute('type', 'button');

    fireEvent.click(toggle);

    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Ẩn mật khẩu' })).toBeInTheDocument();
  });

  it('associates an inline error with the input', () => {
    render(
      <PasswordInput
        id="confirm-password"
        aria-label="Nhập lại mật khẩu"
        error="Mật khẩu nhập lại không khớp."
      />
    );

    const input = screen.getByLabelText('Nhập lại mật khẩu');
    const error = screen.getByRole('alert');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', error.id);
    expect(error).toHaveTextContent('Mật khẩu nhập lại không khớp.');
  });
});
