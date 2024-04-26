const { defineConfig } = require("@vue/cli-service");
const path = require("path");

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"), // Puntare alla cartella src
        "@/firebase": path.resolve(__dirname, "firebase.js"), // Puntare al file firebase.js nella root
      },
    },
  },
});
