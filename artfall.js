function logTabs(tabs) {
    for (const tab of tabs) {
        if (tab.url.includes("scryfall.com/card")) {
            try {
                url_split = tab.url.split("/");

                set = url_split[4];
                num = url_split[5].padStart(3, "0");
                
                card_name = url_split[url_split.length - 1];
                
                // image_url = `https://www.mtgpics.com/card?ref=${set}${num}`;

                // browser.tabs.create({ url: image_url })
                //     .catch((error) => {
                //         console.error(`Couldn't open tab for ${card_name}.`);
                //     })

                image_url = `https://www.mtgpics.com/pics/art/${set}/${num}.jpg`;

                browser.downloads.download({ url: image_url, filename: `${card_name}.jpg` }).then((result) => {
                    console.log(`Downloaded ${card_name}.jpg`);
                }).catch((error) => {
                    console.error(`Couldn't get art for ${tab.url} 3:`);
                    console.error(error);
                });
            } catch (error) {
                console.error(`Unknown error whilst downloading ${tab.url} :<`);
                console.error(error);
            }
        }
    }
}

function onError(error) {
    console.error(`Error: ${error}`);
}

browser.action.onClicked.addListener(() => {
    browser.tabs.query({}).then(logTabs, onError);
});
