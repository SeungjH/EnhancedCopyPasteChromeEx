# EnhancedCopyPasteChromeEx
Enhanced Copy n Paste Chrome Extension
//COMMENTS FOR manifest.json as .json files does not support commenting by default, the below line is the comment for it:
//ctrl+shift+1/2/6/7 may be difficult for windows users as the shortcut was designed for mac key placement. 
//Listens to commands from Content.js and handles copy-paste operations using chrome.storage



Limitations:
    - won't work on apps other than Chrome
    - won't work on chrome:// pages such as chrome://extensions (chrome blocked it for security reasons)
    - won't work on URLs



2/19
- Moved files to github

Need to Fix (todomorrow):
    - copy and pasting only works on the first tab that was opened.
    - first slot of copy and paste does not work.
    - paste can happened everywhere: it can change existing text. 
    - also, delete console.log("eee") and other stuff after debugging



2/21

Fixed: 
    - works on multiple tabs
    - copy and paste works
Not Fixed: 
    - won't work on other chrome windows
    - doesn't work on google docs
    - create a popoup page
    - double clicking the word and highlighting and then pasting doesn't work



2/24

Fixed: 
    - now works on other chrome windows
Not Fixed: 
    - not working on https://my.wisc.edu/web/expanded 's search bar. Look into what text area it uses
    - doesn't work on google docs
    - create a popoup page
    - double clicking the word and highlighting and then pasting doesn't work

    
3/11

It turns out that I cannot access text in iFrame for security reasons; so for now, it cannot change texts in google docs