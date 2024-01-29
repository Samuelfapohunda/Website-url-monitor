import express, { Request, Response } from "express";
import { tryCatchWrapExpress } from "../utils/wrappers";
import * as checksController from "../controllers/urlChecks";
import { statusCode } from './../statusCodes';

const urlChecksRouter = express.Router();


interface AuthenticatedRequest extends Request {
    userID?: string;
  }



const routerCreateCheck = tryCatchWrapExpress(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userID = req.userID;
 
    if (!userID) {
         res.sendStatus(statusCode.unauthorized);
         return;
    }
    const response = await checksController.createCheck(req.body, userID);
    if (!response)
         res.sendStatus(statusCode.notFound);
    res.status(statusCode.created).json(response);
});

const routerGetChecks = tryCatchWrapExpress(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userID = req.userID;

    if (!userID) {
         res.sendStatus(statusCode.unauthorized);
         return;
    }
    const response = await checksController.getChecks(userID);
    if (response.userChecks.length === 0)
         res.sendStatus(statusCode.notFound);
    res.status(statusCode.success).json(response);
});

const routerGetCheckByName = tryCatchWrapExpress(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userID = req.userID;

    if (!userID) {
         res.sendStatus(statusCode.unauthorized);
         return;
    }
    if (!req.params.checkName)
         res.status(statusCode.badRequest).json({ message: "Provide Check Name" });
    const response = await checksController.getCheckByName(userID, req.params.checkName);
    res.status(statusCode.success).json(response);
});

const routerGetCheckByTag = tryCatchWrapExpress(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userID = req.userID;

    if (!userID) {
         res.sendStatus(statusCode.unauthorized);
         return;
    }
    if (!req.body.tags)
         res.status(statusCode.badRequest).json({ message: "Provide Tags" });
    const response = await checksController.getCheckByTag(userID, req.body.tags);
    res.status(statusCode.success).json(response);
});

const routerUpdateCheck = tryCatchWrapExpress(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userID = req.userID;

    if (!userID) {
         res.sendStatus(statusCode.unauthorized);
         return;
    }
    if (req.body.length === 0)
         res.status(statusCode.badRequest).json({ message: "Empty AuthenticatedRequest" });

    if (!req.params.checkID)
         res.status(statusCode.badRequest).json({ message: "Provide Check Id" });
    const response = await checksController.updateCheck(userID, req.params.checkID, req.body);
    res.status(statusCode.success).json(response);
});

const routerDeleteCheck = tryCatchWrapExpress(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userID = req.userID;

    if (!userID) {
         res.sendStatus(statusCode.unauthorized);
         return;
    }
    if (!req.params.checkID)
         res.status(statusCode.badRequest).json({ message: "Provide Check Id" });
    const response = await checksController.deleteCheck(userID, req.params.checkID);
    res.status(statusCode.success).json(response);
});

urlChecksRouter.route("/:checkName").get(routerGetCheckByName);

urlChecksRouter.route("/:checkID")
    .patch(routerUpdateCheck)
    .delete(routerDeleteCheck);

urlChecksRouter.route("/find/tag").get(routerGetCheckByTag);
urlChecksRouter.route("/").post(routerCreateCheck).get(routerGetChecks);

export default urlChecksRouter;
