import { useState } from 'react';

import { FontAwesomeIcon, faEye, faEyeSlash } from '../lib/icons';

function PasswordInput({
  className = 'form-control form-control-lg',
  error = '',
  id,
  ...inputProps
}) {
  const [visible, setVisible] = useState(false);
  const errorId = id && error ? `${id}-error` : undefined;

  return (
    <div>
      <div className="password-input">
        <input
          {...inputProps}
          id={id}
          className={className}
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
        />
        <button
          type="button"
          className="password-input__toggle"
          aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          <FontAwesomeIcon icon={visible ? faEyeSlash : faEye} aria-hidden="true" />
        </button>
      </div>
      {error ? (
        <div id={errorId} className="password-input__error" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}

export default PasswordInput;
