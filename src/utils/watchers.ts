export const createWatcherController = () => {
  const watchSkippers: Partial<Record<string, number>> = {};

  const skipWatcher = (watcher: string, durationMs = 10) => {
    watchSkippers[watcher] = Date.now() + durationMs;
  };

  const unskipWatcher = (watcher: string) => {
    delete watchSkippers[watcher];
  };

  const handleWatcher = (watcher: string, handler: Function) => {
    if (watcher in watchSkippers) {
      const dateTime = watchSkippers[watcher] as number;
      if (Date.now() < dateTime) return;
      delete watchSkippers[watcher];
    }
    handler();
  };

  return { skipWatcher, unskipWatcher, handleWatcher };
};

const defaultController = createWatcherController();

export const { skipWatcher, unskipWatcher, handleWatcher } = defaultController;
