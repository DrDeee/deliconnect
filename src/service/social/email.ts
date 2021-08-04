import app from "../../app";
import IBaseService from "../base";

import * as mailer from 'nodemailer'

export default class EmailService implements IBaseService {
    name: string = 'Email';
    mailer?: mailer.Transporter
    async start(app: app): Promise<any> {
        const testAccount: mailer.TestAccount = await mailer.createTestAccount()
        this.mailer = mailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            }
        })
        return Promise.resolve()
    }
    async stop(): Promise<any> {
        return Promise.resolve()
    }

    public async sendCode(email: string, code: string) {
        
    }

}