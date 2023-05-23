"use strict";
var importDefault = (this && this.importDefault) || function (mod) {
    return (mod && mod.esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "esModule", { value: true });
const Exception_1 = importDefault(require("illuminate/exceptions/Exception"));
class ArtisanError extends Exception_1.default {
}
ArtisanError.errors = {
    COMMAND_NOT_FOUND: {
        status: 404,
        message: "Command not found!",
    },
    SUB_COMMAND_REQUIRED: {
        status: 400,
        message: "The Sub Command is Required as it's using as :name !",
    },
    REQUIRED_PARAM_MISSING: {
        status: 400,
        message: "The \":param\" Param is Required!",
    }
};
exports.default = ArtisanError;
