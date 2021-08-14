const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  purge: ["./app/**/*.{js,jsx,ts,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      gridTemplateColumns: {
        "fill-40": "repeat(auto-fill, 10rem)"
      },
      colors: {
        brand: "#15E269"
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans]
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" }
        },
        mypulse: {
          "0%": { transform: "scale3d(1, 1, 1)" },
          "50%": { transform: "scale3d(1.5, 1.5, 1.5)" },
          "100%": { transform: "scale3d(1, 1, 1)" }
        },
        radar: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "25%": { transform: "scale(0)", opacity: "0.5" },
          "50%": { transform: "scale(1)", opacity: "1" },
          "75%": { transform: "scale(1.5)", opacity: "0.5" },
          "100%": { transform: "scale(2)", opacity: "0" }
        }
      }
    }
  },
  variants: {},
  plugins: []
};
