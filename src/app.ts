import WebServer from './web/server'
import { getLogger, Logger } from './logger'

import * as db from './database'
import ServiceManager from './service/manager'

const log: Logger = getLogger('app')
export default class App {
    web: WebServer
    services: ServiceManager
    constructor() {
        this.web = new WebServer()
        this.services = new ServiceManager(this)
    }

    public async start() {
        log.info('Loading database..')
        db.load()

        log.info('Starting ServiceManager..')
        await this.services.start()

        log.info('Starting webserver..')
        await this.web.start()

        log.info('Application started.')
    }

    public async stop() {
        log.info('Stopping webserver..')
        await this.web.stop()

        log.info('Stopping database..')
        await db.stop()

        log.info('Application stopped.')
    }
}