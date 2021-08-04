import IProfile from "./profile";

declare global {
    namespace Express {
        interface Request {
            user: IProfile
            session: string
        }
    }
}
