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
const helpers_1 = require("helpers");
const path_1 = __importDefault(require("path"));
class ValidateRequest extends Middleware_1.default {
    handle(req, res, next) {
        try {
            var ValidationRule = require((0, helpers_1.base)(path_1.default.join('app/http/validations/', this.options[0]))).default;
        }
        catch (_a) {
            next();
        }
        const { urlencoded, multipart } = ValidationRule.schema;
        if (typeof urlencoded !== "undefined") {
            const { error } = urlencoded.rules.validate(req[urlencoded.target]);
            if (error) {
                res.status(400).json({
                    message: error.details[0].message,
                });
            }
        }
        if (typeof multipart !== "undefined") {
            const contentType = req.headers["content-type"];
            if (!contentType || !contentType.startsWith("multipart/form-data")) {
                res.status(400).json({
                    message: "Only multipart/form-data requests are allowed",
                });
            }
            const error = multipart.validate(req.files);
            if (error) {
                res.status(400).json({
                    message: error,
                });
            }
        }
        next();
    }
}
__decorate([
    (0, method_1.passErrorsToHandler)()
], ValidateRequest.prototype, "handle", null);
exports.default = ValidateRequest;
