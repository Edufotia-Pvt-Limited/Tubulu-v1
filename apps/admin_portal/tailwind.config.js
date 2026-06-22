export default {
  content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
      extend: {
          colors: {
              text: {
                  50: '#919EAB',
                  100: '#637381',
                  200: '#161C24'
              },
              background: {
                  500: '#36F'
              }
          }
      },
  },
  plugins: [],
}