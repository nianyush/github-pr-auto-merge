(function () {
    let autoMergeInterval = null;

    function updateBaseBranch() {
        const updateButton = document.querySelector('.btn-group-update-merge');
        if (updateButton) {
            updateButton.click();
            console.log('Base branch updated');

            // Refresh the page after a delay to allow the update to complete
            setTimeout(() => {
                location.reload(); // Refresh the page
            }, 3000); // 3-second delay to ensure the update is applied
        } else {
            console.log('Update branch button not found');
        }
    }

    function mergePR() {
        const mergeButton = document.querySelector('.merge-box-button');
        if (mergeButton) {
            if (!mergeButton.disabled) {
                mergeButton.click();
                console.log('PR merged via squash and merge');

                // Refresh the page after a delay to allow the merge to complete
                setTimeout(() => {
                    location.reload(); // Refresh the page after merging the PR
                    checkIfPRMerged(); // Check if PR is merged after the reload
                }, 3000); // 3-second delay for merge action to complete
            } else {
                console.log('Merge button is currently disabled');
            }
        } else {
            console.log('Squash and merge button not found');
        }
    }

    // Function to check if the PR is already merged by looking for the "Merged" status
    function checkIfPRMerged() {
        const mergedStatus = document.querySelector('.State--merged');
        if (mergedStatus) {
            console.log('PR is merged. Stopping auto-merge process.');
            stopAutoMerge(); // Stop the auto-merge process
        } else {
            console.log('PR is not merged yet.');
        }
    }

    function startAutoMerge() {
        if (!autoMergeInterval) {
            autoMergeInterval = setInterval(() => {
                updateBaseBranch();
                mergePR();
            }, 10000); // Adjust the interval as needed
            console.log('Auto merge started');
        }
    }

    function stopAutoMerge() {
        if (autoMergeInterval) {
            clearInterval(autoMergeInterval);
            autoMergeInterval = null;
            console.log('Auto merge stopped');
        }
    }

    // Listen for messages from popup.js
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'start') {
            startAutoMerge();
        } else if (request.action === 'stop') {
            stopAutoMerge();
        }
    });
})();
