import Middleware from "illuminate/middlewares/Middleware";
import { Request, Response, NextFunction } from "express";
import { log } from "helpers";

export default class ErrorHandler extends Middleware {
  handle(err: any, req: Request, res: Response, next:NextFunction) {
    const status = err.status ?? err.statusCode ?? 500;
    const message = err.message ?? "Internal server error!";
    if(status === 500){
      log(`${Date.now()}\n${req.originalUrl} - ${req.method} - ${req.ip}\nStack: ${err.stack}`);
      if(process.env.NODE_ENV === "production") res.status(status).json({message: "Internal server error!" });
      else res.status(status).json({error: err.stack});
    }
    else res.status(status).json({message});
  };
}