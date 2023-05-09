"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Command {
    constructor(subCommand, fromShell = true) {
        this.subCommand = subCommand;
        this.fromShell = fromShell;
        this.subCommand = subCommand;
        this.fromShell = fromShell;
    }
    info(text) {
        console.log('\x1b[33m', text, '\x1b[0m');
    }
    success(text) {
        console.log('\x1b[32m', '\n', text, '\n', '\x1b[0m');
        if (this.fromShell) {
            process.exit(0);
        }
    }
    error(text) {
        console.log('\x1b[31m', '\n', text, '\n', '\x1b[0m');
        if (this.fromShell) {
            process.exit(1);
        }
    }
}
exports.default = Command;