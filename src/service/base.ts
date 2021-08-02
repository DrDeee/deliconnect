import App from "../app";
import ServiceManager from "./manager";

export default interface BaseService {
    readonly name: string
    start(app: App): Promise<any>
    stop(): Promise<any>
}