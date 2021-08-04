import { Request, Response, Router } from "express"
import config from "../../../config"
import { createSession, destroySession } from "../../auth"

import * as node2fa from 'node-2fa'

const sessionCreateHandler = (req: Request, res: Response) => {
    const user = req.user
    if (!(user.security.admin || user.security.regio)
        && !user.security.otpSecret) {
        res.json({
            session: createSession(user.id),
            expiresIn: config.sessionTime * 60
        })
    } else {
        if (user.security.otpSecret) {
            const otp = req.body.otp
            if (!otp) {
                res.status(400).json({
                    error: 'NO_OTP'
                })
            }
            const result = node2fa.verifyToken(user.security.otpSecret, otp)
            if (result == null) {
                res.status(400).json({
                    error: 'INVALID_OTP'
                })
            } else {
                res.json({
                    session: createSession(user.id),
                    expiresIn: config.sessionTime * 60
                })
            }
        } else {
            res.status(401).json({
                error: '2FA_REQUIRED'
            })
        }
    }
}

const sessionDestroyHandler = (req: Request, res: Response) => {
    destroySession(req.user.id, req.session)
    res.status(204)
}

export { sessionCreateHandler, sessionDestroyHandler }