import * as log4js from 'log4js'

import {Logger} from 'log4js'

log4js.configure({
    appenders: {
        main: {
            type: 'dateFile',
            filename: 'logs/log.log',
            keepFileExt: true
        },
        out: {
            type: 'stdout'
        }
    },
    categories: {
        default: {
            appenders: ['out', 'main'],
            level: 'debug'
        }
    }
})

function getLogger(name?: string): Logger{
    return log4js.getLogger(name)
}

export {
    getLogger,
    Logger
}
