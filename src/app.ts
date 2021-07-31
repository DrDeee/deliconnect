import WebServer from './web/server'
import { getLogger, Logger } from './logger'
import { loadConfig } from './config'

import * as db from './database'

const log: Logger = getLogger('app')
export default class App {
    web: WebServer
    constructor() {
        this.web = new WebServer()
    }

    public async start() {
        log.info('Loading config..')
        loadConfig()

        log.info('Loading database..')
        db.load()

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