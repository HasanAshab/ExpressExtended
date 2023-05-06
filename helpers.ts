import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import urls from 'register/urls';
import Middlewares from 'register/middlewares';

export default {
  
  base: (base_path: string = ''): string => {
    return path.join(__dirname, base_path);
  },
  
  isClass: (target: any): boolean => {
    return typeof target === 'function' && /^\s*class\s+/.test(target.toString());
  },

  isObject: (target: any): boolean => {
    return typeof target === 'object' && target !== null && !Array.isArray(target);
  },

  capitalizeFirstLetter: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  url: (url_path: string = ''): string => {
    const domain = process.env.APP_DOMAIN;
    const port = process.env.APP_PORT;
    const protocol = 'http';
    //const protocol = port === '443'? 'https' : 'http';
    return `${protocol}://${path.join(`${domain}:${port}`, url_path)}`;
  },

  clientUrl: (url_path: string = ''): string => {
    const domain = process.env.CLIENT_DOMAIN;
    const port = process.env.CLIENT_PORT;
    const protocol = 'http';
    //const protocol = port === '443'? 'https' : 'http';
    return `${protocol}://${path.join(`${domain}:${port}`, url_path)}`;
  },

  route: (name: string, data: {
    [key: string]: any
  } = {}): string | null => {
    let endpoint = urls[name];
    if (!endpoint) {
      return null;
    }
    if (Object.keys(data).length !== 0) {
      const regex = /:(\w+)/g;
      const params = endpoint.match(regex);
      if (params) {
        for (const param of params) {
          endpoint = endpoint.replace(param, data[param.slice(1)])
        }
      }
    }
    return `${process.env.APP_URL}${endpoint}`;
  },

  storage: (storage_path: string = ''): string => {
    return path.join(__dirname, path.join('storage', storage_path));
  },

  middleware: (keys: string | string[]): Function | Function[] => {
    function getMiddleware(middlewarePath: string, options: string[] = []) {
      const MiddlewareClass = require(path.join(__dirname, middlewarePath));
      return new MiddlewareClass(options).handle;
    }
    if (Array.isArray(keys)) {
      const middlewares = [];
      for (const key of keys) {
        const [name,
          params] = key.split(':');
        const middlewarePaths = Middlewares[name];
        if (Array.isArray(middlewarePaths)) {
          const funcBasedParams = params?.split('|')
          for (let i = 0; i < middlewarePaths.length; i++) {
            const middleware = getMiddleware(middlewarePaths[i], funcBasedParams?.[i]?.split(','));
            middlewares.push(middleware);
          }
        } else {
          const middleware = getMiddleware(middlewarePaths, params?.split(','));
          middlewares.push(middleware);
        }
      }
      return middlewares;
    }

    const [name,
      params] = keys.split(':');
    const middlewarePaths = Middlewares[name];
    if (middlewarePaths instanceof Array) {
      const middlewares = [];
      const funcBasedParams = typeof params !== 'undefined'
      ? params.split('|'): undefined;
      for (let i = 0; i < middlewarePaths.length; i++) {
        const middleware = getMiddleware(middlewarePaths[i], funcBasedParams?.[i]?.split(','));
        middlewares.push(middleware);
      }
      return middlewares;
    }
    return getMiddleware(middlewarePaths, params?.split(','));
  },

  setEnv: (envValues: object): boolean => {
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    for (const [key, value] of Object.entries(envValues)) {
      envConfig[key] = value;
    }
    try{
      fs.writeFileSync('.env', Object.entries(envConfig).map(([k, v]) => `${k}=${v}`).join('\n'));
      return true;
    }
    catch(err: any){
      throw err;
    }
  },

  log: (data: string | object): void => {
    const path = './storage/error.log';
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }
    fs.appendFile(path, `${data}\n\n\n`, (err: Error) => {
      if (err) {
        throw err;
      }
    });
  },
}