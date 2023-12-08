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
    const imgStatic = "https://tpb.party/static/img";
    const imgNamesToIgnore = ["tpblogo_sm_my.gif", "in.gif", "rss_small.gif", "icon-https.gif"];

    const parsedBody = body
        .filter(line => {
            const includesAnyNameToIgnore = imgNamesToIgnore.some(name => line.includes(name));
            return line.includes(imgStatic) && !includesAnyNameToIgnore;
        })
        .map(line => {
            if (line.includes("vip.gif")) return Status.VIPSafeTPB;
            if (line.includes("trusted.png")) return Status.SafeTPB;
            return Status.UnverifiedTPB;
        });
    parsedBody.shift();

    return parsedBody;
}

const getSizes = (body: RequestBodyAlias) => {
    return body
        .filter(line => line.includes(`, Size`))
        .map(line => {
            const start = line.indexOf(`Size`);
            const end = line.indexOf(", ULed");

            return line.substring(start + 5, end)
                .replace(/&nbsp;/g, " ")
                .replace('i', "");
        })
}

const getTitles = (body: RequestBodyAlias) => {
    return body
        .filter(line => line.includes(`title="Details for`))
        .map(line => {
            const titleName = line.split("Details for ")[1];
            const endOfTitle = titleName.indexOf(`">`);

            return titleName.slice(0, endOfTitle);
        })
}

const getMagnetLinks = (body: RequestBodyAlias) => {
    return body
        .filter(line => line.includes("magnet:?"))
        .map(line => {
            const magnetStart = line.split(`<a href="`)[1];
            const endOfLink = magnetStart.indexOf(`" title`);

            return magnetStart.slice(0, endOfLink);
        })
};