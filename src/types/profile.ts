
interface ISocialInfo {
    email?: string
    whatsapp?: string
    telegram?: string
    matrix?: string
    discord?: number
}

export class SecurityInfos {
    admin: boolean = false
    regio: boolean = false

    deli: boolean = false

    otpSecret?: string
}

export default interface IProfile {
    id: string
    name: string
    displayName?: string

    social: ISocialInfo

    security: SecurityInfos
}