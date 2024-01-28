import {Token} from "../models/Token";
import { ApiError } from "../utils/apiError";
import crypto from "crypto";
import * as userController from "../controllers/users";

const createToken = async (userID: string) => {
    // Check User Exists
    if (!(await userController.userExists(userID))) {
        throw new ApiError(400, "User Does not Exist");
    }

    return await new Token({
        userID,
        token: crypto.randomBytes(32).toString("hex")
    }).save();
};

const verifyUser = async (userID: string, createdToken: string) => {
    if (!(await userController.userExists(userID))) {
        throw new ApiError(400, "User Does not Exist");
    }

    const tokenExists = await Token.findOne({
        userID: userID,
        token: createdToken
    });

    if (!tokenExists) {
        throw new ApiError(400, "Invalid/Expired Link");
    }

    await userController.verifyUser(userID);
    await Token.findByIdAndDelete(tokenExists._id);

    return { message: "Verified Successfully " };
};

export default { verifyUser, createToken };
