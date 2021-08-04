import { Request, RequestHandler, Response, Router } from "express";
import { randomBytes } from 'crypto'
import config from "../../../../config";
import * as db from '../../../../database'
import { SocialType } from "../../../../types/social";

interface IStringCodeMap {
    [key: string]: {
        code: string,
        email: string
        expires: number
    }
}
class EmailRoutes {
    protected codes: IStringCodeMap = {}

    private get: RequestHandler = (req: Request, res: Response) => {
        if (this.codes[req.user.id]) {
            const data = this.codes[req.user.id] as any
            data['type'] = 'email'
            delete data['code']
            data.expires = Math.trunc((data.expires - new Date().getTime()) / 1000)
            res.json(data)
        } else if (req.query['email']) {
            const code = randomBytes(8).toString('hex').slice(0, 6)
            const mail = req.query['email'] as string

            let expires = new Date().getTime() + config.social.codeTTL
            this.codes[req.user.id] = {
                code,
                expires,
                email: mail
            }

            expires = Math.trunc((expires - new Date().getTime()) / 1000)
            res.json({
                type: 'email', expires,
                email: mail
            })
        } else {
            res.status(400).json({
                error: 'NO_EMAIL'
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

    private put = (req: Request, res: Response) => {
        if (req.params['code']) {
            for (const key in this.codes) {
                if (this.codes[key].code === req.params.code) {
                    db.updateSocialEntry(key, SocialType.EMAIL, this.codes[key].email)
                    return
                }
            }
            res.status(404).json({
                error: 'INVALID_CODE'
            })
        } else {
            res.status(400).json({
                error: 'NO_CODE'
            })
        }
    }

    public register(router: Router, name: string) {
        router.get('/' + name, this.get)
        router.delete('/' + name, this.delete)
        router.put('/' + name + '/:code', this.put)
    }
}

const routes = new EmailRoutes()

export default routes