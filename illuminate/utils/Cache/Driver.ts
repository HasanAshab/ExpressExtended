import { checkProperties } from "helpers";
import { CacheDataArg } from "types";

export default abstract class Driver {
  abstract get(key: string): Promise<string | null> | string | null;
  abstract put(key: string, data: CacheDataArg, expiry?: number): Promise<void> | void;
  abstract clear(): Promise<void> | void;
  
  static isDriver(target: object): target is Driver {
    return checkProperties(target, {
      get: "function", 
      put: "function",
      clear: "function",
    });
  }
}