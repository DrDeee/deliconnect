import App from "../app";
import KeycloakService from "./keycloak";
import { Logger, getLogger } from '../logger'
import DiscordService from "./social/discord";

const log: Logger = getLogger('services')

export default class ServiceManager {
    private app?: App
    readonly keycloak: KeycloakService
    readonly discord: DiscordService

    constructor() {
        this.keycloak = new KeycloakService()

        this.discord = new DiscordService()
    }

    async start(app: App) {
        this.app = app
        log.info('Starting services..')
        await Promise.all([
            this.keycloak.start(this.app),
            this.discord.start(this.app)
        ])
        log.info('Services started.')
    }
}