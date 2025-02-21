// This content script captures the text of the page and places it in the content script
document.addEventListener("keydown", 
    function (e) {
        console.log("keydown event");

        // Check if Ctrl is pressed and the key is between 1 and 9
        if (e.ctrlKey && e.key >= "1" && e.key <= "9") {
            console.log("eeeee");
            e.preventDefault();  // Prevent default behavior

            // Convert the key to an index
            let index = parseInt(e.key);
            chrome.runtime.sendMessage({ type: "copy", index });
        }
    }
);