import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const define = {
  "import.meta.env.VITE_ADMIN_SLUG": JSON.stringify("admin"),
  "import.meta.env.VITE_API_BASE": JSON.stringify("http://localhost:8080"),
  "import.meta.env.VITE_ERP_API_URL": JSON.stringify("http://localhost:8080/erp"),
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 8080,
    historyApiFallback: true,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:8080',
      },
    },
    setupFiles: ['./src/tests/setup.ts'],
    define,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/tests/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
  },
}));
