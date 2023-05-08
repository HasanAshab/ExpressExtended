"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("helpers");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const Setup_1 = __importDefault(require("main/Setup"));
const app = (0, express_1.default)();
Setup_1.default.routes(app);
// Domains that can only access the API
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000']
}));
// Registering static folder
app.use('/static', express_1.default.static((0, helpers_1.base)('storage/public/static')));
// Registering middlewares for request body 
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
/*
// Registering Handlebars template engine
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', base('views'));

// Registering global middlewares
app.use(multer().any());
app.use(middleware('response.wrap'));

// Registering all event and listeners
register.registerEvents(app);

// Registering all group routes
register.registerRoutes(app);

// Registering global error handling middleware
app.use(middleware('error.handle'));
*/
exports.default = app;
