import Loki from "lokijs";
import { LokiCollection } from "lokijs";

import { getLogger, Logger } from "./logger";
import config from "./config";
import IProfile from "./types/profile";

import { Optional } from 'typescript-optional'
import { SocialType } from "./types/social";

const log: Logger = getLogger('database')

let db: Loki

let profiles: LokiCollection

let interval: NodeJS.Timer


export function load() {
    db = new Loki(config.database.path, { autoload: true })
    profiles = db.addCollection('profiles', { unique: ['id'] })
    log.info('Database loaded.')

    interval = setInterval(() => {
        db.saveDatabase(() => log.debug('Database saved automatically.'))
    }, 1000 * config.database.autosaveInterval)
}

export async function save() {
    return new Promise((resolve, reject) => {
        db.saveDatabase(() => {
            log.info('Database saved.')
            resolve({})
        })
    })
}

export async function stop() {
    clearInterval(interval)
    await save()
    log.info('Database stopped.')
}

export function getProfileById(id: string): Optional<IProfile> {
    return Optional.ofNullable(profiles.by('id', id))
}

export function getProfileByName(name: string): Optional<IProfile> {
    return Optional.ofNullable(profiles.find({ 'name': name })[0] as IProfile)
}

export function getProfileBySocialEntry(type: SocialType, value: string | number) {
    return Optional.ofNullable(profiles.where((doc: IProfile) =>
        doc.social && doc.social[type] === value
    ))
}

export function getProfilesByDisplayName(displayName: string): IProfile[] {
    return profiles.where((doc: IProfile) => doc.displayName && doc.displayName.startsWith(displayName)) as IProfile[]
}

export function insertProfile(profile: IProfile) {
    profiles.insert(profile)
    log.debug(`Created new profile for user: ${profile.name} (${profile.id})`)
}

export function updateSocialEntry(userId: string, type: SocialType, value: string | number | any) {
    profiles.updateWhere(((doc: IProfile) => doc.id === userId), (doc: IProfile) => {
        if (!doc.social)
            doc.social = {}
        doc.social[type] = value
    })
    log.debug('Updated social entry for user: ' + userId)
}

export function setOTPSecret(userID: string, secret: string | undefined) {
    profiles.updateWhere((doc: IProfile) => doc.id === userID,
        (doc: IProfile) => doc.security.otpSecret = secret)
}