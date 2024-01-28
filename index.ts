import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
// import { config as dotenvConfig } from "dotenv";

import usersRouter from "./routes/users";
import urlChecksRouter from "./routes/urlCheck";
import reportsRouter from "./routes/reports";
import eventEmitter from "./controllers/events";
// import connectDB from "./Config/config.db";
import errorHandler from "./middlewares/errorHandler";
import authorize from "./middlewares/authorize";



dotenv.config({ path: "./config/config.env" });
require("./db");

const app = express();
const serverPort = process.env.PORT || 3000;
const testPort = 4000;

// Middleware
app.use(express.json());


// Routes & Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/checks/", authorize, urlChecksRouter);
app.use("/api/v1/reports/", authorize, reportsRouter);


app.use(errorHandler);

const port = process.env.NODE_ENV === "test" ? testPort : serverPort;

const server = app.listen(port, () => {
  console.log(`🛡  Server listening on port: ${port} 🛡`);
});
eventEmitter.emit("Server Start");
export { app, server };