import express, { Request, Response, NextFunction } from "express";
const profileRouter = express.Router();



const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.redirect("/api/v1/auth/login");
    } else {
      next();
   };
}
profileRouter.get("/", checkAuth, (req, res) => {
  res.render("profile", { user: req.user });
});

  
export default profileRouter;
