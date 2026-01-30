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
          primary: "#1a2332",
          secondary: "#1f2b3d",
          card: "#243044",
          elevated: "#2b3e50",
        },
        cmg: {
          blue: "#9bc53d",
          navy: "#2b3e50",
          gold: "#d4a843",
          light: "#b4d95e",
          deep: "#8ab62f",
          glow: "rgba(155, 197, 61, 0.15)",
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
          cmg: "rgba(155, 197, 61, 0.3)",
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
          "0%, 100%": { boxShadow: "0 0 20px rgba(155, 197, 61, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(155, 197, 61, 0.5)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 15px rgba(155, 197, 61, 0.3), 0 0 30px rgba(155, 197, 61, 0.1)",
            borderColor: "rgba(155, 197, 61, 0.4)"
          },
          "50%": {
            boxShadow: "0 0 25px rgba(155, 197, 61, 0.5), 0 0 50px rgba(155, 197, 61, 0.2)",
            borderColor: "rgba(155, 197, 61, 0.7)"
          },
        },
        "pulse-glow-blue": {
          "0%, 100%": {
            boxShadow: "0 0 12px rgba(59, 130, 246, 0.4), 0 0 24px rgba(59, 130, 246, 0.15)",
          },
          "50%": {
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.25)",
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
        "pulse-glow-blue": "pulse-glow-blue 2s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cmg-gradient": "linear-gradient(135deg, #9bc53d 0%, #8ab62f 50%, #2b3e50 100%)",
        "dark-gradient": "linear-gradient(180deg, #1a2332 0%, #1f2b3d 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
