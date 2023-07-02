"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("helpers");
const utils_1 = require("illuminate/utils");
const node_cron_1 = __importDefault(require("node-cron"));
const Artisan_1 = __importDefault(require("illuminate/utils/Artisan"));
const events_1 = __importDefault(require("register/events"));
const cron_1 = __importDefault(require("register/cron"));
const mongoose_1 = __importDefault(require("mongoose"));
const Nameable_1 = __importDefault(require("app/plugins/Nameable"));
class Setup {
    static globalPlugins() {
        mongoose_1.default.plugin(Nameable_1.default);
    }
    static cronJobs() {
        for (const [schedule, commands] of Object.entries(cron_1.default)) {
            if (Array.isArray(commands)) {
                for (const command of commands) {
                    const [commandName, ...args] = command.split(" ");
                    node_cron_1.default.schedule(schedule, (async () => await Artisan_1.default.call(commandName, args, false)));
                }
            }
            else {
                const [commandName, ...args] = commands.split(" ");
                node_cron_1.default.schedule(schedule, (async () => await Artisan_1.default.call(commandName, args, false)));
            }
        }
    }
    ;
    static events(app) {
        for (const [event, listenerNames] of Object.entries(events_1.default)) {
            for (const listenerName of listenerNames) {
                const Listener = require((0, helpers_1.base)(`app/listeners/${listenerName}`)).default;
                const listenerInstance = new Listener();
                app.on(event, listenerInstance.dispatch.bind(listenerInstance));
            }
        }
    }
    ;
    static routes(app) {
        const routesRootPath = (0, helpers_1.base)("routes");
        const routesEndpointPaths = (0, utils_1.generateEndpointsFromDirTree)(routesRootPath);
        for (const [endpoint, path] of Object.entries(routesEndpointPaths)) {
            app.use(endpoint, require(path).default);
        }
    }
    ;
}
exports.default = Setup;
