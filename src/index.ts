import App from "./app";
import { getLogger, Logger } from "./logger";

const log: Logger = getLogger('main')
const app = new App()

async function shutdown(){
    log.info('Stopping application..')
    await app.stop()
    process.exit()
}

process.once('SIGTERM', shutdown)
process.once('SIGINT', shutdown)

log.info('Starting Application..')
app.start()