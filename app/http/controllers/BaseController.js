class BaseController {
  static wrapMethods = (cls) => {
    const methods = Object.getOwnPropertyNames(cls);
    //console.log(methods)
    for (const method of methods) {
      if(!['length', 'name', 'prototype'].includes(method)){
        cls[method] = this.withTryCatch(cls[method]);
      }
    }
  }
  
  static withTryCatch = (fn) => {
    return async function(...args) {
      try {
        return await fn(...args);
      }
      catch (err) {
        args[2](err)
      }
    }
  }
}


module.exports = BaseController;