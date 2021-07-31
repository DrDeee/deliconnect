import { NextFunction, Request, Response } from "express";

import config from "../config";

const cors = (req: Request, res: Response, next: NextFunction) => {
    for (const key in config.cors)
        res.setHeader(key, config.cors[key])
    next()
}
export default cors