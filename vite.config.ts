import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudPathRewrite } from './vite-build-cloud-extension';
import { name } from './package.json';


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isLocal = mode === 'development';

  return {
    plugins: [react(),
      !isLocal && cloudPathRewrite({ projectName: name }),
    ],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_IMIS_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/token': {
          target: env.VITE_IMIS_BASE_URL.replace('/token', ''),
          changeOrigin: true,
          secure: false,
        },
        '/auth/token': {
          target: env.VITE_AIRFLOW_BASE_URL,
          changeOrigin: true,
          secure: false
        }
      },
    },
  };
});