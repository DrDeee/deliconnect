import ICodePayload from "../../../../types/code";
import { SocialCodeBaseRoute } from "./code";
import * as db from '../../../../database'
import { SocialType } from "../../../../types/social";

class MatrixRoutes extends SocialCodeBaseRoute {
    registerListener() {
        this.gateway.on('code.matrix', (payload: ICodePayload) => {
            for (const key in this.codes) {
                const data = this.codes[key]
                if (data.code === payload.code) {
                    db.updateSocialEntry(key, SocialType.MATRIX, payload.sender)
                }
            }
        })
    }
}

const routes = new MatrixRoutes()

export default routes