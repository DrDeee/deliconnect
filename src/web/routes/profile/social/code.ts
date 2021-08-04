import { Request, RequestHandler, Response, Router } from "express";
import { randomBytes } from 'crypto'
import config from "../../../../config";
import { EventEmitter } from "events";
import gateway from "../../../../gateway";

interface IStringCodeMap {
    [key: string]: {
        code: string,
        expires: number
    }
}
export abstract class SocialCodeBaseRoute {
    protected codes: IStringCodeMap = {}
    protected gateway: EventEmitter

    constructor() {
        this.gateway = gateway
        this.registerListener()
    }

    abstract registerListener(): any

    private get: RequestHandler = (req: Request, res: Response) => {
        if (this.codes[req.user.id]) {
            const data = this.codes[req.user.id] as any
            data['type'] = 'code'
            data.expires = Math.trunc((data.expires - new Date().getTime()) / 1000)
            res.json(data)
        } else {
            const code = randomBytes(8).toString('hex').slice(0, 6)
            let expires = new Date().getTime() + config.social.codeTTL
            this.codes[req.user.id] = {
                code,
                expires
            }

            expires = Math.trunc((expires - new Date().getTime()) / 1000)
            res.json({
                type: 'code',
                code, expires
            })
        }
    }

    private delete = (req: Request, res: Response) => {
        if (this.codes[req.user.id]) {
            delete this.codes[req.user.id]
            res.status(204)
        } else {
            res.status(404).json({
                error: 'NOT_IN_PROGRESS'
            })
        }
    }

    public register(router: Router, name: string) {
        router.get('/' + name, this.get)
        router.delete('/' + name, this.delete)
    }
}