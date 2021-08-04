import ICodePayload from "../../../../types/code";
import { SocialCodeBaseRoute } from "./code";
import * as db from '../../../../database'
import { SocialType } from "../../../../types/social";

class TelegramRoutes extends SocialCodeBaseRoute {
    registerListener() {
        this.gateway.on('code.telegram', (payload: ICodePayload) => {
            for (const key in this.codes) {
                const data = this.codes[key]
                if (data.code === payload.code) {
                    db.updateSocialEntry(key, SocialType.TELEGRAM, payload.sender)
                }
            }
        })
    }
}

const routes = new TelegramRoutes()

export default routes