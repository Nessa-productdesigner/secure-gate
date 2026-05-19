import * as React from "react";

interface VerifyEmailTemplateProps {
  verificationUrl: string;
}

export function VerifyEmailTemplate({ verificationUrl }: VerifyEmailTemplateProps) {
  return (
    <div style={{
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      backgroundColor: "#0F172A",
      color: "#F9FAFB",
      padding: "40px 20px",
      minHeight: "100%",
      display: "flex",
      justifyContent: "center"
    }}>
      <div style={{
        maxWidth: "560px",
        width: "100%",
        backgroundColor: "#1E293B",
        border: "1px solid #334155",
        borderRadius: "8px",
        padding: "32px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      }}>
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <span style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#3B82F6",
            letterSpacing: "0.05em"
          }}>
            SECURE<span style={{ color: "#F9FAFB" }}>GATE</span>
          </span>
        </div>
        
        <h1 style={{
          fontSize: "20px",
          fontWeight: 600,
          color: "#F9FAFB",
          margin: "0 0 16px 0",
          textAlign: "center"
        }}>
          Verify Your Email Address
        </h1>
        
        <p style={{
          fontSize: "14px",
          lineHeight: "24px",
          color: "#9CA3AF",
          margin: "0 0 24px 0",
          textAlign: "center"
        }}>
          Thank you for signing up for SecureGate. Please click the button below to verify your email address and activate your account. This link will expire in 15 minutes.
        </p>
        
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <a
            href={verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "14px",
              padding: "12px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              transition: "background-color 0.2s"
            }}
          >
            Verify Email
          </a>
        </div>
        
        <div style={{ borderTop: "1px solid #334155", paddingTop: "20px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 8px 0" }}>
            If you did not create a SecureGate account, you can safely ignore this email.
          </p>
          <p style={{ fontSize: "11px", color: "#4B5563", margin: "0" }}>
            SecureGate &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
