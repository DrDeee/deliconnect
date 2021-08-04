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
    auth: {
        oidcPublicKey: string
        keycloakFullUrl: string
        keycloakBaseUrl: string
        realm: string
        credentiels: {
            user: string
            password: string
        }
        otpSetupTTL: number
    }
    sessionTime: number

    social: {
        codeTTL: number,
        discord: {
            id: number,
            guildId: number
            deliRole: number
            botToken: string
            autoRoles: number[]
        }
    }
    cors: IStringStringMap
    displayName: string // Used for 2fa
    basePath: string
}
const log: Logger = getLogger('config')

const DEFAULT_CONFIG: IConfiguration = {
    database: {
        path: 'database.json',
        autosaveInterval: 60
    },
    port: 80,
    auth: {
        oidcPublicKey: 'SET IT HERE',
        keycloakFullUrl: 'http://localhost:8080/auth/realms/master',
        keycloakBaseUrl: 'http://localhost:8080/auth',
        realm: 'master',
        credentiels: {
            user: 'admin',
            password: 'admin'
        },
        otpSetupTTL: 5
    },
    sessionTime: 30,
    cors: {},
    displayName: 'DeliConnect Demo',

    social: {
        codeTTL: 5 * 60,
        discord: {
            id: 0,
            guildId: 746860017709482135,
            deliRole: 872471971416399952,
            botToken: 'asfasf',
            autoRoles: []
        }
    },
    basePath: 'http://localhost/api/v1/'
}

let config: IConfiguration

log.info('Loading config..')
ensureFileSync('config.json')


const data = readJSONSync('config.json', { throws: false })
if (data == null) log.warn('Config not found. Creating new..')
config = (data == null ? DEFAULT_CONFIG : defaultsDeep(data, DEFAULT_CONFIG)) as IConfiguration
writeJSONSync('config.json', config, { spaces: 2 })
log.info('Config loaded.')


export default config
