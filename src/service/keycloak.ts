import KeycloakClient from "keycloak-admin"
import { Issuer, Client, GrantBody, TokenSet } from 'openid-client'
import App from "../app"
import config from "../config"
import { getLogger } from "../logger"
import BaseService from "./base"

const log = getLogger('keycloak')

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

    async stop(): Promise<any> {
        if (this.tokenRefresh)
            clearInterval(this.tokenRefresh)
    }
}