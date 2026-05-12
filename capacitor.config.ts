import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eventia.app',
  appName: 'Eventia',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
    allowMixedContent: false,
    captureInput: true,
    useLegacyBridge: false,
  },
  ios: {
    contentInset: 'always',
    scrollEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 300,
      launchAutoHide: true,
      backgroundColor: '#ffffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff',
      overlaysWebView: false,
    },
  },
};

export default config;
