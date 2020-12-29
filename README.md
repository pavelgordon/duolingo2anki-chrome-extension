<p align="center">
<img src="https://i.imgur.com/iyrxIH4.png" width="250" alt="duolingo-to-anki">
</p>
<h1 align="center">
Duolingo2Anki
</h1>
<p align="center">
Chrome Extension which imports and syncs Duolingo vocabulary to Anki.
</p>

## What is it  
[`Duolingo`](https://www.duolingo.com/) - Duolingo is an American language-learning website and mobile app.  
[`Anki`](https://apps.ankiweb.net/) - Anki is a free and open-source flashcard program that utilizes spaced repetition. Spaced repetition has been shown to increase rate of memorization.  
[`Anki Desktop`](https://apps.ankiweb.net/) - computer version of Anki.  
[`AnkiConnect`](https://foosoft.net/projects/anki-connect/) - addon for Anki Desktop.  
## How to use
### TL;DR:
1. Install this extension([latest release](https://github.com/pavelgordon/babbel2anki-chrome-extension/releases/tag/v0.0.1))
1. Open _Anki Desktop_ with [AnkiConnect](https://foosoft.net/projects/anki-connect/) addon.
1. Update AnkiConnect CORS policy(reasoning explained below):  Anki Desktop -> Tools -> Addons -> AnkiConnect -> Config->
```"webCorsOriginList": ["*"]```
1. Open [`Words`](https://www.duolingo.com/words) on Duolingo with any language of your choice.
1. Click `Sync current page with Anki` button. 
1. Check your `Anki Desktop` for new deck `My awesome deck` with all your words from Duolingo.
### More detailed guide
Install [`AnkiConnect`](https://foosoft.net/projects/anki-connect/). Now you have to allow AnkiConnect to receive calls from this extension via setting `webCorsOriginList`(Anki Desktop -> Tools -> Addons -> AnkiConnect -> Config): 
- `"webCorsOriginList": ["*"]` to allow calls from any resourse
- `"webCorsOriginList": ["chrome-extension://hdihhgoahdggcdndkepomdlbjhngghig"]` to allow calls only from this extension. Replace `hdihhgoahdggcdndkepomdlbjhngghig` with ID from `chrome://extensions`
![image](https://user-images.githubusercontent.com/2462444/80809999-2b538980-8bc3-11ea-9dcc-3bb347e75fbb.png)  

Now with `Anki Desktop` with `AnkiConnect` addon being set up: 
1. Go to: `chrome://extensions`, enable Developer mode and load `app` as an unpacked extension. Installation via chrome web store WIP :)
1. Optional: Set custom deck name, there is a popup with settings. Auto-sync mode in work.

![image](https://i.imgur.com/anAxetJ.png)
1. Login to Duolingo and open [`Words`](https://www.duolingo.com/words). It opens a review section of a selected language. 
- `Sync with Anki` is a new button coming from `Duolingo2Anki` which allows to manually sync to configured deck.
- ~~`auto-sync` enabled option performs sync to configured deck every 30 seconds.~~ WIP
![image](https://i.imgur.com/BUDbm2G.png)
1. `Duolingo2Anki` will:
    -  Create a deck with name `My awesome deck`(if such deck already exists, nothing happens)
    -  Create a card template (model) with name `Duolingo model` and all necessary fields (if such model already exists, nothing happens)
    -  Add words from current open page in `My vocab` words to deck `My awesome deck`. Adds only new words (which are not in the deck).  
    -  Shows notification about an amount of **new** words which were saved in Anki (e.g. if notification says that new words/total words is 10/50 - means that other 40 words are already in Anki deck).
![image](https://i.imgur.com/n406kZV.jpg)
1. Check Anki Desktop for `My awesome deck`: 
![image](https://i.imgur.com/cdwCZ67.png)
1. Check Dev Tools Console for any errors/debug messages.  

And now, the killer feature -  owl spins during word loading. Isn't that awesome?  

![image](https://i.imgur.com/ATG2JET.gif)

## Things to do
- ~~Maximum size of items is 100, and user has to click on pagination multiple times. Check if possible to:~~
  - ~~request 1k+ words at the same time or~~
  - ~~use pagination to fetch all words~~
 - ~~Button to manually sync(add to review html page)~~
 - ~~Checkbox to temporary disable auto-sync~~
- Rethink AutoSync mechanism
- Merging vocabularies(right now extension takes full vocabulary from Duolingo and sends it to Anki, even it was added before, which is suboptimal from performance point)
- Better workflow for multiple decks
- Custom Sync server
- Error handling if AnkiConnect is not installed
  
## Links
- [Anki](https://apps.ankiweb.net)
- [AnkiConnect](https://foosoft.net/projects/anki-connect/)
- [Github Primer](https://primer.style/css/getting-started])
- [Google Chrome Extension Development](http://developer.chrome.com/extensions/devguide.html)
- [generator-chrome-extension](https://github.com/yeoman/generator-chrome-extension)
- [Intercepting body requests in chrome extension](https://medium.com/better-programming/chrome-extension-intercepting-and-reading-the-body-of-http-requests-dd9ebdf2348b)
- [Icons used from](https://www.flaticon.com/)



