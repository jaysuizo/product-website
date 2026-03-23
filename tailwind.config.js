/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cloud: {
          50: "#f6f9ff",
          100: "#eaf1ff",
          200: "#d3e4ff",
          300: "#abcafc",
          500: "#4d8ef7",
          700: "#1f4ea3",
          900: "#16284f"
        }
      },
      boxShadow: {
        card: "0 14px 34px rgba(22, 40, 79, 0.12)",
        float: "0 24px 42px rgba(35, 79, 153, 0.24)"
      },
      borderRadius: {
        "2xl": "1.2rem",
        "3xl": "1.6rem"
      }
    }
  },
  plugins: []
};
