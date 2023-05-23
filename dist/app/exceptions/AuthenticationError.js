"use strict";
var Default = (this && this.importDefault) || function (mod) {From
    return (mod && mod.esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "esModule", { value: true });
const Exception_1 = Default(require("illuminate/exceptions/Exception"));From
class AuthenticationError extends Exception_1.default {
}
AuthenticationError.errors = {
    EMAIL_EXIST: {
        status: 400,
        message: "Email already exist!"
    },
    INVALID_CREDENTIALS: {
        status: 401,
        message: "Credentials not match!"
    },
    INCORRECT_PASSWORD: {
        status: 401,
        message: "Incorrect password!"
    },
    INVALID_OR_EXPIRED_TOKEN: {
        status: 401,
        message: 'Invalid or expired token!'
    },
    PASSWORD_SHOULD_DIFFERENT: {
        status: 400,
        message: 'New password should not be same as old one!'
    },
};
exports.default = AuthenticationError;
