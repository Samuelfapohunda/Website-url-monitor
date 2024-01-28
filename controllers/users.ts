import { User, validate } from "../models/User";
import { ApiError } from "../utils/apiError";
// import  bcrypt_pass from "../config/config.secrets";
import  config from "../config/config.secrets";
// import bcrypt_salt from "../config/config.secrets"
import bcrypt from "bcrypt";

function validUserParams(user: any, login: boolean = false): void {
    const isNotValid = validate(user, login);
    if (isNotValid.error) throw new ApiError(400, isNotValid.error.details[0].message);
}

async function userExists(userID: string): Promise<any> {
    return User.findById(userID);
}

const createUser = async (newUser: any): Promise<any> => {
    validUserParams(newUser);

    const isDuplicate = await User.findOne({ email: newUser.email });
    if (isDuplicate) throw new ApiError(400, "User Already Exists");

    const passHash = bcrypt.hashSync(newUser.password + config.bcrypt_pass, parseInt(config.bcrypt_salt));

    return await new User({
        username: newUser.username,
        email: newUser.email,
        password: passHash
    }).save();
};

const authenticateUser = async (userLogin: any): Promise<any> => {
    validUserParams(userLogin, true);
    const user = await User.findOne({ email: userLogin.email });
    if (!user) throw new ApiError(400, "User not found ");

    if (!user.verified) throw new ApiError(401, "User is not Verified");

    const authenticated = bcrypt.compareSync(
        userLogin.password + config.bcrypt_pass, user.password
    );
    if (!authenticated) throw new ApiError(400, "Password is Wrong");

    return user;
};

const verifyUser = async (userID: string): Promise<{ message: string }> => {
    if (!userID) throw new ApiError(400, "Missing User ID");
    if (!await userExists(userID)) throw new ApiError(400, "User does not exist");
    await User.findByIdAndUpdate({ _id: userID }, { verified: true });
    return { message: "User Verified" };
};

export { createUser, authenticateUser, userExists, verifyUser };
