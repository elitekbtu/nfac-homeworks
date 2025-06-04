module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#0088cc',
          light: '#54a9eb',
          dark: '#006b53'
        },
        bg: {
          primary: '#ffffff',
          secondary: '#f4f4f5'
        },
        text: {
          primary: '#000000',
          secondary: '#707579'
        },
        border: '#e4e4e7',
        message: {
          out: '#effdde',
          in: '#ffffff'
        }
      }
    },
  },
  plugins: [],
}