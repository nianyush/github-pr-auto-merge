// Listener for storage changes to enable/disable auto-merge
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.enabled) {
        // Check if the new value of 'enabled' is true or false
        const autoMergeEnabled = changes.enabled.newValue;

        // Log changes for debugging purposes
        console.log(`Auto-merge has been ${autoMergeEnabled ? 'enabled' : 'disabled'}.`);

        // If auto-merge is enabled, inject the content script into the active tab
        if (autoMergeEnabled) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length === 0) {
                    console.error('No active tab found.');
                    return;
                }

                const tab = tabs[0];

                // Check if the current tab is a GitHub PR page
                if (tab.url.includes('github.com') && tab.url.includes('/pull/')) {
                    console.log('Executing content.js in the active GitHub PR tab.');

                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    }, () => {
                        if (chrome.runtime.lastError) {
                            console.error(`Error injecting script: ${chrome.runtime.lastError.message}`);
                        } else {
                            console.log('content.js has been successfully injected.');
                        }
                    });
                } else {
                    console.log('Active tab is not a GitHub PR page.');
                }
            });
        } else {
            console.log('Auto-merge disabled, no script will be injected.');
        }
    }
});
