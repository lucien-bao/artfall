function getCardInfo(tab) {
    if (!tab.url.includes("scryfall.com/card/")) return null;

    const url_split = tab.url.split("/");

    return {
        set: url_split[4],
        num: url_split[5].padStart(3, "0"),
        name: url_split.slice(6).join("-"),
    };
}

async function handleTab({tab, set, num, name}) {
    const image_url = `https://www.mtgpics.com/pics/art/${set}/${num}.jpg`;

    browser.downloads.download({ url: image_url, filename: `${name}.jpg` }).then((result) => {
        console.log(`Downloaded ${name}.jpg`);
    }).catch((error) => {
        console.error(`Couldn't get art for ${name} 3:`);
        console.error(error);
    });
}

function handleTabs(tabs) {
    for (const tab of tabs) {
        const cardInfo = getCardInfo(tab);
        if (!cardInfo) continue;

        handleTab({tab, ...cardInfo})
            .catch((e) => {
                console.error(`Error getting art for ${cardInfo.name}: ${e}`);
            });
    }
}

function onError(error) {
    console.error(`Uncaught error: ${error}`);
}

browser.action.onClicked.addListener(() => {
    browser.tabs.query({}).then(handleTabs, onError);
});
