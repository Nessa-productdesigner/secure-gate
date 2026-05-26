interface AlertProps {
  type: "success" | "error" | "warning";
  message: string;
}

const styles = {
  success: "bg-[#06340f] border-[#16A34A] text-[#7bcd83]",
  error: "bg-[#330707] border-[#DC2626] text-[#ff7c7c]",
  warning: "bg-[#301f09] border-[#D97706] text-[#f5ce82]",
};

export function Alert({ type, message }: AlertProps) {
  return (
    <div
      className={`p-3 rounded-lg border text-sm ${styles[type]}`}
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
