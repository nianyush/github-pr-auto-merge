// Listener for storage changes to enable/disable auto-merge
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.enabled) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (tab.url.includes('github.com') && tab.url.includes('/pull/')) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
            }
        });
    }
});
