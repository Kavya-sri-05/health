/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    safelist: [
      {
        pattern: /bg-(red|blue|green|yellow|purple|pink|indigo|gray|amber|orange|emerald|teal)-(50|100|200|300|400|500|600|700|800|900)/,
      },
      {
        pattern: /text-(red|blue|green|yellow|purple|pink|indigo|gray|amber|orange|emerald|teal)-(50|100|200|300|400|500|600|700|800|900)/,
      },
      {
        pattern: /border-(red|blue|green|yellow|purple|pink|indigo|gray|amber|orange|emerald|teal)-(50|100|200|300|400|500|600|700|800|900)/,
      },
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }