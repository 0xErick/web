import path from "path";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), basicSsl()],
  resolve: {
    alias: {
      "@": path.resolve(path.resolve(), "src"), // 路径别名
    },
    extensions: [".js", ".json", ".ts"], // 使用路径别名时想要省略的后缀名，可以自己 增减
  },
  server: {
    host: "0.0.0.0",
    https: true, //不开https walletconnect 无法连接
  },
});
