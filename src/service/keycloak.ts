import KeycloakClient from "keycloak-admin"
import { Issuer, Client, GrantBody, TokenSet } from 'openid-client'
import App from "../app"
import config from "../config"
import { getLogger } from "../logger"
import BaseService from "./base"

const log = getLogger('keycloak')

interface IUser {
    id: string
    name: string
    email?: string
}

export default class KeycloakService implements BaseService {
    readonly name = 'Keycloak'

    private issuerClient?: Client
    private credentiels?: GrantBody
    private tokens?: TokenSet
    private tokenRefresh?: NodeJS.Timer

    private client?: KeycloakClient
    async start(app: App): Promise<any> {
        this.credentiels = {
            grant_type: 'password',
            username: config.auth.credentiels.user,
            password: config.auth.credentiels.password
        }

        log.info('Logging in to Keycloak..')
        this.client = new KeycloakClient({
            baseUrl: config.auth.keycloakBaseUrl,
            realmName: config.auth.realm
        })

        const keycloakIssuer = await Issuer.discover(config.auth.keycloakFullUrl)
        this.issuerClient = new keycloakIssuer.Client({
            client_id: 'admin-cli',
            token_endpoint_auth_method: 'none',
        })
        this.tokens = await this.issuerClient.grant(this.credentiels as GrantBody)
        this.client.setAccessToken(this.tokens.access_token as string)
        this.tokenRefresh = setInterval(async () => {
            const refreshToken = this.tokens?.refresh_token || ''
            this.tokens = await this.issuerClient?.refresh(refreshToken)
            log.debug('Access Token refreshed.')
            this.client?.setAccessToken(this.tokens?.access_token || '')
        }, 58 * 1000)

        log.info('Logged in to Keycloak.')
    }

    async getUsers(): Promise<IUser[]> {
        const users = await this.client?.users.find()
        const ret: IUser[] = []
        users?.forEach(user => {
            ret.push({
                id: user.id || '',
                name: user.username || '',
                email: user.email
            })
        })
        return ret
    }

    async findUserById(id: string): Promise<IUser | null> {
        const user = await this.client?.users.findOne({ id: id })
        if (user) {
            return {
                id: user.id as string,
                name: user.username as string,
                email: user.email as string
            }
        } else {
            return null
        }
    }

    async stop(): Promise<any> {
        if (this.tokenRefresh)
            clearInterval(this.tokenRefresh)
    }
}