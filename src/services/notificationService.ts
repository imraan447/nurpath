import { Capacitor } from '@capacitor/core';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';

// Prayer names for display
const PRAYER_NAMES: Record<string, string> = {
    Fajr: 'Fajr',
    Sunrise: 'Sunrise',
    Dhuhr: 'Dhuhr',
    Asr: 'Asr',
    Maghrib: 'Maghrib',
    Isha: 'Isha',
};

/**
 * Request notification permissions (web + native)
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
        const result = await LocalNotifications.requestPermissions();
        return result.display === 'granted';
    } else {
        // Web Notifications API
        if (!('Notification' in window)) return false;
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
}

/**
 * Schedule prayer time notifications for the day
 * @param prayerTimes - Object with prayer names as keys and "HH:MM" as values
 * @param minutesBefore - How many minutes before the prayer to notify (default: 10)
 */
export async function schedulePrayerNotifications(
    prayerTimes: Record<string, string>,
    minutesBefore: number = 10
): Promise<void> {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Build notification list
    const notifications: Array<{
        id: number;
        title: string;
        body: string;
        scheduledAt: Date;
    }> = [];

    let idCounter = 1;

    for (const [prayerKey, timeStr] of Object.entries(prayerTimes)) {
        if (!timeStr || !PRAYER_NAMES[prayerKey]) continue;

        const [hours, minutes] = timeStr.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) continue;

        const prayerTime = new Date(today);
        prayerTime.setHours(hours, minutes, 0, 0);

        // Notification time = prayer time - minutesBefore
        const notifyTime = new Date(prayerTime.getTime() - minutesBefore * 60 * 1000);

        // Only schedule if in the future
        if (notifyTime > now) {
            notifications.push({
                id: idCounter++,
                title: `${PRAYER_NAMES[prayerKey]} in ${minutesBefore} minutes`,
                body: `Time to prepare for ${PRAYER_NAMES[prayerKey]} prayer. Make wudhu and head to the musallah.`,
                scheduledAt: notifyTime,
            });
        }
    }

    if (notifications.length === 0) return;

    if (Capacitor.isNativePlatform()) {
        // Cancel previous notifications first
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
            await LocalNotifications.cancel(pending);
        }

        // Schedule new ones
        const scheduleOptions: ScheduleOptions = {
            notifications: notifications.map(n => ({
                id: n.id,
                title: n.title,
                body: n.body,
                schedule: { at: n.scheduledAt },
                smallIcon: 'ic_launcher',
                sound: 'default',
            })),
        };
        await LocalNotifications.schedule(scheduleOptions);
    } else {
        // Web: use setTimeout to trigger Web Notifications at the right time
        for (const n of notifications) {
            const delay = n.scheduledAt.getTime() - Date.now();
            if (delay > 0) {
                setTimeout(() => {
                    new Notification(n.title, {
                        body: n.body,
                        icon: '/images/nurpath-icon.png',
                    });
                }, delay);
            }
        }
    }
}
