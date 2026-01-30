/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2563eb', // Medical Blue
                secondary: '#64748b',
                background: '#f8fafc',
                surface: '#ffffff',
            }
        },
    },
    plugins: [],
}
