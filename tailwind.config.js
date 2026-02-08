/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                admin: {
                    dark: '#0B1120', // Deep Navy / Slate 950
                    card: '#1e293b', // Slate 800
                    border: 'rgba(255, 255, 255, 0.08)',
                    text: {
                        main: '#ffffff',
                        muted: '#94a3b8', // Slate 400
                    }
                },
                brand: {
                    cyan: {
                        DEFAULT: '#06b6d4', // Cyan 500
                        hover: '#0891b2',   // Cyan 600
                        light: '#22d3ee',   // Cyan 400
                        dim: 'rgba(6, 182, 212, 0.1)',
                    },
                    orange: {
                        DEFAULT: '#f97316', // Orange 500
                        hover: '#ea580c',   // Orange 600
                        light: '#fb923c',   // Orange 400
                        dim: 'rgba(249, 115, 22, 0.1)',
                    }
                }
            }
        },
    },
    plugins: [],
}
