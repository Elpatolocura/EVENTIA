import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase';

export class NotificationsService {
  static async initialize() {
    if (Capacitor.getPlatform() === 'web') return;

    // Request permission to use push notifications
    // iOS will prompt a user at this point, Android will just return 'granted'
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      throw new Error('User denied permissions!');
    }

    // Register with Apple / Google to receive push via APNS/FCM
    await PushNotifications.register();

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      await this.saveToken(token.value);
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push received: ' + JSON.stringify(notification));
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Push action performed: ' + JSON.stringify(action));
      const data = action.notification.data;
      if (data.url) {
        window.location.href = data.url;
      }
    });
  }

  private static async saveToken(token: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // We store the token in a 'profiles' or 'user_push_tokens' table
    // For this example, assuming a column 'fcm_token' in 'profiles'
    const { error } = await supabase
      .from('profiles')
      .update({ fcm_token: token, last_seen: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      console.error('Error saving push token to Supabase:', error);
    }
  }

  static async removeToken() {
    if (Capacitor.getPlatform() === 'web') return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ fcm_token: null })
      .eq('id', user.id);

    await PushNotifications.removeAllListeners();
  }
}
