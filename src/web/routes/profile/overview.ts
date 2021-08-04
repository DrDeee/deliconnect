import { Request, Response } from "express";

const route = (req: Request, res: Response) => {
    const profile = req.user as any
    delete profile['security']
    res.json(profile)
}

export default route