import Middleware from "illuminate/middlewares/Middleware";
import { Response, NextFunction } from "express";
import { Request } from "types";
import { passErrorsToHandler } from "illuminate/decorators/method";

export default class CheckIfTheUserIsAdmin extends Middleware {
  @passErrorsToHandler()
  handle(req: Request, res: Response, next: NextFunction) {
    if(req.user?.isAdmin){
      next();
    }
    res.status(401).json({
      message: "Only admin can perform this action!"
    });
  }
}