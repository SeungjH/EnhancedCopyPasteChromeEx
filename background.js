
//This is the background script that listens to the commands from the Content.js

chrome.commands.onCommand.addListener((command) => { //command is the message sent from Content.js and is either "copy-1||2" or "paste-1||2"
    console.log(`Command received: ${command}`);
  
    const index = parseInt(command.charAt(command.length - 1));  // 1 or 2 depending on the command
    console.log(index);

    //COPY
    if (command.startsWith("copy")) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
          console.log("No active tab found.");
          return;
        }
        

        //This makes the code shit (injects this js file only to the first opened tab)
        //CHANGE THIS
        //Also it is not accepting when index is 0. 
        const tabId = tabs[0].id;
  
        chrome.scripting.executeScript({
          target: { 
            tabId 
        },
          func: () => window.getSelection().toString(),
        }, (result) => {

          if (chrome.runtime.lastError) {
            console.log(`Scripting error: ${chrome.runtime.lastError.message}`);
          } 
          else {
            const copiedText = result[0]?.result;
            console.log(`Copied text: ${copiedText}`);

            if (copiedText) {
                chrome.storage.local.get(['copiedTexts'], ({ copiedTexts = [] }) => {
                  copiedTexts[index] = copiedText;
                  chrome.storage.local.set({ copiedTexts });
                  
                });
            }
          }
        });
      });
    } 

    //PASTE
    else if (command.startsWith("paste")) {
      chrome.storage.local.get(['copiedTexts'], ({ copiedTexts = [] }) => {
        const textToPaste = copiedTexts[index];

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.scripting.executeScript({
            //I need to find a way to not use tabs[0].id so that it can work with multiple tabs or every tabs
            target: { 
              tabId: tabs[0].id 
            },
            //gotta change this part of the logic
            func: (text) => {
              const active = document.activeElement;
              if (active && active.value !== undefined) {
                active.value += text;

              } else if (active && active.textContent !== undefined) {
                active.textContent += text;
              }
            },
            args: [textToPaste]
          });
        });
      });
    }
  });