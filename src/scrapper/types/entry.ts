import { Status } from "./status";

export type RequestBodyAlias = string[]

export type Entry = {
    title: string,
    magnetLink: string,
    status: Status,
    size: string,
}