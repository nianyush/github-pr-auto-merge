(function () {
    let autoMergeInterval = null;

    // Function to get the tab name (PR title)
    function getPRTitle() {
        return document.title || 'Unknown PR'; // Return the title of the PR page, or 'Unknown PR' if it can't be found
    }

    // Function to store the auto-merge state and reload flag for a specific action
    function saveAutoMergeState(isRunning, reloadKey = '', hasReloaded = false) {
        let data = { autoMergeRunning: isRunning };
        if (reloadKey) {
            data[reloadKey] = hasReloaded; // Save the reload state for the specific action
        }
        chrome.storage.local.set(data, () => {
            const prTitle = getPRTitle();
            console.log(`PR "${prTitle}": Auto-merge state saved with ${reloadKey}: ${hasReloaded}`);
        });
    }

    function updateBaseBranch() {
        const prTitle = getPRTitle();
        const updateButton = document.querySelector('.btn-group-update-merge');
        if (updateButton) {
            if (updateButton.disabled) {
                console.log(`PR "${prTitle}": Update branch button is currently disabled`);
                return;
            }
            updateButton.click();
            console.log(`PR "${prTitle}": Base branch updated`);

            setTimeout(() => {
                location.reload(); // Refresh the page
            }, 3000); // Delay to ensure the base branch is updated properly
        } else {
            console.log(`PR "${prTitle}": Update branch button not found`);
        }
    }

    function mergePR() {
        const prTitle = getPRTitle();
        // More specific query selector to target only the "Squash and merge" button
        const mergeButton = document.querySelector('.merge-box-button.btn-group-squash');

        if (mergeButton) {
            if (!mergeButton.disabled) {
                mergeButton.click();
                setTimeout(() => {
                    const confirmButton = document.querySelector('.js-merge-commit-button[value="squash"]');
                    if (confirmButton) {
                        confirmButton.click();
                    }
                }, 2000);

                console.log(`PR "${prTitle}": PR merged via squash and merge`);
            } else {
                console.log(`PR "${prTitle}": Merge button is currently disabled`);
            }
        } else {
            console.log(`PR "${prTitle}": Squash and merge button not found`);
        }
    }

    // Function to reload the page before performing any auto-merge actions
    function reloadAndCheck() {
        const prTitle = getPRTitle();
        console.log(`PR "${prTitle}": Reloading page before auto-merge check`);

        // Perform update base branch and merge checks after the page reloads
        setTimeout(() => {
            updateBaseBranch();
            mergePR();
        }, 3000); // Delay to ensure the page reloads properly
    }

    function startAutoMerge() {
        const prTitle = getPRTitle();
        if (!autoMergeInterval) {
            autoMergeInterval = setInterval(() => {
                reloadAndCheck(); // Reload the page before each auto-merge check
            }, 10000); // Adjust the interval as needed
            saveAutoMergeState(true); // Save that auto-merge has started
            console.log(`PR "${prTitle}": Auto merge started`);
        }
    }

    function stopAutoMerge() {
        const prTitle = getPRTitle();
        if (autoMergeInterval) {
            clearInterval(autoMergeInterval);
            autoMergeInterval = null;
            saveAutoMergeState(false); // Save that auto-merge has stopped
            console.log(`PR "${prTitle}": Auto merge stopped`);
        }
    }

    // Listen for messages from popup.js
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        const prTitle = getPRTitle();
        if (request.action === 'start') {
            console.log(`PR "${prTitle}": Starting auto-merge process`);
            startAutoMerge();
        } else if (request.action === 'stop') {
            console.log(`PR "${prTitle}": Stopping auto-merge process`);
            stopAutoMerge();
        }
    });

    // When the script is loaded (after a reload), check if auto-merge was running
    chrome.storage.local.get('autoMergeRunning', (data) => {
        if (data.autoMergeRunning) {
            console.log(`PR "${getPRTitle()}": Resuming auto-merge process after reload`);
            startAutoMerge(); // Resume auto-merge if it was running before the reload
        }
    });
})();
