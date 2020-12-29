'use strict';


//waits for DOM to load and then injects `Sync with Anki` button into web page.
function injectSyncButton() {

    if (document.body && document.head && document.querySelectorAll('[data-test="home-nav"]')[0]) {
        var head = document.getElementsByTagName('head')[0];
        var s = document.createElement('style');
        s.setAttribute('type', 'text/css');
        if (s.styleSheet) {   // IE
            s.styleSheet.cssText = css;
        } else {                // the world
            s.appendChild(document.createTextNode("@keyframes spin {\n" +
                "  0% { transform: rotate(0deg); }\n" +
                "  100% { transform: rotate(360deg); }\n" +
                "}"));
        }
        head.appendChild(s);


        const elem = document.querySelectorAll('[data-test="home-nav"]')[0]
        const parent = elem.parentElement
        const clone = parent.cloneNode(true)
        const spaceBetweenElements = parent.nextElementSibling.cloneNode(true)
        spaceBetweenElements.setAttribute("id", "spaceBetweenElements")
        console.log("spaceBetweenElements", spaceBetweenElements)
        clone.firstChild.removeAttribute("href")
        clone.firstChild.firstChild.childNodes[1].textContent = "Sync with Anki"
        clone.firstChild.firstChild.firstChild.firstChild.setAttribute("src", "https://i.imgur.com/5w62sK5.png")
        clone.firstChild.firstChild.firstChild.firstChild.id="owl_img"



        clone.addEventListener('click', () => {
            if(document.getElementById("owl_img").style.animation!==""){
                console.log("There is already loading process. Please wait until it will be finished")
                return
            }
            document.getElementById("owl_img").style.animation = "spin 2s linear infinite"
            syncToAnki()
        })
        parent.parentElement.insertBefore(spaceBetweenElements, parent.parentElement.childNodes[1])
        parent.parentElement.insertBefore(clone, parent.parentElement.childNodes[2])

    } else {
        requestIdleCallback(injectSyncButton);
    }
}

requestIdleCallback(injectSyncButton);


function syncToAnki() {
    sendDataToAnki()
}


async function sendDataToAnki() {
    const deckName = await getOrInitProperty('deckName', 'My awesome deck')
    const modelName = await getOrInitProperty('modelName', 'Duolingo card')
    const tagString = await getOrInitProperty('tagString', '')

    const message = {
        action: "addNotes",
        deckName: deckName,
        modelName: modelName,
        tagString: tagString
    }
    chrome.runtime.sendMessage(message, response => {
        document.getElementById("owl_img").style.animation = ""

        console.log(`Added ${response.addedNotes}/${response.totalNotes} new words to ${deckName} using model ${modelName} with tags (${tagString})`);
    });
}


function getOrInitProperty(property, defaultValue) {
    return new Promise((resolve) => {
            chrome.storage.sync.get([property], result => {
                if (result[property] === undefined || result[property] == null) {
                    result[property] = defaultValue
                    chrome.storage.sync.set({property: defaultValue},
                        () => console.log(`initiated property ${property} with value ${defaultValue}`));
                }
                resolve(result[property])
            })
        }
    )
}
