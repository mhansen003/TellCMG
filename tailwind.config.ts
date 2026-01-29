import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a1628",
          secondary: "#0f1f38",
          card: "#162a4a",
          elevated: "#1e3a5f",
        },
        cmg: {
          blue: "#2563eb",
          navy: "#1e3a5f",
          gold: "#d4a843",
          light: "#e8c87a",
          deep: "#1e40af",
          glow: "rgba(37, 99, 235, 0.15)",
        },
        accent: {
          purple: "#a855f7",
          blue: "#3b82f6",
          teal: "#14b8a6",
          green: "#22c55e",
          rose: "#f43f5e",
        },
        text: {
          primary: "#f0f4f8",
          secondary: "#94a3b8",
          muted: "#64748b",
        },
        border: {
          subtle: "rgba(148, 163, 184, 0.1)",
          cmg: "rgba(37, 99, 235, 0.3)",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      keyframes: {
        pulse_ring: {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
        fade_in: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(37, 99, 235, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(37, 99, 235, 0.5)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 15px rgba(37, 99, 235, 0.3), 0 0 30px rgba(37, 99, 235, 0.1)",
            borderColor: "rgba(37, 99, 235, 0.4)"
          },
          "50%": {
            boxShadow: "0 0 25px rgba(37, 99, 235, 0.5), 0 0 50px rgba(37, 99, 235, 0.2)",
            borderColor: "rgba(37, 99, 235, 0.7)"
          },
        },
      },
      animation: {
        pulse_ring: "pulse_ring 1.5s ease-out infinite",
        fade_in: "fade_in 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cmg-gradient": "linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #1e3a5f 100%)",
        "dark-gradient": "linear-gradient(180deg, #0a1628 0%, #0f1f38 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
