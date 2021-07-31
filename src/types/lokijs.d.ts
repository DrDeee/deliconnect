declare interface LokiOptions {
    autosave?: boolean
    autosaveInterval?: number
    autoload?: boolean
}

declare class Loki {
    constructor(filename: string, options?: LokiOptions)
    addCollection(name: string, options?: object): LokiCollection
    saveDatabase(callback?: function)
}

declare interface LokiCollection {
    insert(doc: object | object[])
    by(uniqueIndex: string, value: any)
    find(query: object): object[]
    where(filter: function): object[]
    findAndUpdate(filterObject: object | function, updateFunction: function)
    updateWhere(filterFunction: function, updateFunction: function)
}

declare module 'lokijs' {
    export default Loki
    export { LokiCollection }
}