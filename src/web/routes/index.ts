import { Router } from "express";
import sessionHandler from "./session";

const router = Router()

router.use(sessionHandler)

export default router