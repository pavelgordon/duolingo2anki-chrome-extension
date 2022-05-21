'use strict';

// 1. gets signal message from content script to initiate loading process
// 2. fetches vocabulary from duolingo
// 3. sends vocabulary to anki app
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const {action, deckName, modelName, tagString} = request
    if (action !== "addNotes") {
        return false
    }
    var notes = []
    fetchFromDuoLingo(request)
        .then(duoWords => {
            return createDeck(deckName)
                .then(() => createModel(modelName))
                .then(() => {
                    notes = buildAnkiNotes(deckName, modelName, tagString, duoWords);
                })
                .then(() => addAnkiNotes(notes))
                .then(function (ankiResponse) {
                       console.log("ankiResponse ", ankiResponse)
                        return {
                            notesIds: ankiResponse.result,
                            deckName: deckName,
                            addedNotes: ankiResponse.result.filter(e => e != null).length,
                            totalNotes: ankiResponse.result.length,
                            error: ankiResponse.error
                        };
                    }
                )
                .then(result => sendBrowserNotification(result))
                .then(result => sendResponse(result));
        })
    return true
});

let getDuolingoCredsFromLocalStorage = () => {
    return new Promise(
        (resolve, reject) => {
            chrome.storage.sync.get(["url", "headers"], result => {
                if (!result) reject(error);
                resolve(result);
            })
        }
    );
};

async function fetchDuolingoDictionaryOverview(url = '', headers = {}) {
    console.log("fetchDuolingoDictionaryOverview call started", url, headers)
    const response = await fetch(url, {headers: headers});
    return response.json(); // parses JSON response into native JavaScript objects
}

async function fetchDictionaryPage(headers, lexeme_id, from_language_id) {
    const url = `https://www.duolingo.com/api/1/dictionary_page?lexeme_id=${lexeme_id}&use_cache=true&from_language_id=${from_language_id}`
    return fetch(url, {headers: headers}).then(result => result.json())

}

async function fetchFromDuoLingo(request) {
    const {url, headers} = await getDuolingoCredsFromLocalStorage()

    let dictionaryOverview = await fetchDuolingoDictionaryOverview(url, headers)
    const from_language = dictionaryOverview.from_language
    const learning_language = dictionaryOverview.learning_language
    // let's not overload duolingo API :)
    let delay = 0;
    const delayIncrement = 300;

    console.log("dictionaryOverview", dictionaryOverview)
    var promises = dictionaryOverview['vocab_overview'].slice(0, 20)
        .map((wordOverview, index) => {
                if (index % 10 === 0) {
                    console.log("Fetching words from Duo: Processing item ", index, "/", dictionaryOverview['vocab_overview'].length)
                }
                delay += delayIncrement;
                return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
                    fetchDictionaryPage(headers, wordOverview.lexeme_id, from_language)
                )


            }
        )
    return await Promise.all(promises)
}




function sendBrowserNotification(result) {
    const options = {
        title: `Import finished!`,
        message: `Added ${result.addedNotes}/${result.totalNotes} new words to to ${result.deckName}`,
        iconUrl: 'images/owl.png',
        type: 'basic'
    }

    chrome.notifications.create('', options);
    return result
}


(async function () {
    const networkFilters = {
        urls: [
            "*://duolingo.com/vocabulary/overview*",
            "*://www.duolingo.com/vocabulary/overview*"
        ]
    };
    // intercept request to load duolingo vocabulary, save the request url and headers in localstorage
    // this data will be used to reproduce query from extension side to get vocabulary data
    // due to the fact that webRequest doesn't have access to response body
    chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
        const headers = details.requestHeaders.reduce((obj, item) => (obj[item.name] = item.value, obj), {});
        chrome.storage.sync.set({
            url: details.url,
            headers: headers,
        }, function () {
            console.log(`Updated duolingo creds: url: ${details.url}, headers:`, headers);
        });
    }, networkFilters, ["requestHeaders"]);
}());