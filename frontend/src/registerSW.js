import { registerSW } from 'virtual:pwa-register';

export function setupPWA(onNeedRefresh, onOfflineReady) {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (onNeedRefresh) onNeedRefresh(updateSW);
    },
    onOfflineReady() {
      if (onOfflineReady) onOfflineReady();
    },
  });
}
