import * as React from "react";

function getStrength(password: string): { label: string; color: string; width: string } {
  if (password.length === 0) return { label: "", color: "", width: "0%" };

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const variety = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;

  if (password.length < 6 || variety < 2) {
    return { label: "Weak", color: "bg-[#DC2626]", width: "33%" };
  }
  if (password.length < 8 || variety < 3) {
    return { label: "Fair", color: "bg-[#D97706]", width: "66%" };
  }
  return { label: "Strong", color: "bg-[#16A34A]", width: "100%" };
}

export function PasswordStrength({ password }: { password: string }) {
  const strength = getStrength(password);
  if (!strength.label) return null;

  return (
    <div className="flex flex-col gap-1">
      <div className="h-1.5 rounded-full bg-[#1F2937] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
          style={{ width: strength.width }}
        />
      </div>
      <p className="text-xs text-[#9CA3AF]">Password strength: {strength.label}</p>
    </div>
  );
}
