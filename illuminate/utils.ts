import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { EndpointCallback } from "types";

export function passErrorsToHandler(fn: Function): Function {
  if (fn.length === 4) {
    return async function (err: any, req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        await fn(err, req, res, next);
      } catch (err: any) {
        next(err);
      }
    };
  }
  return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await fn(req, res, next);
    } catch (err: any) {
      next(err);
    }
  };
  /*  
  return async function (...args) {
    try {
      await fn(...args);
    } catch (err) {
      args[fn.length - 1](err);
    }
  };
  */
};

export function generateEndpointsFromDirTree(rootPath: string, cb: EndpointCallback): void {
  const stack = [rootPath];
  while (stack.length > 0) {
    const currentPath = stack.pop();
    if(!currentPath){
      break;
    }
    const items = fs.readdirSync(currentPath);
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const status = fs.statSync(itemPath);

      if (status.isFile()) {
        const itemPathEndpoint = itemPath
          .replace(rootPath, "")
          .split(".")[0]
          .toLowerCase();
        cb(itemPathEndpoint, itemPath);
      } else if (status.isDirectory()) {
        stack.push(itemPath);
      }
    }
  }
}