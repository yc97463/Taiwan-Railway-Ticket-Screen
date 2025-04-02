import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'roboto': ['var(--font-roboto)'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        tr: {
          blue: "#0068b7",
          orange: "#f29600",
          yellow: "#FFC600",
          "yello-dark": "#E6A500",
        }
      },
    },
  },
  plugins: [],
};
export default config;
