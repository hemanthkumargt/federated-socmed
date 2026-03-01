import { createError } from "../utils/error.js";

export const verifyAdmin = (req,res,next) =>{
    if (!req.user) {
        return next(createError(401, "Authentication required"));
    }
    const role = req.user.role;
    if(role !== 'admin'){
        return next(createError(403,"You are not authorized!"));
    }
    next();
}