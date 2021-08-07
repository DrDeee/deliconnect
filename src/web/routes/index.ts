import { Router } from "express";
import App from "../../app";
import adminRouter from "./admin";
import authRouter from './auth'
import profileRouter from './profile'

function router(app: App) {
    const router = Router()

    router.use('/auth', authRouter)
    router.use('/profile', profileRouter(app))

    router.use('/admin', adminRouter(app))

    return router
}

export default router