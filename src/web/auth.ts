import { NextFunction, RequestHandler, Request, Response } from 'express'
import { JwtPayload, verify } from 'jsonwebtoken'
import { Optional } from 'typescript-optional'
import config from '../config'

import * as db from '../database'
import IProfile, { AdditionalInfos } from '../types/profile'
import { IStringStringListMap } from '../types/util'

import { randomBytes } from 'crypto'

let sessions: IStringStringListMap = {}

export default class AuthHandler {
    private passSession: boolean

    constructor(passSession: boolean = true) {
        this.passSession = passSession
    }

    public handler: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.header('Authorization')
        const sessionHeader = req.header('Auth-Session')

        if (authHeader && sessionHeader) {
            const parts = authHeader.split(' ')
            if (parts.length != 2 || parts[0] !== 'Bearer')
                return this.authFailed(res)
            const jwt = this.verifyJWT(parts[1])
            if (jwt.isPresent()) {
                const payload = jwt.get()
                const profileOpt = db.getProfileById(payload.sub || '')
                if (profileOpt.isPresent()) {
                    req.user = profileOpt.get()
                    if (sessions[req.user.id].includes(sessionHeader))
                        next()
                    else {
                        if (this.passSession)
                            next()
                        else
                            this.authFailed(res)
                    }
                }
                else {
                    const newProfile: IProfile = {
                        id: payload.sub || '',
                        name: payload.preferred_username || '',
                        displayName: payload.name,
                        social: {
                            email: payload.email
                        },
                        additionalInfos: new AdditionalInfos()
                    }
                    req.user = newProfile
                    db.insertProfile(newProfile)
                }
            } else {
                this.authFailed(res)
            }
        }
        else this.authFailed(res)
    }

    private authFailed(res: Response) {
        res.status(401).json({
            error: 'AUTH_FAILED'
        })
    }

    private verifyJWT(jwt: string): Optional<JwtPayload> {
        try {
            const payload = verify(jwt, `-----BEGIN PUBLIC KEY-----\n${config.auth.oidcPublicKey}\n-----END PUBLIC KEY-----`)
            return Optional.of(payload as JwtPayload)
        } catch (error) {
            return Optional.empty()
        }
    }

}

export function createSession(user: string): string {
    const sessionString = randomBytes(32).toString('hex')
    if (!sessions[user])
        sessions[user] = []
    if (sessions[user].includes(sessionString))
        return createSession(user)
    sessions[user].push(sessionString)
    setTimeout(() => {
        sessions[user].filter(s => s === sessionString)
    }, config.sessionTime)
    return sessionString
}