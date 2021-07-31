import express from 'express'
import { Express } from "express"
import { getLogger, Logger } from '../logger'

import config from '../config'
import { Server } from 'http'

import router from './routes'
import cors from './cors'

const log: Logger = getLogger('web')

export default class WebServer {
    private port: number
    private app: Express

    private server?: Server
    constructor() {
        this.port = config.port
        log.debug(`Webserver port: ${this.port}`)
        this.app = express()

        this.app.use(express.json())
        this.app.use(cors)
        this.app.use('/api/v1', router)
    }

    public async start() {
        await new Promise((resolve, reject) => {
            this.server = this.app.listen(this.port, () => {
                log.info('Webserver started.')
                resolve({})
            })
        })
    }

    public async stop(){
        await new Promise((resolve, reject) => {
            this.server?.close(() => {
                log.info('Webserver stopped.')
                resolve({})
            })
        })
    }
}