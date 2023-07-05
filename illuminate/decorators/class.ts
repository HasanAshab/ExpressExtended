export function performance(constructor: Function) {
  const methodNames = Object.getOwnPropertyNames(constructor.prototype);
  for (const methodName of methodNames) {
    const method = constructor.prototype[methodName];
    if (methodName === "constructor" || typeof method !== "function") {
      continue;
    }
    constructor.prototype[methodName] = async function (...args: any[]): Promise < void > {
      console.time(`${constructor.name}.${methodName}`)
      const result = await method.apply(constructor, args);
      console.timeEnd(`${constructor.name}.${methodName}`)
      return result;
    }
  }
}

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
}


export function convertToMockable(mockClass: any) {
  return function(targetClass: any) {
    const staticMethods = Object.getOwnPropertyNames(mockClass).filter(
      (method) =>
      method !== 'constructor' &&
      method !== 'length' &&
      method !== 'name' &&
      method !== 'prototype'
    );
    staticMethods.forEach((method) => {
      if (targetClass[method]) {
        const realMethod = targetClass[method];
        targetClass[method] = function (...args: any[]) {
          return this.isMocked ? mockClass[method].apply(this, args) : realMethod.apply(this, args);
        };
      } else {
        targetClass[method] = mockClass[method];
      }
    });
  };
}
