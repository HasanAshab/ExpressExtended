"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performance = void 0;
function performance(constructor) {
    const methodNames = Object.getOwnPropertyNames(constructor.prototype);
    for (const methodName of methodNames) {
        const method = constructor.prototype[methodName];
        if (methodName === "constructor" || typeof method !== "function") {
            continue;
        }
        constructor.prototype[methodName] = async function (...args) {
            console.time(`${constructor.name}.${methodName}`);
            const result = await method.apply(constructor, args);
            console.timeEnd(`${constructor.name}.${methodName}`);
            return result;
        };
    }
}
exports.performance = performance;
/*
export function passErrorsToHandler(constructor: Function) {
  const methodNames = Object.getOwnPropertyNames(constructor.prototype);
  for (const methodName of methodNames) {
    const method = constructor.prototype[methodName];
    if (methodName === "constructor" || typeof method !== "function") {
      continue;
    }
    constructor.prototype[methodName] = async function (...args: any[]) {
      try {
        return await method.apply(constructor, args);
      }
      catch (err: any) {
        for (const arg of args) {
          if (typeof arg === "function") {
            arg(err);
            break;
          }
        }
      }
    }
  }
}*/ 
