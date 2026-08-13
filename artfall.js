//#region Helpers

function getScryfallCardInfo(url) {
    if (!url.includes("scryfall.com/card/")) return null;

    const url_split = url.split("/");

    return {
        set: url_split[4],
        num: url_split[5].padStart(3, "0"), // Get full 3-digit collector's num
        name: url_split.slice(6).join("_"), // Join with `_` because Scryfall
                                            // joins with `-`
    };
}

function getDownloadCardInfo(url, filename) {
    if (!url.includes("mtgpics.com/pics/art/")) return null;
    const url_split = url.split("/");
    const path_split = filename.split("\\"); // Only on Windows?

    return {
        set: url_split[5],
        num: url_split[6].split(".")[0],
        name: path_split[path_split.length - 1].split(".")[0], // Remove extension
    };
}

function constructScryfallUrl(set, num, name) {
    if (name.indexOf("_") === -1) {
        return `https://scryfall.com/card/${set}/${num}/${name}`;
    } else {
        const name_split = name.split("_");
        return `https://scryfall.com/card/${set}/${num}/${name_split[0]}/${name_split[1]}`;
    }
}

function constructDownloadUrl(set, num, name) {
    return `https://www.mtgpics.com/pics/art/${set}/${num}.jpg`;
}

//#endregion
//#region Handlers

// Reopen the Scryfall page if download fails
async function handleInterrupted(delta) {
    if (delta.state && delta.state.current === "interrupted") {
        const item = (await browser.downloads.search({ id: delta.id }))[0];
        const cardInfo = getDownloadCardInfo(item.url, item.filename);
        const url = constructScryfallUrl(cardInfo.set, cardInfo.num, cardInfo.name);

        const tab = await browser.tabs.create({ url });
        tab.then(() => {}, (error) => console.log(`Error re-opening tab: ${error}`));
    }
}

async function handleTab({tab, set, num, name}) {
    const downloadUrl = constructDownloadUrl(set, num, name);

    const downloadId = await browser.downloads.download({
        url: downloadUrl,
        filename: `${name}.jpg`,
        conflictAction: "overwrite", // Don't create excess copies yet
    });

    browser.tabs.remove(tab.id);
}

function handleTabs(tabs) {
    for (const tab of tabs) {
        const cardInfo = getScryfallCardInfo(tab.url);
        if (!cardInfo) continue;

        handleTab({tab, ...cardInfo})
            .catch((e) => {
                console.error(`Error getting art for ${cardInfo.name}: ${e}`);
            });
    }
}

//#endregion

function onError(error) {
    console.error(`Uncaught error: ${error}`);
}

browser.downloads.onChanged.addListener(handleInterrupted);

browser.action.onClicked.addListener(() => {
    browser.tabs.query({}).then(handleTabs, onError);
});
