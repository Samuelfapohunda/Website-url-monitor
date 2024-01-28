import { Request, Response, NextFunction } from 'express';

const tryCatchWrapExpress = (callback: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Execute the Passed Callback
      await callback(req, res, next);
    } catch (error) {
      // Catch errors if any
      next(error);
    }
  };
};

export { tryCatchWrapExpress };
