import dotenv from "dotenv";



import app from "main/app";
import Setup from "main/Setup";

console.log('ss')
/*
const DB = require(base("illuminate/utils/DB"));
const port = Number(process.env.PORT) || 8000;
const connectToDB = process.env.DB_CONNECT || "true";
const nodeEnv = process.env.NODE_ENV;

// Connecting to database
if (connectToDB === "true") {
  console.log("Connecting to database...");
  DB.connect()
    .then(() => {
      console.log("done!");
    })
    .catch((err) => {
      console.log(err);
    });
}

// Registering all Cron Jobs
register.registerCronJobs();

// Listening for clients
const server = app.listen(port, () => {
  console.log(`Server running on [http://127.0.0.1:${port}] ...`);
});

if (nodeEnv !== "production") {
  server.on("connection", (socket) => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour12: true });
    console.log(`*New connection: [${time}]`);
  });
}

*/