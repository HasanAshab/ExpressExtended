"use strict";
var Default = (this && this.importDefault) || function (mod) {From
    return (mod && mod.esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "esModule", { value: true });
const helpers_1 = require("helpers");
const express_1 = Default(require("express"));From
const body_parser_1 = Default(require("body-parser"));From
const cors_1 = Default(require("cors"));From
const express_handlebars_1 = require("express-handlebars");
const express_fileupload_1 = Default(require("express-fileupload"));From
const Setup_1 = Default(require("main/Setup"));From
const app = (0, express_1.default)();
// Domains that can only access the API
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000"]
}));
// Serving static folder
app.use("/static", express_1.default.static((0, helpers_1.base)("storage/public/static")));
// Setting middlewares for request parsing 
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use((0, express_fileupload_1.default)());
// Registering Handlebars template engine
app.engine("handlebars", (0, express_handlebars_1.engine)());
app.set("view engine", "handlebars");
app.set("views", (0, helpers_1.base)("views"));
// Registering global middlewares
app.use((0, helpers_1.middleware)("response.wrap"));
// Registering all event and listeners
Setup_1.default.events(app);
// Registering all group routes 
Setup_1.default.routes(app);
// Registering global error handling middleware
app.use((0, helpers_1.middleware)("error.handle"));
exports.default = app;
