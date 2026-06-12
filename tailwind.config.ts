import forms from "@tailwindcss/forms";
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"]
      },
      colors: {
        ink: {
          950: "#020617",
          900: "#07111f",
          850: "#091827",
          800: "#0f172a",
          700: "#1e293b"
        },
        signal: {
          blue: "#2563eb",
          cyan: "#22d3ee",
          green: "#34d399"
        }
      },
      boxShadow: {
        glow: "0 0 42px rgba(37, 99, 235, 0.2)",
        panel: "0 22px 60px rgba(0, 0, 0, 0.32)"
      },
      backgroundImage: {
        "radial-blue": "radial-gradient(circle at 18% 14%, rgba(37, 99, 235, 0.22), transparent 32%), radial-gradient(circle at 78% 8%, rgba(34, 211, 238, 0.12), transparent 28%)",
        "grid-lines": "linear-gradient(rgba(148, 163, 184, 0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.055) 1px, transparent 1px)"
      }
    }
  },
  plugins: [forms]
} satisfies Config;
