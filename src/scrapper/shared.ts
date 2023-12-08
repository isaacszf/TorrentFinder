export const makeRequest = async (url: string) => {
    try {
        await delay(300);

        let response = await fetch(url);
        if (!response.ok) throw new Error("Response is not OK");

        const body = await response.text();
        if (!body.includes("magnet:?")) return [];

        return body
            .split("\n")
            .map(line => line.trim());
    } catch (err) {
        return []
    }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
