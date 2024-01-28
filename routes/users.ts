import express, { Request, Response } from "express";
import { createUser, authenticateUser } from "../controllers/users";
import tokenController from "../controllers/tokens";
import { tryCatchWrapExpress } from "../utils/wrappers";
import config from "../config/config.secrets";
import sendEmail from "../utils/mail";
import jwt from "jsonwebtoken";

const usersRouter = express.Router();

const routerCreateUser = tryCatchWrapExpress(async (req: Request, res: Response) => {
    const newUser = await createUser(req.body);
    const createdToken = await tokenController.createToken(newUser._id);

    const verificationURL = `${process.env.base_url}/users/verify/${newUser._id}/${createdToken.token}`;
    await sendEmail(newUser.email, "Verify Email", verificationURL);
    res.status(200).json({
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
    res.status(200).json({
        message: "User Authentication Successful",
        token: generatedToken
    });
});

const routerVerifyUser = tryCatchWrapExpress(async (req: Request, res: Response) => {
    await tokenController.verifyUser(req.params.id, req.params.token);
    res.status(200).json({ message: "Verified Successfully " });
});

usersRouter.route("/signup").post(routerCreateUser);
usersRouter.route("/login").post(routerAuthenticateUser); // Change to post
usersRouter.route("/verify/:id/:token").get(routerVerifyUser);

export default usersRouter;
