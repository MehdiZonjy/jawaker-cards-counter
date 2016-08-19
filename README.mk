# Jawaker Cards Counter

Jawaker Cards Counter is a Chrome Extension that counts played cards inside [Jawaker](https://jawaker.com/) game.



### How To Build
1. install node modules
```
npm install
```
2. build scripts using webpack
```
npm run build
```
3. you should now have 2 scripts inside dist folder
4. add extension to chrome using [by following this guide](https://developer.chrome.com/extensions/getstarted#unpacked)






### How To Use
1. Add the extension to chrome by [following this guide](https://developer.chrome.com/extensions/getstarted#unpacked)
2. you should have the extension icon now added and showing next url textbox
3. log into Jawaker and join a game
4. make sure that Jawaker is the currently active tab 
5. Open the extension and click on Inject (this will inject cards counting script into Jawaker page)
6. every time a card is played you can click on the Extension button and  the popup window  should show which cards hasn't been played yet.



**Note:** after you finish a game either click on the delete button inside the extension popup window, or referesh the browser.

