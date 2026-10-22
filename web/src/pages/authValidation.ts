import type { FormikErrors } from 'formik';

export interface LoginValues {
  email: string;
  password: string;
}

export interface RegisterValues extends LoginValues {
  username: string;
  confirmPassword: string;
}

export function validateLogin(values: LoginValues): FormikErrors<LoginValues> {
  const errors: FormikErrors<LoginValues> = {};
  if (!values.email.trim()) errors.email = 'Enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (!values.password) errors.password = 'Enter your password.';
  return errors;
}

export function validateRegister(values: RegisterValues): FormikErrors<RegisterValues> {
  const errors: FormikErrors<RegisterValues> = validateLogin(values);
  const username = values.username.trim();
  if (!username) errors.username = 'Choose a username.';
  else if (username.length < 3 || username.length > 20) errors.username = 'Use 3–20 characters.';
  if (values.password && values.password.length < 6) errors.password = 'Use at least 6 characters.';
  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password.';
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}
