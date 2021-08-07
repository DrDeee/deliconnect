import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import App from "../../../app";
import AuthHandler from "../../auth";

import UsersRoutes from "./users";

function restrictAccess(regio: boolean = true): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user.security.admin) {
            next()
            return
        }
        if(regio && req.user.security.regio) {
            next()
            return
        }
        res.status(401).json({
            error: regio ? 'REGIO_REQUIRED': 'ADMIN_REQUIRED'
        })

    }
}

export default function adminRouter(app: App): Router {
    const router = Router()
    //router.use(new AuthHandler().handler)
    
    const usersRoutes = new UsersRoutes(app.services.keycloak)
    usersRoutes.register(router)
    return router
}