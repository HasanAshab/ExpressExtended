import { middleware, controller } from "helpers";
import express, { Router } from "express";

const router: Router = express.Router();
const NotificationController = controller("NotificationController");

// Endpoints for notification

router.use(middleware("auth"))
router.get("/", NotificationController.index);
router.get("/unread-count", NotificationController.unreadCount);

router.route("/:id")
  .get(NotificationController.find)
  .delete(NotificationController.delete);

export default router;
