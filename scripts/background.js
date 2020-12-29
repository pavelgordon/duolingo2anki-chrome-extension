'use strict';


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const {action, deckName, modelName, tagString} = request
    if (action !== "addNotes") {
        return false
    }
    fetchFromDuoLingo(request)
        .then(notes =>
            createDeck(deckName)
                .then(() => createModel(modelName))
                .then(() => addNotes(notes))
                .then(ankiResponse => (
                    {
                        notesIds: ankiResponse.result,
                        deckName: deckName,
                        addedNotes: ankiResponse.result.filter(e => e != null).length,
                        totalNotes: ankiResponse.result.length,
                        error: ankiResponse.error
                    })
                )
                .then(result => sendNotification(result))
                .then(result => sendResponse(result)))
    return true
});

//Note~card
function buildAnkiNote(deckName, modelName, learningWord, translation, tts, tags = "") {
    const ttsFilename = tts.substring(tts.lastIndexOf('/') + 1)

    return {
        deckName: deckName,
        modelName: modelName,
        fields: {
            Word: learningWord,
            Picture: '',
            "Extra Info": translation
        },
        options: {
            "allowDuplicate": true,
            "duplicateScope": "deck"
        },
        tags: tags
            ? tags.split(',').map(s => s.trim())
            : []
        ,
        audio: [{
            url: tts,
            filename: ttsFilename,
            fields: [
                "Pronunciation"
            ]
        }]

    }
}


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
    console.log("fetchDuolingoDictionaryOverview", url, headers)
    const response = await fetch(url, {headers: headers});
    return response.json(); // parses JSON response into native JavaScript objects
}

async function fetchDictionaryPage(headers, lexeme_id, from_language_id) {
    const url = `https://www.duolingo.com/api/1/dictionary_page?lexeme_id=${lexeme_id}&use_cache=true&from_language_id=${from_language_id}`
    return fetch(url, {headers: headers}).then(result => result.json())

}

async function fetchFromDuoLingo(request) {
    const {action, deckName, modelName, tagString} = request
    const {url, headers} = await getDuolingoCredsFromLocalStorage()

    const dictionaryOverview = await fetchDuolingoDictionaryOverview(url, headers)
    const from_language = dictionaryOverview.from_language
    const learning_language = dictionaryOverview.learning_language
    // let's not overload duolingo API :)
    let delay = 0;
    const delayIncrement = 300;

    var promises = dictionaryOverview['vocab_overview']
        .map(wordOverview => {
                delay += delayIncrement;
                return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
                    fetchDictionaryPage(headers, wordOverview.lexeme_id, from_language)
                        .then(wordInfo => {

                            var ankiNote = buildAnkiNote(deckName, modelName, wordInfo.word, wordInfo.translations, wordInfo.tts, tagString);
                            console.log(ankiNote)
                            return ankiNote
                        })
                )


            }
        )
    return await Promise.all(promises)
}


function createDeck(deckName) {
    return callAnkiConnect("createDeck", {deck: deckName})
}

function createModel(modelName) {
    return callAnkiConnect("createModel", {
        modelName: modelName,
        inOrderFields: ["Word", "Picture", "Extra Info", "Pronunciation"],
        css: `
          .card {
            font-family: arial;
            font-size: 20px;
            text-align: center;
            color: black;
            background-color: white;
          }

          .card1 { background-color: #FFFFFF; }
          .card2 { background-color: #FFFFFF; }`,
        cardTemplates: [
            {
                Name: "Comprehension Card",
                Front: `{{Word}}
{{#Pronunciation}}
<br>
\t<font color=blue>
\t{{Pronunciation}}
\t</font>
\t{{/Pronunciation}}
<br>`,
                Back:
                    `{{FrontSide}}

<hr id=answer>

{{Picture}}

<br>

<span style="color:grey">{{Extra Info}}</span>
<br>`
            },
            {
                Name: "Production Card",
                Front: `{{FrontSide}}

{{Picture}}`,
                Back:
                    `{{Picture}}
<hr id=answer>
{{Word}}
{{#Pronunciation}}
<br>
{{Pronunciation}}{{/Pronunciation}}
<br>

<span style="color:grey">{{Extra Info}}</span>
<br>`
            }
        ]
    })

}

function addNotes(notes) {
    console.log("notes", notes)
    return callAnkiConnect("addNotes", {notes: notes})
}

async function callAnkiConnect(action, params = {}, version = 6,) {
    const response = await fetch('http://127.0.0.1:8765',
        {
            method: 'POST',
            body: JSON.stringify({action, version, params})
        })

    return response.json()
}

function sendNotification(result) {
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