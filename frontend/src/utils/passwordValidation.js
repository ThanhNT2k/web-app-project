export const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

export function isStrongPassword(password) {
  return PASSWORD_PATTERN.test(password || '');
}

export function passwordsMatch(password, confirmPassword) {
  return password === confirmPassword;
}
