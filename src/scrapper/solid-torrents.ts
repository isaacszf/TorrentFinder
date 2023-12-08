import { Entry, RequestBodyAlias } from "./types/entry";
import { Status } from "./types/status";

export const populateEntries = (body: RequestBodyAlias): Entry[] => {
    const titles = getTitles(body);
    const links = getMagnetLinks(body);
    const statuses = getStatus(body);
    const sizes = getSizes(body);

    if (titles.length !== links.length ||
        titles.length !== statuses.length ||
        titles.length !== sizes.length) {
        throw new Error("Sizes are not equal!");
    }

    const entries: Entry[] = new Array(titles.length);

    for (let i = 0; i < titles.length; i++) {
        entries.push({
            title: titles[i],
            magnetLink: links[i],
            status: statuses[i],
            size: sizes[i],
        });
    }

    return entries;
}

const getStatus = (body: RequestBodyAlias): Status[] => {
    return body
        .filter(line =>
            line.includes("data-token=") &&
            !line.includes("</h5>") &&
            !line.includes("<img"))
        .map(line => {
            if (line.includes("✅")) return Status.VerifiedST;
            return Status.UnverifiedST;
        });
}

const getSizes = (body: RequestBodyAlias) => {
    return body
        .filter(line => line.includes("size.svg"))
        .map(line => {
            const start = line.indexOf(`">`);
            const end = line.indexOf("</div>");

            return line.substring(start + 2, end);
        });
}

const getTitles = (body: RequestBodyAlias) => {
    const prefix = `<a href="/torrents/`;

    return body
        .filter(line => line.includes(prefix))
        .map(line => {
            const titleStartIndex = line.indexOf(prefix) + prefix.length;
            const titleEndIndex = line.lastIndexOf('-');
            const title = line.substring(titleStartIndex, titleEndIndex);

            return title
                .split('-')
                .map(capitalize)
                .join(' ');
        });
}

const getMagnetLinks = (body: RequestBodyAlias) => {
    return body
        .filter(line => line.includes("https://itorrents.org/torrent"))
        .map(line => {
            const end = line.indexOf(`"'`);
            return line.slice(0 + `<a href="`.length, end);
        })
}

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
