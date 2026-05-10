import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eventia.app',
  appName: 'Eventia',
  webDir: 'dist',
  plugins: {
    // Se comenta temporalmente para evitar crash por falta de google-services.json
    /*
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    */
  },
};

export default config;
