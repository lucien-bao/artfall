async function handleTab(tab) {
    if (!tab.url.includes("scryfall.com/card/")) return;

    url_split = tab.url.split("/");

    set = url_split[4];
    num = url_split[5].padStart(3, "0");
    card_name = url_split[url_split.length - 1];

    image_url = `https://www.mtgpics.com/pics/art/${set}/${num}.jpg`;

    browser.downloads.download({ url: image_url, filename: `${card_name}.jpg` }).then((result) => {
        console.log(`Downloaded ${card_name}.jpg`);
    }).catch((error) => {
        console.error(`Couldn't get art for ${tab.url} 3:`);
        console.error(error);
    });
}

function handleTabs(tabs) {
    for (const tab of tabs) {
        handleTab(tab)
            .catch((e) => {
                console.error(`Error getting art for ${tab.url}: ${e}`);
            });
    }
}

function onError(error) {
    console.error(`Error: ${error}`);
}

browser.action.onClicked.addListener(() => {
    browser.tabs.query({}).then(handleTabs, onError);
});
