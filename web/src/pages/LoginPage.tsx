import { useEffect } from 'react';
import { Form, Formik } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import { AuthErrorToast } from '../components/AuthErrorToast';
import { useAuth } from '../context/AuthContext';
import { validateLogin, type LoginValues } from './authValidation';
import '../styles/Login.css';

export default function LoginPage() {
  const { login, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/profile', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-container">
      <AuthErrorToast message={error} onClose={clearError} />
      <div className="auth-card">
        <h1>Login</h1>
        <p className="auth-subtitle">Welcome back to NINJAS X</p>
        <Formik<LoginValues>
          initialValues={{ email: '', password: '' }}
          validate={validateLogin}
          onSubmit={async values => {
            try {
              await login(values.email.trim(), values.password);
              navigate('/profile');
            } catch {
              // The API error is shown in AuthErrorToast.
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form noValidate>
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
                  type="password" id="password" name="password" autoComplete="current-password"
                  value={values.password} onChange={handleChange} onBlur={handleBlur}
                  aria-invalid={Boolean(touched.password && errors.password)}
                  aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
                  placeholder="Enter your password"
                />
                {touched.password && errors.password && <p id="password-error" className="field-error">{errors.password}</p>}
              </div>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Login'}
              </button>
            </Form>
          )}
        </Formik>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
