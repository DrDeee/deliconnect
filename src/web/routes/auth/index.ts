import { Router } from "express"
import AuthHandler from "../../auth"
import { sessionCreateHandler, sessionDestroyHandler } from "./session"
import { setupOTP, verifyOTP } from "./otp"

const router = Router()

router.use(new AuthHandler(true).handler)

router.post('/sessions', sessionCreateHandler)
router.delete('/sessions', sessionDestroyHandler)

router.get('/otp', setupOTP)
router.put('/otp', verifyOTP)

export default router