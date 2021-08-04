import ICodePayload from "../../../../types/code";
import { SocialCodeBaseRoute } from "./code";
import * as db from '../../../../database'
import { SocialType } from "../../../../types/social";

class WhatsAppRoutes extends SocialCodeBaseRoute {
    registerListener() {
        this.gateway.on('code.whatsapp', (payload: ICodePayload) => {
            for (const key in this.codes) {
                const data = this.codes[key]
                if (data.code === payload.code) {
                    db.updateSocialEntry(key, SocialType.WHATSAPP, payload.sender)
                }
            }
        })
    }
}

const routes = new WhatsAppRoutes()

export default routes