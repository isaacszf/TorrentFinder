import { makeRequest } from "./shared";
import * as tpbScrapper from "./tpb";
import * as solidScrapper from "./solid-torrents";

export async function start(term: string, pages: number) {
    let entries: any[] = [];
    term = term.toLowerCase();

    for (let i = 1; i <= pages; i++) {
        const tpbUrl = `https://tpb.party/search/${term}/${i}/99/0`;
        const solidUrl = `https://solidtorrents.to/search?q=${term}&page=${i}`;

        const tpbBody = await makeRequest(tpbUrl);
        const solidBody = await makeRequest(solidUrl);

        const tpbEntries = tpbScrapper.populateEntries(tpbBody);
        const stEntries = solidScrapper.populateEntries(solidBody);

        tpbEntries.forEach(entry => entries.push(entry));
        stEntries.forEach(entry => entries.push(entry));
    }

    const statusOrder = {
        "Safe VIP [TPB]": 0,
        "Safe [TPB]": 1,
        "Verified [SolidTorrents]": 2,
        "Unverified [SolidTorrents]": 3,
        "Unverified [TPB]": 4,
    };

    entries.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    return entries;
}