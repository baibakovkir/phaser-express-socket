export function AuthErrorToast({ message, onClose }: { message: string | null; onClose: () => void }) {
  if (!message) return null;

  return (
    <div className="auth-toast" role="alert" aria-live="assertive">
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss error">×</button>
    </div>
  );
}
