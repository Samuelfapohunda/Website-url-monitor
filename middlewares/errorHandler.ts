import { ErrorRequestHandler } from 'express';
import { Response, Request, NextFunction } from 'express';

const errorHandler: ErrorRequestHandler = (error, req: Request, res: Response, next: NextFunction) => {
  const status: number = error.status || 500;
  const message: string = error.message || 'Internal Server Error';

  res.status(status).json({
    status,
    message,
  });

  next();
};

export default errorHandler;
