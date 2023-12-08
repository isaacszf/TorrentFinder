const electron = require("electron");
const { Status } = require("../scrapper/types/status");
const { Entry } = require("../scrapper/types/entry");

const { ipcRenderer } = electron;

const main = document.querySelector("main");
const termInput: HTMLInputElement = document.querySelector("#term");
const pagesInput: HTMLInputElement = document.querySelector("#pages");
const searchButton: HTMLButtonElement = document.querySelector("#search-button");
const snackbar = document.querySelector("#snackbar");
const form = document.querySelector("form");
const headerInfo = document.querySelector("header");
const torrentsContainer = document.querySelector(".torrents");
const results: HTMLSpanElement = document.querySelector(".num-results");

pagesInput.value = "1";

function copyClipboard(text: string) {
    navigator.clipboard.writeText(text);
    snackbar.className = "show";

    setTimeout(function () { snackbar.className = snackbar.className.replace("show", ""); }, 3000);
}

function buildCard(entry: typeof Entry) {
    if (!entry || entry === undefined) {
        return null;
    }

    let color: string;
    switch (entry.status) {
        case Status.VIPSafeTPB:
        case Status.SafeTPB:
        case Status.VerifiedST:
            color = "#33d680";
            break;
        default:
            color = "#ba252f";
            break;
    }

    if (entry.title.length > 118) entry.title = entry.title.slice(0, 115) + "...";

    const structure = `
        <h4 class="title">${entry.title}</h4>
        <div class="card-info">
            <div class="status-container">
                <span class="status">${entry.status}</span>
            </div>
            <hr>
            <span class="size">${entry.size}</span>
        </div>

        <button class="clipboard-btn">Get Link</button>
    `;

    const circle = document.createElement("span");
    circle.className = "circle";
    circle.style.backgroundColor = color;

    const div = document.createElement("div");
    div.className = "card";
    div.style.color = color;
    div.innerHTML = structure;

    const statusDiv = div.querySelector(".status-container");
    statusDiv.appendChild(circle);

    const clipboardButton = div.querySelector(".clipboard-btn");
    clipboardButton.addEventListener('click', () => {
        copyClipboard(entry.magnetLink);
    });

    return div;
}

form.addEventListener("submit", e => {
    e.preventDefault();

    let term = termInput.value;
    if (term.length > 255) term = term.slice(0, 255);

    let pages = parseInt(pagesInput.value, 10);
    if (typeof pages !== "number" || pages > 180 || pages <= 0) pages = 1;

    ipcRenderer.send('form-submission', { term, pages });

    searchButton.disabled = true;
    results.innerText = 'Searching...';
});

ipcRenderer.on('torrent-list', (_, data) => {
    if (data) {
        const entriesLength = data.length;

        searchButton.disabled = false;
        results.innerText = `Indexing ${entriesLength} ` + (entriesLength === 1 ? "result" : "results");
        headerInfo.appendChild(results);

        torrentsContainer.innerHTML = '';

        const entriesToShow = entriesLength < 15 ? entriesLength : 15;

        let currentIndex = 0;
        let displayedEntries = entriesToShow;

        for (let i = currentIndex; i < displayedEntries; i++) {
            const div = buildCard(data[i]);
            torrentsContainer.appendChild(div);
        }

        let showMoreBtn: HTMLButtonElement = main.querySelector(".show-more");
        if (showMoreBtn) {
            main.removeChild(showMoreBtn)
        }

        if (entriesLength > 15) {
            showMoreBtn = document.createElement("button");
            showMoreBtn.className = "show-more";
            showMoreBtn.innerText = "Show more...";

            main.appendChild(showMoreBtn);

            showMoreBtn.addEventListener("click", e => {
                currentIndex = displayedEntries;
                displayedEntries += entriesToShow;

                for (let i = currentIndex; i < displayedEntries && i < entriesLength; i++) {
                    const div = buildCard(data[i]);
                    torrentsContainer.appendChild(div);
                }

                if (currentIndex >= entriesLength) showMoreBtn.remove();
            });
        }
    } else {
        console.log("Invalid data");
    };
});
