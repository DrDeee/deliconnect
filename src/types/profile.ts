
interface ISocialInfo {
    email?: string
    whatsapp?: string
    telegram?: string
    matrix?: string
    discord?: number
}

export class AdditionalInfos {
    admin: boolean = false
    regio: boolean = false

    otpSecret?: string
    verified: boolean = false
}

export default interface IProfile {
    id: string
    name: string
    displayName?: string

    social: ISocialInfo

    additionalInfos: AdditionalInfos
}