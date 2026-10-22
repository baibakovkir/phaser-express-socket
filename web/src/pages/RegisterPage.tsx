import { useEffect } from 'react';
import { Form, Formik } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import { AuthErrorToast } from '../components/AuthErrorToast';
import { useAuth } from '../context/AuthContext';
import { validateRegister, type RegisterValues } from './authValidation';
import '../styles/Login.css';

export default function RegisterPage() {
  const { register, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/profile', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-container">
      <AuthErrorToast message={error} onClose={clearError} />
      <div className="auth-card">
        <h1>Register</h1>
        <p className="auth-subtitle">Create your account and join the battle</p>
        <Formik<RegisterValues>
          initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
          validate={validateRegister}
          onSubmit={async values => {
            try {
              await register(values.username.trim(), values.email.trim(), values.password);
              navigate('/profile');
            } catch {
              // The API error is shown in AuthErrorToast.
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form noValidate>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text" id="username" name="username" autoComplete="username"
                  value={values.username} onChange={handleChange} onBlur={handleBlur}
                  aria-invalid={Boolean(touched.username && errors.username)}
                  aria-describedby={touched.username && errors.username ? 'username-error' : undefined}
                  placeholder="Choose a username" maxLength={20}
                />
                {touched.username && errors.username && <p id="username-error" className="field-error">{errors.username}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email" id="email" name="email" autoComplete="email"
                  value={values.email} onChange={handleChange} onBlur={handleBlur}
                  aria-invalid={Boolean(touched.email && errors.email)}
                  aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
                  placeholder="Enter your email"
                />
                {touched.email && errors.email && <p id="email-error" className="field-error">{errors.email}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password" id="password" name="password" autoComplete="new-password"
                  value={values.password} onChange={handleChange} onBlur={handleBlur}
                  aria-invalid={Boolean(touched.password && errors.password)}
                  aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
                  placeholder="Create a password"
                />
                {touched.password && errors.password && <p id="password-error" className="field-error">{errors.password}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password" id="confirmPassword" name="confirmPassword" autoComplete="new-password"
                  value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                  aria-invalid={Boolean(touched.confirmPassword && errors.confirmPassword)}
                  aria-describedby={touched.confirmPassword && errors.confirmPassword ? 'confirm-password-error' : undefined}
                  placeholder="Confirm your password"
                />
                {touched.confirmPassword && errors.confirmPassword && <p id="confirm-password-error" className="field-error">{errors.confirmPassword}</p>}
              </div>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account…' : 'Create Account'}
              </button>
            </Form>
          )}
        </Formik>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
