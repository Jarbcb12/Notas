/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f9f8",
          100: "#dfeeea",
          200: "#b8ddd3",
          300: "#8ac5b6",
          400: "#59aa97",
          500: "#2f8b78",
          600: "#206d5f",
          700: "#1c584d",
          800: "#1b463e",
          900: "#183a34"
        },
        ink: "#08111f",
        panel: "#0f1c2f"
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 50px rgba(8, 17, 31, 0.18)"
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top left, rgba(47,139,120,0.28), transparent 35%), radial-gradient(circle at bottom right, rgba(250,204,21,0.18), transparent 25%)"
      }
    }
  },
  plugins: []
};
