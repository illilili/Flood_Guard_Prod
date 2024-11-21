const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      "/api": {
        target: "https://flood-guard-back.onrender.com", // 백엔드 서버 주소
        changeOrigin: true,
        logLevel: "debug", // 디버그 로그 활성화
        //https: true,
        key: "./path/to/server.key",
        cert: "./path/to/server.crt",
      },
    },
  },
});
