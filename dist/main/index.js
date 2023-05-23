"use strict";
var importDefault = (this && this.importDefault) || function (mod) {
    return (mod && mod.esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "esModule", { value: true });
require("dotenv/config");
const app_1 = importDefault(require("main/app"));
const Setup_1 = importDefault(require("main/Setup"));
const DB_1 = importDefault(require("illuminate/utils/DB"));
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
