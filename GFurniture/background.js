
function sendSuccess(message) {
    console.log(`Message from the background script:  ${message.response}`);
}
function sendError(error) {
    console.log(`Error: ${error}`);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.mode) {
        case 'load-furniture':
        case 'load-furniture-inhouse':
            {
                let resMode = (message.mode == 'load-furniture-inhouse' ? 'loaded-furniture-inhouse' : 'loaded-furniture');

                fetch(message.url, {
                    'method': 'GET',
                    'cache': 'no-store'
                }).then(async (response) => {
                    if (response && response.ok) {
                        const resStr = await response.text();
                        //console.log(resStr);

                        chrome.tabs.sendMessage(sender.tab.id, { mode: resMode, response: resStr }).then(sendSuccess, sendError);
                    }
                }).catch((error) => {
                    chrome.tabs.sendMessage(sender.tab.id, { mode: resMode, response: "failed to fetch." }).then(sendSuccess, sendError);
                });
            }
            break;
        default:
            sendResponse({ response: "no match mode." });
            break;
    }
    sendResponse({ response: "send complete." });

    return true;
});