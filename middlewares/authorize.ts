import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError';
// import { jwt_password } from '../config/config.secrets';
import  config from "../config/config.secrets";


interface AuthenticatedRequest extends Request {
    userID?: string;
  }

const authorize = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const secretKey = process.env.token_secret ?? "default-secret";
    if (!token) {
        res.status(403).json({ message: 'Authorization Needed' });
        return; 
      }

    const decoded: any = await jwt.verify(token, secretKey);
    req.userID = decoded.authenticatedUser._id;
    next();
  } catch (error) {
    return next(new ApiError(401, `Could not Authorize User => ${error}`));
  }
};

export default authorize;
