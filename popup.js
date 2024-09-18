// Progress Bar Settings
const CHECK_INTERVAL_SECONDS = 10; // How often to check for status (in seconds)
let progressBarInterval = null;

// Function to animate the progress bar
function startProgressBar() {
    const progressBar = document.getElementById('progressBar');
    let elapsedTime = 0;
    const totalTime = CHECK_INTERVAL_SECONDS * 1000; // Convert seconds to milliseconds

    progressBar.style.width = '0%'; // Reset the progress bar

    progressBarInterval = setInterval(() => {
        elapsedTime += 1000; // Increase by 1 second (1000 ms)

        const progressPercentage = (elapsedTime / totalTime) * 100;
        progressBar.style.width = progressPercentage + '%';

        if (elapsedTime >= totalTime) {
            // Reset the cycle after the total time
            elapsedTime = 0;
            progressBar.style.width = '0%';

            // Trigger status check on all enabled PRs
            checkPRStatusForEnabledTabs();
        }
    }, 1000); // Update the progress bar every second
}

// Function to check the status of enabled PRs (dummy function here)
function checkPRStatusForEnabledTabs() {
    console.log('Checking status of enabled PRs...');
    // Add logic to actually check the status of enabled PRs.
}

// Initialize the progress bar when the popup is opened
startProgressBar();

// Function to update the UI with the list of open PR tabs
function updateOpenPRTabsUI() {
    chrome.tabs.query({ url: "*://github.com/*/pull/*" }, (tabs) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
            const activeTabId = activeTabs[0]?.id;
            const enabledTabsList = document.getElementById('enabledTabsList');
            enabledTabsList.innerHTML = ''; // Clear the list before updating it

            if (tabs.length > 0) {
                chrome.storage.local.get('enabledTabIds', (result) => {
                    const enabledTabIds = result.enabledTabIds || [];

                    tabs.forEach((tab) => {
                        // Only show open PRs (filter out merged/closed PRs)
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            func: () => {
                                const statusElement = document.querySelector('[title="Status: Merged"], [title="Status: Closed"]');
                                return statusElement ? 'closed' : 'open';
                            }
                        }, (results) => {
                            if (results[0].result === 'open') {
                                const listItem = document.createElement('li');
                                listItem.classList.add('tab-item');

                                // Highlight active tab
                                if (tab.id === activeTabId) {
                                    listItem.classList.add('active-tab');
                                }

                                const title = document.createElement('span');
                                title.textContent = tab.title;

                                // Create dynamic enable/disable button
                                const actionButton = document.createElement('button');
                                if (enabledTabIds.includes(tab.id)) {
                                    actionButton.textContent = 'Disable';
                                    actionButton.addEventListener('click', (e) => {
                                        e.stopPropagation(); // Prevent the tab switch event from triggering
                                        disableAutoMergeForTab(tab.id);
                                    });
                                } else {
                                    actionButton.textContent = 'Enable';
                                    actionButton.addEventListener('click', (e) => {
                                        e.stopPropagation(); // Prevent the tab switch event from triggering
                                        enableAutoMergeForTab(tab.id);
                                    });
                                }

                                listItem.appendChild(title);
                                listItem.appendChild(actionButton);
                                enabledTabsList.appendChild(listItem);

                                // Add click event to switch to this tab when the list item is clicked
                                listItem.addEventListener('click', () => {
                                    chrome.tabs.update(tab.id, { active: true });
                                });
                            }
                        });
                    });
                });
            } else {
                const noTabsItem = document.createElement('li');
                noTabsItem.textContent = 'No open GitHub PR tabs';
                enabledTabsList.appendChild(noTabsItem);
            }
        });
    });
}

// Function to enable auto merge for a specific tab
function enableAutoMergeForTab(tabId) {
    chrome.storage.local.get('enabledTabIds', (result) => {
        let enabledTabIds = result.enabledTabIds || [];
        if (!enabledTabIds.includes(tabId)) {
            enabledTabIds.push(tabId);
            chrome.storage.local.set({ enabledTabIds }, () => {
                chrome.tabs.sendMessage(tabId, { action: 'start' });
                updateOpenPRTabsUI();
            });
        }
    });
}

// Function to disable auto merge for a specific tab
function disableAutoMergeForTab(tabId) {
    chrome.storage.local.get('enabledTabIds', (result) => {
        let enabledTabIds = result.enabledTabIds || [];
        enabledTabIds = enabledTabIds.filter((id) => id !== tabId);
        chrome.storage.local.set({ enabledTabIds }, () => {
            chrome.tabs.sendMessage(tabId, { action: 'stop' });
            updateOpenPRTabsUI();
        });
    });
}

// Disable auto-merge on all enabled tabs
document.getElementById('disableAllButton').addEventListener('click', () => {
    chrome.storage.local.get('enabledTabIds', (result) => {
        const enabledTabIds = result.enabledTabIds || [];
        enabledTabIds.forEach((tabId) => {
            chrome.tabs.sendMessage(tabId, { action: 'stop' });
        });
        chrome.storage.local.set({ enabledTabIds: [] }, () => {
            updateOpenPRTabsUI();
            alert('Auto merge disabled on all tabs.');
        });
    });
});

// Initialize the list of open PR tabs
updateOpenPRTabsUI();
