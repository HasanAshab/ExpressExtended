"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("illuminate/commands/Command"));
//const User = require(base("app/models/User"));
//const DB = require(base("illuminate/utils/DB"));
class Test extends Command_1.default {
    async handle() {
        this._greet();
        console.log(this.params);
        console.log(this.flags);
        console.log(this.subCommand);
        this.success('Yeh!');
    }
    ;
    async other() {
        console.log(this.subCommand);
    }
    ;
    _greet() {
        console.log('hello');
    }
}
exports.default = Test;
