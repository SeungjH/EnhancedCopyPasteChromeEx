let activeTabId = null; //stores the currently active tab id

//track when the active tab changes (tab switching)
chrome.tabs.onActivated.addListener((activeInfo) => {
    activeTabId = activeInfo.tabId; //updates the active tab id
    console.log(`active tab is now : ${activeTabId}`);
});

//track when the active window changes
chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        activeTabId = null; //reset if no active window (minimized or closed)
        return;
    }
    chrome.tabs.query({ active: true, windowId }, (tabs) => {
        if (tabs.length > 0) {
            activeTabId = tabs[0].id;
            console.log(`active tab is now: ${activeTabId}`);
        }
    });
});

//listen to command and handle copy-paste operations
chrome.commands.onCommand.addListener((command) => {
    console.log(`command: ${command}`);
    //extracts slot number and parse as base 10 (decimal). copy-1 will extract 1.
    const index = parseInt(command.charAt(command.length - 1), 10); 

    //copy handler
    //: codes for copy and paste are changed from using chrome.tabs.query to using activeTabId (solution to using multiple windows)
    if (command.startsWith("copy")) { //"copy" is in lowercase since Chrome always passes commands in lowercase
        if (!activeTabId) {
            console.error("no active tabs");
            return;
        }
        chrome.scripting.executeScript({
          target: { allFrames: true, tabId: activeTabId },
          func: () => {
              //check if we're in google docs                       
              if (document.location.href.includes("docs.google.com")) {
                  document.execCommand('copy'); // use execCommand to copy in google docs
                  return "copiedText";
              }
              return window.getSelection().toString(); // normal copying for other sites
          }
        }, 
        (result) => {
            if (chrome.runtime.lastError) {
                console.error(`error: ${chrome.runtime.lastError.message}`);
                return;
            }
            const copiedText = result[0]?.result;
            if (copiedText) {
                chrome.storage.local.get(['copiedTexts'], ({ copiedTexts = [] }) => {
                    copiedTexts[index] = copiedText;
                    chrome.storage.local.set({ copiedTexts }, () => {
                        console.log(`text copied to slot ${index}:`, copiedText);
                    });
                });
            } else {
                console.warn("no selected texts to copy");
            }
        });
    }

    //paste handler
    else if (command.startsWith("paste")) {
        if (!activeTabId) {
            console.error("no active tab");
            return;
        }

        chrome.storage.local.get(['copiedTexts'], ({ copiedTexts = [] }) => {
            const textToPaste = copiedTexts[index];
            //when no text found to copy
            if (!textToPaste) {
                return;
            }

            chrome.scripting.executeScript({
                target: { allFrames: true, tabId: activeTabId },
                func: (text) => {
                    const activeElement = document.activeElement;
                    // if in google docs, use execCommand to insert text
                    if (document.location.href.includes("docs.google.com")) {
                        document.execCommand('insertText', false, text);
                        return;
                    }
                    
                    //case 1: Input or textarea fields (e.g., forms, search bars)
                    if (activeElement && (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)) {
                        activeElement.value += text;
                    }
                    //case 2: Content-editable elements
                    else if (activeElement && activeElement.isContentEditable) {
                        document.execCommand('insertText', false, text);
                    }
                    //no pastable area found
                    else {
                        console.warn("no ableo paste hereo");
                    }
                },
                args: [textToPaste],
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error(`error : ${chrome.runtime.lastError.message}`);
                } else {
                    console.log(`pasted from slot : ${index}`);
                }
            });
        });
    }
});