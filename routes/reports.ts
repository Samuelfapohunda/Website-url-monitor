import express, { Request, Response } from 'express';
import { tryCatchWrapExpress } from '../utils/wrappers';
import { getReport } from '../controllers/reports';
import { statusCode } from './../statusCodes';

// Extend the Request type to include userID
interface AuthenticatedRequest extends Request {
    userID?: string;
}

const reportsRouter = express.Router();

const routerGetReport = tryCatchWrapExpress(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.params.checkID) {
        res.status(statusCode.badRequest).json({ message: "Provide Check ID" });
        return;
    }

    // Check if userID is defined before using it
    if (!req.userID) {
        res.status(statusCode.unauthorized).json({ message: "Unauthorized" });
        return;
    }

    const response = await getReport(req.params.checkID, req.userID);

    if (response.userReport.length === 0) {
        res.status(statusCode.noContent).json({ message: "No Reports found for user" });
        return;
    }

    res.status(statusCode.success).json(response);
    return;
});

reportsRouter.route('/:checkID').get(routerGetReport);

export default reportsRouter;

