import { Request, RequestHandler, Response } from "express";
import { IStringStringMap } from "../../../types/util";

import { generateSecret, verifyToken     } from 'node-2fa'
import config from "../../../config";
import * as db from '../../../database'

const setups: IStringStringMap = {}
const setupOTP: RequestHandler = (req: Request, res: Response) => {
    if(req.user.security.otpSecret){
        res.status(400).json({
            error: 'OTP_ALLREADY_PRESENT'
        })
    } else {
        if(setups[req.user.id]){
            res.status(400).json({
                error: 'OTP_SETUP_ALLREADY_IN_PROGRESS'
            })
        } else {
            const secretData = generateSecret({
                account: req.user.name,
                name: config.displayName
            })
            setups[req.user.id] = secretData.secret
            const data = secretData as any
            data['ttl'] = config.auth.otpSetupTTL
            setTimeout(() => {
                delete setups[req.user.id]
            }, 1000 * 60 * config.auth.otpSetupTTL)
            res.json(data)
        }
    }
}

const verifyOTP: RequestHandler = (req: Request, res: Response) => {
    if(setups[req.user.id]){
        if(req.body['otp']){
            if(verifyToken(setups[req.user.id], req.body.otp)){
                db.setOTPSecret(req.user.id, setups[req.user.id])
                delete setups[req.user.id]
                res.status(204)
            } else {
                res.status(400).json({
                    error: 'INVALID_OTP'
                })
            }
        } else {
            res.status(400).json({
                error: 'NO_OTP'
            })
        }
    } else {
        res.status(400).json({
            error: 'NO_SETUP_IN_PROGRESS'
        })
    }
}

export {
    setupOTP,
    verifyOTP
}