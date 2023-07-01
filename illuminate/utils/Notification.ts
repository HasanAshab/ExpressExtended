import Queue from "illuminate/queue/Queue";
import NotificationData from "illuminate/notifications/Notification";
import {
  INotifiable
} from "app/plugins/Notifiable";
import {
  log,
  capitalizeFirstLetter
} from "helpers";
import {
  Document
} from "mongoose";

export default class Notification {
  static async send(notifiables: Document | Document[], notification: NotificationData) {
    notifiables = Array.isArray(notifiables) ? notifiables: [notifiables];
    for (const notifiable of notifiables) {
      const channels = notification.via(notifiable);
      for (const channel of channels) {
        const handlerName = "send" + capitalizeFirstLetter(channel) as keyof typeof notification;
        if (typeof notification[handlerName] === "function") {
          if (notification.shouldQueue) {
            const method = (notification[handlerName] as any).bind(notification);
            Queue.set(channel, method, notification.concurrency[channel]).add(notifiable, { delay: 0 });
          } else await (notification[handlerName] as any)(notifiable);
        }
      }
    }
  }
}