import { Router } from "express";
import App from "../../app";
import authRouter from './auth'
import profileRouter from './profile'

function router(app: App) {
    const router = Router()

    router.use('/auth', authRouter)
    router.use('/profile', profileRouter(app))

    return router
}

export default router