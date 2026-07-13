import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署时需要设置 base
  // 如果部署到 https://<username>.github.io/<repo>/ 则 base: "/<repo>/"
  // 如果部署到自定义域名或根路径，则 base: "/englearn/"
  base: "/englearn/",
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  server: {
    port: 3000,
    open: true,
  },
});
