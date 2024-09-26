/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Montserrat', 'Arial', 'Helvetica', 'sans-serif'],
        'mono': ['Montserrat', 'Arial', 'Helvetica', 'sans-serif'],
      },
      spacing: {
        '3px': '60px',
        '4px': '80px',
        '5px': '100px',
      },
      maxWidth: {
        'wrapper': '2000px',
      },
      padding: {
        'wrapper': '24px',
      },
    },
  },
  plugins: [],
}

