import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

function legalPagePaths() {
  return {
    name: "legal-page-paths",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [pathname, query] = (req.url || "").split("?");
        const suffix = query ? `?${query}` : "";
        if (pathname === "/privacy-policy" || pathname === "/privacy-policy/") {
          req.url = `/privacy-policy/index.html${suffix}`;
        } else if (pathname === "/delete-account" || pathname === "/delete-account/") {
          req.url = `/delete-account/index.html${suffix}`;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    legalPagePaths(),
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8787',
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
