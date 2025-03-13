module.exports = {
  content: ["./*.html", "./pages/**/*.html"], 
  theme: {
    extend: {
      colors: {
        Orange: "#ff8533",
        Red: "#d62300",
        Brown: "#502314",
        "light-brown":"#f7eacf"
      },
    },
  },
  plugins: [
    function ({ addComponents }) { 
      addComponents({
        ".layout-container": {
          marginLeft: "auto",
          marginRight: "auto",
          width: "95%",
          "@screen md": {
            width: "95%",
          },
          "@screen lg": {
            width: "90%",
          },
          "@screen xl": {
            width: "85%",
          },
        },
      });
    },
  ],
};
