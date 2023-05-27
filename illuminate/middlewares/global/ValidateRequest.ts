import Middleware from "illuminate/middlewares/Middleware";
import { Request, Response, NextFunction } from "express";
import { passErrorsToHandler } from "illuminate/decorators/method";
import { base, log } from "helpers";
import path from "path";

export default class ValidateRequest extends Middleware {
  @passErrorsToHandler()
  handle(req: Request, res: Response, next: NextFunction){
    const [version, validationSubPath] = this.options;
    try {
      const Schema = require(base(path.join(`app/http/${version}/validations/`, validationSubPath)));
      var ValidationSchema = Schema.default;
    } catch(err: any) {
      if (err.code === "MODULE_NOT_FOUND") return next();
      else throw err;
    }
    const urlencoded = ValidationSchema.urlencoded;
    const multipart = ValidationSchema.multipart;
    const target = req[urlencoded.target as "body" | "params" | "query"];
    
    if (typeof multipart !== "undefined") {
      const contentType = req.headers["content-type"];
      if (!contentType || !contentType.startsWith("multipart/form-data")) {
        res.status(400).api({
          message: "Only multipart/form-data requests are allowed",
        });
      }
      const error = multipart.validate(req.files);
      if (error) {
        res.status(400).api({
          message: error,
        });
      }
    }
    
    if (typeof urlencoded !== "undefined") {
      const { error } = urlencoded.rules.validate(target);
      if (error) {
        res.status(400).api({
          message: error.details[0].message,
        });
      }
    }
    if (!res.headersSent) {
      req.validated = target;
      next();
    }
  }
  
}