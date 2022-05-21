// model - card template
// notes - single instance of card e.g.
// Vatten->Water is a different note and
// Water->Vatten is a different note

function buildAnkiNotes(deckName, modelName, tagString, notes) {
    console.log("duo words", notes)
    const ankiNotes = notes.map(wordInfo => {
        return buildAnkiNote(deckName, modelName, tagString, wordInfo)
    })
    console.log("anki notes", ankiNotes)
    return ankiNotes

}

//Note~card
function buildAnkiNote(deckName, modelName, tags = "", wordInfo) {
    console.log("buildAnkiNote ", wordInfo)

    var note = {
        deckName: deckName,
        modelName: modelName,
        fields: {
            "Word": wordInfo.word,
            "Picture": "",
            "Extra Info": wordInfo.translations
        },
        options: {
            "allowDuplicate": false
        },
        tags: tags
            ? tags.split(',').map(s => s.trim())
            : []
    }

    if (wordInfo.lexeme_image) {
        const pictureFileName = wordInfo.lexeme_image.substring(wordInfo.lexeme_image.lastIndexOf('/') + 1)
        note.picture = [{
            url: wordInfo.lexeme_image,
            filename: pictureFileName + ".svg",
            fields: [
                "Picture"
            ]
        }]
    }

    if (wordInfo.tts) {
        const ttsFilename = wordInfo.tts.substring(wordInfo.tts.lastIndexOf('/') + 1)
        note.audio = [{
            url: wordInfo.tts,
            filename: ttsFilename,
            fields: [
                "Pronunciation"
            ]
        }]
    }
    return note;
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

function addAnkiNotes(notes) {
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
