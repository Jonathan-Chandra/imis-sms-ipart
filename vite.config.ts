import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudPathRewrite } from './vite-build-cloud-extension';
import { name } from './package.json';


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isLocal = mode === 'development';
  const imisBase = env.VITE_IMIS_BASE_URL ?? '';
  const devProxyFallback = 'http://localhost';

  return {
    plugins: [react(),
      !isLocal && cloudPathRewrite({ projectName: name }),
    ],
    server: {
      proxy: {
        '/api': {
          target: imisBase || devProxyFallback,
          changeOrigin: true,
          secure: false,
        },
        '/token': {
          target: imisBase.replace('/token', '') || devProxyFallback,
          changeOrigin: true,
          secure: false,
        },
        '/auth/token': {
          target: env.VITE_AIRFLOW_BASE_URL || devProxyFallback,
          changeOrigin: true,
          secure: false
        }
      },
    },
  };
});