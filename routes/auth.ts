import express, { Request, Response } from "express";
import { createUser, authenticateUser } from "../controllers/users";
import tokenController from "../controllers/tokens";
import { tryCatchWrapExpress } from "../utils/wrappers";
import passport from 'passport';
import config from "../config/config.secrets";
import sendEmail from "../utils/mail";
import { statusCode } from '../statusCodes';
import jwt from "jsonwebtoken";

const authRouter = express.Router();




const routerCreateUser = tryCatchWrapExpress(async (req: Request, res: Response) => {
    const newUser = await createUser(req.body);
    const createdToken = await tokenController.createToken(newUser._id);

    const verificationURL = `${process.env.base_url}/auth/verify/${newUser._id}/${createdToken.token}`;
    await sendEmail(newUser.email, "Verify Email", verificationURL);
    res.status(statusCode.success).json({
        message: "Verification Sent",
        newUser,
        url: verificationURL
    });
});

const routerAuthenticateUser = tryCatchWrapExpress(async (req: Request, res: Response) => {
    const authenticatedUser = await authenticateUser(req.body);
    

   const secretKey = process.env.token_secret ?? "default-secret"; 
    const generatedToken = jwt.sign({ authenticatedUser }, secretKey);
    console.log(generatedToken); 
    res.status(statusCode.success).json({
        message: "User Authentication Successful",
        token: generatedToken
    });
//     req.session = null;
//   req.session = { user: authenticatedUser};

});

const routerVerifyUser = tryCatchWrapExpress(async (req: Request, res: Response) => {
    await tokenController.verifyUser(req.params.id, req.params.token);
    res.status(statusCode.success).json({ message: "Verified Successfully " });
});


const test2 = tryCatchWrapExpress(async (req: Request, res: Response) => {
    passport.authenticate("google", {
        scope: ["email", "profile"],
        failureRedirect: 'http://localhost:8000/login'
      })
})



authRouter.get("/google/callback", passport.authenticate("google", {scope: ['email', 'profile']}), (req, res) => {
        res.redirect("/profile");
  });

// authRouter.route("/logins").get(test);
authRouter.route("/google").get(test2);
authRouter.route("/signup").post(routerCreateUser);
authRouter.route("/login").post(routerAuthenticateUser).get((req, res) => {
    if (req.user) {
        res.redirect("/profile");
      }
      res.render("login");
  }); // Change to post
authRouter.route("/verify/:id/:token").get(routerVerifyUser);

export default authRouter;
