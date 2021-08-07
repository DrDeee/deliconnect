import { Router } from "express";
import AuthHandler from "../../auth";

import overviewRoute from './overview'

import DiscordRoutes from "./social/discord";

import matrixRoutes from './social/matrix'
import telegramRoutes from './social/telegram'
import whatsappRoutes from './social/whatsapp'
import App from "../../../app";

function router(app: App) {
    const router = Router()

    const discordRoutes = new DiscordRoutes(app.services.discord)
    discordRoutes.register(router, 'discord')

    router.use(new AuthHandler().handler)

    router.get('/', overviewRoute)

    matrixRoutes.register(router, 'matrix')
    telegramRoutes.register(router, 'telegram')
    whatsappRoutes.register(router, 'whatsapp')

    return router
}

export default router