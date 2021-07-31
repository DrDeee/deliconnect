import { ensureFileSync, readJSONSync, writeJSONSync } from 'fs-extra'
import { getLogger, Logger } from "./logger";
import defaultsDeep from "lodash.defaultsdeep";
import { IStringStringMap } from './types/util';

export interface IConfiguration {
    database: {
        path: string
        autosaveInterval: number
    }
    port: number
    oidcPublicKey: string
    sessionTime: number

    cors: IStringStringMap
}
const log: Logger = getLogger('config')

const DEFAULT_CONFIG: IConfiguration = {
    database: {
        path: 'database.json',
        autosaveInterval: 60
    },
    port: 80,
    oidcPublicKey: 'SET IT HERE',
    sessionTime: 30,
    cors: { 'Access-Control-Allow-Origin': '*' }
}

let config: IConfiguration = DEFAULT_CONFIG

ensureFileSync('config.json')

function loadConfig() {
    const data = readJSONSync('config.json', { throws: false })
    if (data == null) log.warn('Config not found. Creating new..')
    config = (data == null ? DEFAULT_CONFIG : defaultsDeep(data, DEFAULT_CONFIG)) as IConfiguration
    writeJSONSync('config.json', config, { spaces: 2 })
    log.info('Config loaded.')
}

export default config
export {
    loadConfig
}
