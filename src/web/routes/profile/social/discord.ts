import { Request, RequestHandler, Response, Router } from "express";
import { randomBytes } from 'crypto'
import config from "../../../../config";
import DiscordService from "../../../../service/social/discord";

import * as db from '../../../../database'
import { strict } from "assert/strict";

interface IStringStateMap {
    [key: string]: {
        state: string
        expires: number
    }
}

export default class DiscordRoutes {
    protected states: IStringStateMap = {}

    protected service: DiscordService

    constructor(service: DiscordService) {
        this.service = service
    }

    private getOauthURL(state: string): string {
        return 'https://discord.com/api/oauth2/authorize?client_id='
            + config.social.discord.id +
            '&redirect_uri='
            + encodeURIComponent(config.basePath + (config.basePath.endsWith('/') ? 'profile/discord/return' : '/profile/discord/return'))
            + '&response_type=token&scope=identify%20guilds.join%20guild&state=' + state
    }
    private get: RequestHandler = (req: Request, res: Response) => {
        if (this.states[req.user.id]) {
            const data = this.states[req.user.id] as any
            data['type'] = 'link'
            data['link'] = this.getOauthURL(data['state'])
            data.expires = Math.trunc((data.expires - new Date().getTime()) / 1000)
            res.json(data)
        } else {
            const state = randomBytes(8).toString('hex').slice(0, 6)
            let expires = new Date().getTime() + config.social.codeTTL
            this.states[req.user.id] = {
                state,
                expires
            }

            expires = Math.trunc((expires - new Date().getTime()) / 1000)
            res.json({
                type: 'link',
                link: this.getOauthURL(state),
                state, expires
            })
        }
    }

    private delete = (req: Request, res: Response) => {
        if (this.states[req.user.id]) {
            delete this.states[req.user.id]
            res.status(204)
        } else {
            res.status(404).json({
                error: 'NOT_IN_PROGRESS'
            })
        }
    }

    private callback = async (req: Request, res: Response) => {
        const { access_token, token_type, state } = req.query
        if (access_token && state && token_type) {
            for (const key in this.states) {
                if (this.states[key].state === state) {
                    await this.service.initUser(db.getProfileById(key).get(), access_token as string, token_type as string)
                    delete this.states[key]
                    res.render('discord', { error: false })
                }
            }
        } else {
            res.render('discord', { error: true })
        }
    }

    public register(router: Router, name: string) {
        router.get('/' + name, this.get)
        router.delete('/' + name, this.delete)
        router.get('/' + name + '/return', this.callback)
    }
}