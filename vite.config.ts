import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json' with { type: 'json' };

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const outputDirectory = isProduction ? 'dist-production' : 'dist-dev';

  return {
    plugins: [
      crx({ manifest }),
    ],
    build: {
      // Указываем Vite, куда складывать файлы
      outDir: outputDirectory,
      // Опционально: очищать папку перед сборкой (рекомендуется)
      emptyOutDir: true, 
    }
  };
});
