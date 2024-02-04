import { ApiError } from "../utils/apiError";
import { Check, validateCheck } from "../models/urlCheck";
import * as reportController from "../controllers/reports";
import { userExists } from "./users";
import eventEmitter from "./events";
import { AxiosResponse } from "axios";

const isValidUrl = (urlString: string): boolean => {
    const urlPattern = new RegExp(
        "^(https?://)?" + // validate protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
        "(:\\d+)?(/[\\-a-z\\d%_.~+]*)*" + // validate port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
        "(#[-a-z\\d_]*)?$", "i"); // validate fragment locator
    return !!urlPattern.test(urlString);
};

const validCheckParameters = (check: any, update: boolean = false): void => {
    const isNotValid = validateCheck(check, update);
    if (isNotValid.error) throw new ApiError(400, isNotValid.error.details[0].message);
};

export const getCheckByID = async (checkID: string) => {
    return Check.findById(checkID).exec();
};

export const createCheck = async (check: any, userID: string): Promise<{ message: string; checkID: string }> => {
    if (!userID) throw new ApiError(400, "User Missing");

    //Check user Existence
    if (!(await userExists(userID))) throw new ApiError(400, "User Does Not Exist");

    validCheckParameters(check);
    const urlObj = new URL(check.url);
    const newCheck = {
        ...check,
        url: urlObj.hostname,
        path: urlObj.pathname ? urlObj.pathname : null,
        userID,
        protocol: urlObj.protocol,
        port: urlObj.port
    };
    if (newCheck.webhook && !isValidUrl(newCheck.webhook)) throw new ApiError(400, "Not a Valid URL");

    // Check Duplicate URL
    const foundCheckDuplicate = await Check.findOne({ name: newCheck.name, url: newCheck.url, userID });
    if (foundCheckDuplicate) throw new ApiError(400, "Duplicate Check");

    const checkCreated = await new Check(newCheck).save();

    // Create Accompanied Report
    await reportController.createReport({}, checkCreated._id, userID);

    eventEmitter.emit("Check Created", checkCreated);
    return { message: "Check Created", checkID: checkCreated._id };
};

export const getChecks = async (userID: string) => {
    if (!userID) throw new ApiError(400, "User Missing");

    //Check user Existence
    if (!(await userExists(userID))) throw new ApiError(400, "User Does Not Exist");

    const userChecks = await Check.find({ userID });

    return { message: "Checks Found", userChecks };
};

export const getAllChecks = async () => {
    return Check.find({});
};

export const getCheckByName = async (userID: string, checkName: string) => {
    if (!userID) throw new ApiError(400, "User Missing");
    if (!checkName) throw new ApiError(400, "Check Name Missing");
    //Check user Existence
    if (!(await userExists(userID))) throw new ApiError(400, "User Does Not Exist");

    const exists = await Check.exists({ name: checkName, userID });
    if (!exists) throw new ApiError(400, "Check Not Found");

    const check = await Check.findById(exists);
    return { message: "Found Check", check };
};

export const getCheckByTag = async (userID: string, tags: string) => {
    if (!userID) throw new ApiError(400, "User Missing");
    if (!tags) throw new ApiError(400, "Missing Tag");
    //Check user Existence
    if (!(await userExists(userID))) throw new ApiError(400, "User Does Not Exist");

    const checksGroupedByTag = await Check.find({ userID, tags });
    if (!checksGroupedByTag) throw new ApiError(400, "No Checks found with the given tag");

    return { message: "Check Found with Tag", checksGroupedByTag };
};

export const updateCheck = async (
    userID: string,
    checkID: string,
    newCheck: any
): Promise<{ message: string }> => {
    if (!newCheck || Object.keys(newCheck).length === 0) throw new ApiError(400, "Empty Update Check");
    if (!checkID) throw new ApiError(400, "Missing Check ID");
    if (!userID) throw new ApiError(400, "Missing User ID");
    //Check user Existence
    if (!(await userExists(userID))) throw new ApiError(400, "User Does Not Exist");
    validCheckParameters(newCheck, true);
    let newCheckUpdated = {
        ...newCheck
    };
    if (newCheck.url) {
        const urlObj = new URL(newCheck.url);
        newCheckUpdated = {
            url: urlObj.hostname,
            path: urlObj.pathname ? urlObj.pathname : null,
            protocol: urlObj.protocol,
            port: urlObj.port
        };
    }

    const exists = await Check.exists({ _id: checkID, userID });

    if (!exists) throw new ApiError(400, "Check Not Found");

    // Clear History
    await reportController.updateReport({ history: [] }, checkID, userID);

    await Check.findByIdAndUpdate(exists, newCheckUpdated);
    eventEmitter.emit("Check Update", newCheckUpdated);

    return { message: "Check Updated" };
};

export const deleteCheck = async (userID: string, checkID: string): Promise<{ message: string }> => {
    if (!checkID) throw new ApiError(400, "Missing Check ID");
    if (!userID) throw new ApiError(400, "Missing User ID");
    //Check user Existence
    if (!(await userExists(userID))) throw new ApiError(400, "User Does Not Exist");

    const exists = await Check.exists({ _id: checkID, userID });
    if (!exists) throw new ApiError(400, "Check Not Found");

    // Delete Accompanied Report
    await reportController.deleteReport(checkID, userID);

    await Check.findByIdAndDelete(exists);
    return { message: "Check Deleted" };
};


