"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("main/app"));
const Setup_1 = __importDefault(require("main/Setup"));
const DB_1 = __importDefault(require("illuminate/utils/DB"));
const port = Number(process.env.APP_PORT) || 8000;
const connectToDB = process.env.DB_CONNECT || "true";
const nodeEnv = process.env.NODE_ENV;
// Connecting to database
if (connectToDB === "true") {
    console.log("Connecting to database...");
    DB_1.default.connect()
        .then(() => {
        console.log("done!");
    })
        .catch((err) => {
        console.log(err);
    });
}
// Registering all Cron Jobs
Setup_1.default.cronJobs();
// Listening for clients
const server = app_1.default.listen(port, () => {
    console.log(`Server running on [http://127.0.0.1:${port}] ...`);
});
if (nodeEnv !== "production") {
    server.on("connection", (socket) => {
        const now = new Date();
        const time = now.toLocaleTimeString("en-US", { hour12: true });
        console.log(`*New connection: [${time}]`);
    });
}
const Mail_1 = __importDefault(require("illuminate/utils/Mail"));
const VerificationMail_1 = __importDefault(require("app/mails/VerificationMail"));
const PasswordChangedMail_1 = __importDefault(require("app/mails/PasswordChangedMail"));
Mail_1.default.mock();
Mail_1.default.to([
    "foo1@gmail.com",
    "foo2@gmail.com",
    "foo3@gmail.com",
    "foo4@gmail.com"
]).send(new VerificationMail_1.default({ link: "sj" }));
Mail_1.default.to([
    "foo1@gmail.com",
]).send(new PasswordChangedMail_1.default);
console.log(Mail_1.default.mocked.data.total);
console.log(Mail_1.default.mocked.data.recipients["foo1@gmail.com"]);
