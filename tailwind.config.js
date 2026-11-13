/** @type {import('tailwindcss').Config} */
// Palette shared with the pitch deck. Text pairings used on the site:
//   ink #1C1517 on white/mist        > 15:1
//   muted #6B6164 on white / mist    5.9:1 / 5.4:1
//   blood #C8102E on white           5.9:1   (white on blood: 5.9:1)
//   safe-text #23654A on white       7.0:1
//   warn-text #8A5300 on white       6.3:1   (amber itself is a fill, never text on white)
//   white / rose on night #2A0710    > 15:1 / 11:1
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: "#2A0710",
        burgundy: "#5A0F1E",
        plum: "#43101B",
        blood: "#C8102E",
        "blood-dark": "#A00C24",
        amber: "#E0A030",
        "warn-text": "#8A5300",
        "warn-bg": "#FDF3E1",
        safe: "#2E7D5B",
        "safe-text": "#23654A",
        "safe-bg": "#E8F3EE",
        "blood-bg": "#FBEAED",
        ink: "#1C1517",
        muted: "#6B6164",
        mist: "#F6F2F2",
        line: "#E7DFE0",
        rose: "#E9CDD2",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      maxWidth: { page: "72rem" },
      keyframes: {
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(200,16,46,0.45)" },
          "70%": { boxShadow: "0 0 0 10px rgba(200,16,46,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(200,16,46,0)" },
        },
      },
      animation: { "pulse-ring": "pulse-ring 2.2s cubic-bezier(0.4,0,0.6,1) infinite" },
    },
  },
  plugins: [],
};
