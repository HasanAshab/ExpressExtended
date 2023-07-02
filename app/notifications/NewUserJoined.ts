import { Document } from "mongoose";
import Notification from "illuminate/notifications/Notification";
import NewUserJoinedMail from "app/mails/NewUserJoinedMail";

export default class NewUserJoined extends Notification {
  shouldQueue = true;
  
  via(notifiable: Document){
    return ["database", "mail"];
  }
  
  toMail(notifiable: Document) {
    return new NewUserJoinedMail({user: this.data.user});
  }
  
  toDatabase(notifiable: Document) {
    return {user: this.data.user}
  }
}