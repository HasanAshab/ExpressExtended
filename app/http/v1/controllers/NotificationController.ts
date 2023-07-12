import { Request } from "express";


import User from "app/models/User";
import Notification from "app/models/Notification";
export default class NotificationController {
  async index(req: Request) {
    return await req.user!.notifications.paginateReq(req);
  }
  
  async markAsRead(req: Request) {
   return await req.user!.unreadNotifications.markAsRead(req.params.id)
    ? {
      status: 200, 
      message: 'Notification marked as read'
    }    
    : {status: 404}
  }
  
  async unreadCount(req: Request) {
    return { count: await req.user!.unreadNotifications.count() };
  }
  
  async delete(req: Request) {
    await req.user!.notifications.where("_id").equals(req.params.id).deleteOne();
    return {status: 204};
  }
}
