//Listens to commands from Content.js and handles copy-paste operations using chrome.storage
chrome.commands.onCommand.addListener((command) => {
  console.log(`Command received: ${command}`);

  const index = parseInt(command.charAt(command.length - 1), 10); //extracts slot number and parse as base 10 (decimal). copy-1 will extract 1.
  if (isNaN(index)) {
    console.error("invalid index");
    return;
  }

  //COPY
  if (command.startsWith("copy")) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) {
        console.error("no active tab found");
        return;
      }

      chrome.scripting.executeScript({
        //allFrames ensures selections in iframes like google docs are captured
        target: {
          allFrames: true, tabId: tabs[0].id //tabId is crucial for Chrome to know where to execute the script
        },
        func: () => window.getSelection().toString()
      }, 
      (result) => {
        //exiting when error encountered
        if (chrome.runtime.lastError) {
          console.error(`scripting error: ${chrome.runtime.lastError.message}`);
          return;
        }

        const copiedText = result[0]?.result; //? will prevent error if result[0] is undefined or null
        if (copiedText) {
          chrome.storage.local.get(['copiedTexts'], ({ copiedTexts = [] }) => {
            copiedTexts[index] = copiedText;

            //save the updated clipboard array back to storage
            chrome.storage.local.set({ copiedTexts }, () => {
              console.log(`Text copied to slot ${index}:`, copiedText);
            });
          });
        }
        else {
          console.warn("no text selected to copy");
        }
      }
    );
    });
  }

  //PASTE
  else if (command.startsWith("paste")) {
    //retrieve existing copied texts, defaulting to an empty array if none exist
    chrome.storage.local.get(['copiedTexts'], ({ copiedTexts = [] }) => {
      const textToPaste = copiedTexts[index];
      if (!textToPaste) {
        console.warn(`No text found in slot ${index} to paste.`);
        return;
      }
      //checking tabs exist
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs.length) {
          console.error("no active tab found");
          return;
        }
        //inject a script into the active tab to paste the text into the focused element
        chrome.scripting.executeScript({
          target: {
             allFrames: true, tabId: tabs[0].id 
          },

          //need more case to handle google docs etc...
          func: (text) => {
            const activeElement = document.activeElement; //the focused element

            //case 1: Input or textarea fields (e.g., forms, search bars)
            if (activeElement && activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
              activeElement.value += text;
            } 
            //case 2: Content-editable elements
            else if (activeElement && activeElement.isContentEditable) {
              document.execCommand('insertText', false, text);
            } 
            //no suitable paste area found
            else {
              console.warn("cannot paste here");
            }
          },
          
          args: [textToPaste],
        }, () => {
          if (chrome.runtime.lastError) {
            console.error(`Paste failed: ${chrome.runtime.lastError.message}`);
          } else {
            console.log(`Pasted text from slot ${index}`);
          }
        });
      });
    });
  }
});
