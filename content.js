(function () {
    let autoMergeInterval = null;

    // Function to get the tab name (PR title)
    function getPRTitle() {
        return document.title || 'Unknown PR'; // Return the title of the PR page, or 'Unknown PR' if it can't be found
    }

    function updateBaseBranch() {
        const prTitle = getPRTitle();
        const updateButton = document.querySelector('.btn-group-update-merge');
        if (updateButton) {
            updateButton.click();
            console.log(`PR "${prTitle}": Base branch updated`);

            // Refresh the page after a delay to allow the update to complete
            setTimeout(() => {
                location.reload(); // Refresh the page
            }, 3000); // 3-second delay to ensure the update is applied
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
                console.log(`PR "${prTitle}": PR merged via squash and merge`);

                // Refresh the page after a delay to allow the merge to complete
                setTimeout(() => {
                    location.reload(); // Refresh the page after merging the PR
                    checkIfPRMerged(); // Check if PR is merged after the reload
                }, 3000); // 3-second delay for merge action to complete
            } else {
                console.log(`PR "${prTitle}": Merge button is currently disabled`);
            }
        } else {
            console.log(`PR "${prTitle}": Squash and merge button not found`);
        }
    }

    // Function to check if the PR is already merged by looking for the "Merged" status
    function checkIfPRMerged() {
        const prTitle = getPRTitle();
        const mergedStatus = document.querySelector('.State--merged');
        if (mergedStatus) {
            console.log(`PR "${prTitle}": PR is merged. Stopping auto-merge process.`);
            stopAutoMerge(); // Stop the auto-merge process
        } else {
            console.log(`PR "${prTitle}": PR is not merged yet.`);
        }
    }

    // Function to reload the page before performing any auto-merge actions
    function reloadAndCheck() {
        const prTitle = getPRTitle();
        console.log(`PR "${prTitle}": Reloading page before auto-merge check`);

        // Reload the page and then perform the update/merge check after the reload
        setTimeout(() => {
            location.reload(); // Refresh the page

            // Perform update base branch and merge checks after the page reloads
            setTimeout(() => {
                updateBaseBranch();
                mergePR();
            }, 3000); // Delay to ensure the page reloads properly
        }, 1000); // Delay to initiate the reload
    }

    function startAutoMerge() {
        const prTitle = getPRTitle();
        if (!autoMergeInterval) {
            autoMergeInterval = setInterval(() => {
                reloadAndCheck(); // Reload the page before each auto-merge check
            }, 10000); // Adjust the interval as needed
            console.log(`PR "${prTitle}": Auto merge started`);
        }
    }

    function stopAutoMerge() {
        const prTitle = getPRTitle();
        if (autoMergeInterval) {
            clearInterval(autoMergeInterval);
            autoMergeInterval = null;
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
})();
