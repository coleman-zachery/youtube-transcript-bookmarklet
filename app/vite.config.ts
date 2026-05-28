import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {
  bookmarkletInputPath,
  buildBookmarklet,
} from './scripts/build-bookmarklet.mjs';

function bookmarkletPlugin() {
  const watchedFile = path.resolve(bookmarkletInputPath);

  return {
    name: 'bookmarklet-generator',
    async buildStart() {
      await buildBookmarklet();
    },
    configureServer(server) {
      const rebuildBookmarklet = async (file: string) => {
        if (path.resolve(file) !== watchedFile) {
          return;
        }

        try {
          await buildBookmarklet();
          server.ws.send({ type: 'full-reload' });
        } catch (error) {
          server.config.logger.error(
            error instanceof Error ? error.message : String(error)
          );
        }
      };

      server.watcher.add(watchedFile);
      server.watcher.on('change', rebuildBookmarklet);

      server.httpServer?.once('close', () => {
        server.watcher.off('change', rebuildBookmarklet);
      });
    },
  };
}

export default defineConfig({
  base: '/youtube-transcript-bookmarklet/',
  plugins: [react(), bookmarkletPlugin()],
});
