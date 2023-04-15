const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const componentPaths = require('./register/componentPaths');
const urls = require('./register/urls');
const Middlewares = require('./register/middlewares.js');

app = () => {
  return require(path.join(__dirname, `main/app`));
}

route = (name) => {
  return `${process.env.APP_URL}${path}`;
}

url = (path) => {
  return `${process.env.APP_URL}${path}`;
}

route = (name, data = null) => {
  let endpoint = urls[name];
  if(data){
    const regex = /:(\w+)/g;
    const params = endpoint.match(regex);
    for (const param of params){
      endpoint = endpoint.replace(param, data[param.slice(1)])
    }
  }
  return `${process.env.APP_URL}${endpoint}`;
}

storage = (storage_path) => {
  return path.join(__dirname, path.join('storage', storage_path));
}

controller = (filename)=> {
  return require(path.join(__dirname, `${componentPaths.controller}/${filename}`));
}

model = (filename)=> {
  return require(path.join(__dirname, `${componentPaths.model}/${filename}`));
}

trait = (filename)=> {
  return require(path.join(__dirname, `${componentPaths.trait}/${filename}`));
}

event = (filename)=> {
  return require(path.join(__dirname, `${componentPaths.event}/${filename}`));
}

listener = (filename)=> {
  return require(path.join(__dirname, `${componentPaths.listener}/${filename}`));
}

middleware = (keys) => {
  if (typeof keys === 'object') {
    const middlewares = [];
    for (const key of keys) {
      const [name,
        param] = key.split(':');
      const middlewarePath = Middlewares[name];
      const middleware = require(middlewarePath);
      middlewares.push(middleware(param));
    }
    return middlewares;
  }
  const [name, params] = keys.split(':');
  const middlewarePath = Middlewares[name];
  const middleware = require(middlewarePath);
  return middleware(...params.split(','));
}

util = (filename) => {
  return require(path.join(__dirname, `utils/${filename}`));
}

mail = (filename) => {
  return require(path.join(__dirname, `${componentPaths.mail}/${filename}`));
}

setEnv = (envValues) => {
  const envConfig = dotenv.parse(fs.readFileSync('.env'));
  for (const [key, value] of Object.entries(envValues)) {
    envConfig[key] = value;
  }
  fs.writeFileSync('.env', Object.entries(envConfig).map(([k, v]) => `${k}=${v}`).join('\n'));
}

const log = (data) => {
  const path = './storage/error.log';
  if(typeof data === 'object'){
    data = JSON.stringify(data);
  }
  fs.appendFile(path, `${data}\n\n\n`, (err) =>{
    if(err){
      throw err;
    }
  });
}

module.exports = {
  app,
  url,
  storage,
  controller,
  model,
  trait,
  event,
  listener,
  middleware,
  util,
  setEnv,
  mail,
  log,
}