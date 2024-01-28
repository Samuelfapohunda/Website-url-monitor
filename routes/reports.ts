// import express, { Request, Response } from 'express';
// import { tryCatchWrapExpress } from '../utils/wrappers';
// import { getReport } from '../controllers/reports';

// const reportsRouter = express.Router();

// const routerGetReport = tryCatchWrapExpress(async (req: Request, res: Response): Promise<void> => {
//   if (!req.params.checkID)
//  res.status(400).json({ message: 'Provide Check ID' });
//   return;
//   const response = await getReport(req.params.checkID, req.userID);

//   if (response.userReport.length === 0)
//     res.status(204).json({ message: 'No Reports found for user' });
//   else
//     res.status(200).json(response);
// });

// reportsRouter.route('/:checkID').get(routerGetReport);

// export default reportsRouter;



import express, { Request, Response } from 'express';
import { tryCatchWrapExpress } from '../utils/wrappers';
import { getReport } from '../controllers/reports';

// Extend the Request type to include userID
interface AuthenticatedRequest extends Request {
    userID?: string;
}

const reportsRouter = express.Router();

const routerGetReport = tryCatchWrapExpress(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.params.checkID) {
        res.status(400).json({ message: "Provide Check ID" });
        return;
    }

    // Check if userID is defined before using it
    if (!req.userID) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const response = await getReport(req.params.checkID, req.userID);

    if (response.userReport.length === 0) {
        res.status(204).json({ message: "No Reports found for user" });
        return;
    }

    res.status(200).json(response);
    return;
});

reportsRouter.route('/:checkID').get(routerGetReport);

export default reportsRouter;

