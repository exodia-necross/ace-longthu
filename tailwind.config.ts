import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        court: {
          blue: "#0d5fd7",
          green: "#10a56b",
          ink: "#102033",
          lime: "#b6f264"
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        mutedForeground: "hsl(var(--muted-foreground))"
      },
      boxShadow: {
        glow: "0 18px 60px rgba(13, 95, 215, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
