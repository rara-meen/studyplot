/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light (default) surfaces
        surface: {
          DEFAULT: "#FFFFFF",
          card: "#FFFFFF",
          subtle: "#F5F5F7",
        },
        // Neutral dark-mode surfaces (avoid pure black and blue tint)
        night: {
          DEFAULT: "#171717",
          soft: "#17171780",
          card: "#1E1E1E",
          raised: "#262626",
        },
        border: {
          DEFAULT: "#E5E5E7",
          hover: "#D4D4D8",
          dark: "rgba(255, 255, 255, 0.09)",
          "dark-hover": "rgba(255, 255, 255, 0.16)",
        },
        ink: {
          DEFAULT: "#18181B",
          muted: "#6B7280",
          faint: "#9CA3AF",
          dark: "#E4E4E7",
          "dark-muted": "#A1A1AA",
          "dark-faint": "#71717A",
        },
        brand: {
          primary: "#4F46E5",
          "primary-hover": "#4338CA",
          secondary: "#6366F1",
          accent: "#4F46E5",
        },
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",

        // --- Backward-compatible aliases ---
        // Some pages still reference these older token names; aliasing them
        // to the current palette keeps every screen visually consistent.
        base: {
          DEFAULT: "#FFFFFF",
          soft: "#F5F5F7",
          raised: "#FFFFFF",
        },
        accent: {
          blue: "#3B82F6",
          cyan: "#0EA5E9",
          purple: "#7C6FEA",
        },
      },
      fontFamily: {
        display: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        body: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 2px 4px rgba(15, 23, 42, 0.05), 0 8px 16px -4px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        xl2: "1rem",
        xl3: "1.25rem",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: 0.6 },
          "50%": { opacity: 1 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        "fade-up": "fade-up 0.35s ease-out both",
      },
      transitionDuration: {
        250: "250ms",
      },
    },
  },
  plugins: [],
};
