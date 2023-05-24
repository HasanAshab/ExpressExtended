"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Middleware_1 = __importDefault(require("illuminate/middlewares/Middleware"));
const method_1 = require("illuminate/decorators/method");
const Cache_1 = __importDefault(require("illuminate/utils/Cache"));
class ValidateSignature extends Middleware_1.default {
    async handle(req, res, next) {
        const port = req.app.get("port") || req.socket.localPort;
        const fullUrl = `${req.protocol}://${req.hostname}:${port}${req.baseUrl}${req.path}`;
        const signature = req.query.s;
        if (typeof signature !== "undefined") {
            const signedSignature = await Cache_1.default.get(`__signed__${fullUrl}`);
            if (signedSignature && signedSignature === signature) {
                next();
            }
        }
        else {
            res.status(401).json({
                message: "Invalid signature!"
            });
        }
    }
}
__decorate([
    (0, method_1.passErrorsToHandler)()
], ValidateSignature.prototype, "handle", null);
exports.default = ValidateSignature;
