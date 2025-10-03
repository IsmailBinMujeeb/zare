import chokidar from 'chokidar';
import { Server } from 'http';
import app from '../server.js';
import { logger } from './logger.js';

export function startWatcher(path: string, server: Server) {
  const watcher = chokidar.watch(path, {
    persistent: true,
    usePolling: false,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100,
    },
  });

  watcher
    .on('change', async () => await restartServer(server))
    .on('error', async () => await restartServer(server))
    .on('unlink', async () => await restartServer(server))
    .on('unlinkDir', async () => await restartServer(server));
}

async function restartServer(server: Server) {
  server.close();
  app.listen(app.get('port'), () => {
    logger.info('Server reload');
  });
}
