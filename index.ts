import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import passport from 'passport';
import session from 'express-session';

import authRouter from "./routes/auth";
import urlChecksRouter from "./routes/urlCheck";
import reportsRouter from "./routes/reports";
import eventEmitter from "./controllers/events";
import errorHandler from "./middlewares/errorHandler";
import authorize from "./middlewares/authorize";
import "./passport"



dotenv.config({ path: "./config/config.env" });
require("./db");

const app = express();
const serverPort = process.env.PORT || 3000;
const testPort = 4000;

app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});


app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());


// Middleware
app.use(express.json());

app.set("view engine", "ejs");

// Routes & Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/checks/", authorize, urlChecksRouter);
app.use("/api/v1/reports/", authorize, reportsRouter);


app.use(errorHandler);

const port = process.env.NODE_ENV === "test" ? testPort : serverPort;

const server = app.listen(port, () => {
  console.log(`🛡  Server listening on port: ${port} 🛡`);
});
eventEmitter.emit("Server Start");
export { app, server };