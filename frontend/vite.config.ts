import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Served under https://<user>.github.io/caste-trends-india/ on GitHub Pages
  base: "/caste-trends-india/",
});
