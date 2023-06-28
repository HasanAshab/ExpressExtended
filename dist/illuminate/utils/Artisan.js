"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("helpers");
const commands_1 = __importDefault(require("register/commands"));
class Artisan {
    static async call(baseInput, args, fromShell = true) {
        var _a;
        const { params, flags } = this.parseArgs(args);
        const [commandKey, subCommand] = baseInput.split(":");
        const commandName = commands_1.default[commandKey];
        if (typeof commandName === "undefined")
            throw (0, helpers_1.customError)("COMMAND_NOT_FOUND");
        const CommandClass = (_a = require((0, helpers_1.base)(`app/commands/${commandName}`))) === null || _a === void 0 ? void 0 : _a.default;
        const commandClass = new CommandClass(subCommand, fromShell, flags, params);
        const handler = commandClass[subCommand] || commandClass.handle;
        if (typeof handler === "undefined")
            throw (0, helpers_1.customError)("COMMAND_NOT_FOUND");
        return handler.apply(commandClass);
    }
    static parseArgs(args) {
        const flags = [];
        const params = {};
        args.forEach((arg, index) => {
            if (arg.startsWith("-")) {
                flags.push(arg.replace("-", ""));
            }
            else if (arg.includes("=")) {
                const [key, value] = arg.split("=");
                params[key] = value;
            }
        });
        return {
            params, flags
        };
    }
}
exports.default = Artisan;
