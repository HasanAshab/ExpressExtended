import { Request } from "express";


import User from "app/models/User";
import Notification from "app/models/Notification";
export default class NotificationController {
  async index(req: Request) {
    //await req.user!.markNotificationsAsRead();
    //const ns = await user.notifications.paginate(8, req.query.cursor);
    //console.log(ns.docs.map(n => n.createdAt))
    return await User.find().paginateReq(req)
    return { notifications: await req.user!.notifications.paginate(10, req.query.cursor)};
  }
  
  async unreadCount(req: Request) {
    return { count: await req.user!.unreadNotifications.count() };
  }
  
  async delete(req: Request) {
    await req.user!.notifications.where("_id").equals(req.params.id).deleteOne();
    return {status: 204};
  }
}

