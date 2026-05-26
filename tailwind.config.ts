import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        page: "var(--surface-primary)",
        card: "var(--surface-card)",
        border: "var(--surface-border)",
        heading: "var(--texts-heading)",
        muted: "var(--texts-muted)",
        link: "var(--text-link)",
        brand: {
          primary: "var(--brand-primary)",
          hover: "var(--brand-primary-hover)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
