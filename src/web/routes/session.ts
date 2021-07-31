import { Request, Response, Router } from "express"
import AuthHandler, { createSession } from "../auth"

const sessionHandler = Router()

sessionHandler.get('/sessions', new AuthHandler(true).handler, (req: Request, res: Response) => {

})

export default sessionHandler