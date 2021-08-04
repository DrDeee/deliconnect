import App from "../../app";
import app from "../../app";
import IBaseService from "../base";

import got from 'got'
import IProfile from "../../types/profile";
import config from "../../config";

import * as db from '../../database'
import { SocialType } from "../../types/social";

const apiBase: string = 'https://discord.com/api/v9'

export default class DiscordService implements IBaseService {
    readonly name: string = 'Discord'
    private app?: App
    start(app: app): Promise<any> {
        this.app = app
        return Promise.resolve()
    }
    stop(): Promise<any> {
        return Promise.resolve()
    }

    private getOptions(accessToken: string, tokenType: string) {
        return {
            headers: {
                'Authorization': `${tokenType} ${accessToken}`
            }
        }
    }
    
    public async initUser(user: IProfile, accessToken: string, tokenType: string) {
        try {
            const options = this.getOptions(accessToken, tokenType)
            const { id} = await got.get(apiBase + '/users/@me', options).json()

            const guilds: any[] = await got.get(apiBase + '/users/@me/guilds', options).json()
            let isInGuild: boolean = false
            guilds.forEach(g => {
                if (g.id == config.social.discord.guildId) isInGuild = true
            })
            if (!isInGuild) {
                const roles = config.social.discord.autoRoles
                if (user.security.deli) {
                    roles.push(config.social.discord.deliRole)
                }
                await got.put(apiBase + `/guilds/${config.social.discord.guildId}/members/${id}`, {
                    json: {
                        access_token: accessToken,
                        roles: roles
                    },
                    headers: this.getOptions(config.social.discord.botToken, 'Bot').headers
                })
            }
            db.updateSocialEntry(user.id, SocialType.DISCORD, id)
        } catch (error) { }
    }

}