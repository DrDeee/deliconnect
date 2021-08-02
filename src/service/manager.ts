import App from "../app";
import KeycloakService from "./keycloak";
import { Logger, getLogger } from '../logger'

const log: Logger = getLogger('services')

export default class ServiceManager {
    readonly app: App
    readonly keycloak: KeycloakService

    constructor(app: App) {
        this.app = app
        this.keycloak = new KeycloakService()
    }

    async start() {
        log.info('Starting services..')
        await Promise.all([
            this.keycloak.start(this.app)
        ])
        log.info('Services started.')
    }
}