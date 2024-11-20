import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tailwindcss from 'tailwindcss';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { legacyHandler } from './legacy-handler';

export default defineConfig({
  plugins: [
    ViteEjsPlugin((viteConfig) => ({
      // viteConfig is the current Vite resolved config
      env: viteConfig.env,
    })),
    react(),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, './legacy') + '/[!.]*',
          dest: './legacy',
        },
      ],
    }),
    {
      name: 'legacy-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          legacyHandler(__dirname, req, res, next);
        });
      },
    },
    // Put the Sentry vite plugin after all other plugins
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      // Auth tokens can be obtained from https://sentry.io/orgredirect/organizations/:orgslug/settings/auth-tokens/
      authToken: process.env.SENTRY_AUTH_TOKEN,
      reactComponentAnnotation: { enabled: true },
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 4201,
    headers: {
      'Document-Policy': 'js-profiling',
    },
  },
});
