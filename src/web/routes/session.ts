import { Request, Response, Router } from "express"
import config from "../../config"
import AuthHandler, { createSession } from "../auth"
import * as db from '../../database'
import * as node2fa from 'node-2fa'

const sessionHandler = Router()

sessionHandler.get('/sessions', new AuthHandler(true).handler, (req: Request, res: Response) => {
    const user = req.user
    if (!(user.additionalInfos.admin || user.additionalInfos.regio)) {
        res.json({
            session: createSession(user.id),
            expiresIn: config.sessionTime * 60
        })
    } else {
        if (user.additionalInfos.otpSecret) {
            const otp = req.body.otp
            if (!otp) {
                res.status(400).json({
                    error: 'NO_OTP'
                })
            }
            const result = node2fa.verifyToken(user.additionalInfos.otpSecret, otp)
            if (result == null) {
                if (!user.additionalInfos.verified)
                    db.setOTPSecret(user.id, undefined)
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
            const secret = node2fa.generateSecret({
                name: config.displayName,
                account: user.name
            })
            db.setOTPSecret(user.id, secret.secret)
            db.setOTPSecretVerified(user.id, false)
            res.status(201).json({
                secret: secret.secret,
                qr: secret.qr
            })
        }
    }
})

export default sessionHandler