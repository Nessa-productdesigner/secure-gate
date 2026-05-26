function getStrength(password: string): { label: string; color: string; width: string } {
  if (password.length === 0) return { label: "", color: "", width: "0%" };

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const variety = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;

  const isStrong =
    password.length >= 8 && hasUpper && hasLower && hasNumber && hasSymbol;

  if (isStrong) {
    return { label: "Strong", color: "bg-[#16A34A]", width: "100%" };
  }

  if (password.length < 6 || variety < 2) {
    return { label: "Weak", color: "bg-[#DC2626]", width: "33%" };
  }

  return { label: "Fair", color: "bg-[#D97706]", width: "66%" };
}

export function PasswordStrength({ password }: { password: string }) {
  const strength = getStrength(password);
  if (!strength.label) return null;

  return (
    <div className="flex flex-col gap-1" aria-live="polite">
      <div className="h-1.5 rounded-full bg-[var(--surface-foreground-1)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
          style={{ width: strength.width }}
          role="progressbar"
          aria-valuenow={
            strength.label === "Strong" ? 100 : strength.label === "Fair" ? 66 : 33
          }
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Password strength: ${strength.label}`}
        />
      </div>
      <p className="text-xs text-muted">Password strength: {strength.label}</p>
    </div>
  );
}
