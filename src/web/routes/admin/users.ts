import { RequestHandler, Request, Response, Router, json } from "express";
import KeycloakService from "../../../service/keycloak";

import * as db from "../../../database";

export default class UsersRoutes {
    readonly keycloak: KeycloakService
    constructor(keycloak: KeycloakService) {
        this.keycloak = keycloak
    }
    private get: RequestHandler = async (req: Request, res: Response) => {
        res.json(await this.keycloak.getUsers())
    }

    private putRegio: RequestHandler = async (req: Request, res: Response) => {
        if (req.user.security.admin) {
            if (req.body.id) {
                db.setRegio(req.body.id as string, true)
            } else {
                res.status(400).json({
                    error: 'NO_ID'
                })
            }
        } else {
            res.status(401).json({
                error: 'ADMIN_REQUIRED'
            })
        }
    }

    private deleteRegio: RequestHandler = async (req: Request, res: Response) => {
        if (req.user.security.admin) {
            if (req.body.id) {
                const opt = db.getProfileById(req.body.id)
                if (opt.isPresent()) {
                    const profile = opt.get()
                    if (profile.security.regio) {
                        db.setRegio(profile.id, false)
                        res.status(204)
                    } else {
                        res.status(404).json({
                            error: 'NOT_IN_REGIO'
                        })
                    }
                } else {
                    res.status(404).json({
                        error: 'NO_USER'
                    })
                }

            } else {
                res.status(400).json({
                    error: 'NO_ID'
                })
            }
        } else {
            res.status(401).json({
                error: 'ADMIN_REQUIRED'
            })
        }
    }

    public register(router: Router) {
        router.get('/users', this.get)
        router.put('/users/regio', this.putRegio)
    }
}