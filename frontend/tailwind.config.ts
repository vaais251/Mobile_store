import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: "1rem",
                sm: "1.5rem",
                lg: "2rem",
            },
            screens: {
                sm: "640px",
                md: "768px",
                lg: "1024px",
                xl: "1280px",
            },
        },
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#007AFF",
                    50: "#E5F2FF",
                    100: "#CCE4FF",
                    200: "#99CAFF",
                    300: "#66AFFF",
                    400: "#3395FF",
                    500: "#007AFF",
                    600: "#0062CC",
                    700: "#004999",
                    800: "#003166",
                    900: "#001833",
                },
                secondary: {
                    DEFAULT: "#F5F5F7",
                    50: "#FFFFFF",
                    100: "#FAFAFE",
                    200: "#F5F5F7",
                    300: "#E8E8ED",
                    400: "#D2D2D7",
                    500: "#AEAEB2",
                    600: "#8E8E93",
                    700: "#636366",
                    800: "#48484A",
                    900: "#1C1C1E",
                },
                accent: {
                    DEFAULT: "#FF3B30",
                    50: "#FFF0EF",
                    100: "#FFD4D1",
                    200: "#FFA9A3",
                    300: "#FF7D75",
                    400: "#FF5247",
                    500: "#FF3B30",
                    600: "#E6352B",
                    700: "#CC2F26",
                    800: "#B32921",
                    900: "#80150F",
                },
                success: {
                    DEFAULT: "#34C759",
                    50: "#E8FAE7",
                    500: "#34C759",
                    700: "#248A3D",
                },
                warning: {
                    DEFAULT: "#FF9500",
                    50: "#FFF4E5",
                    500: "#FF9500",
                    700: "#C67A00",
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
            },
            borderRadius: {
                "2xl": "1rem",
                "3xl": "1.25rem",
                "4xl": "1.5rem",
            },
            boxShadow: {
                premium:
                    "0 4px 24px -1px rgba(0, 0, 0, 0.06), 0 2px 8px -1px rgba(0, 0, 0, 0.04)",
                "premium-lg":
                    "0 8px 40px -4px rgba(0, 0, 0, 0.08), 0 4px 16px -2px rgba(0, 0, 0, 0.04)",
                "premium-xl":
                    "0 16px 64px -8px rgba(0, 0, 0, 0.10), 0 8px 24px -4px rgba(0, 0, 0, 0.05)",
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-out",
                "slide-up": "slideUp 0.4s ease-out",
                "scale-in": "scaleIn 0.2s ease-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(12px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                scaleIn: {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
